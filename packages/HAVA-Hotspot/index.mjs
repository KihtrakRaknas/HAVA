import chalk from 'chalk';
import express from 'express';
import bodyParser from 'body-parser';
import {BigNumber, ethers} from "ethers";
import * as readline from "readline-sync";
import * as fs from "fs";
import {createRequire} from "module";
import cors from "cors";
import fetch from 'node-fetch';

const require = createRequire(import.meta.url);
const {spawnSync} = require('child_process');
const havaAbi = require('./hava.json');

const app = express();
app.use(express.static('../captive/build'));
app.use(cors());
app.use(bodyParser.json());

const port = 8888;

let privateKey = null
try {
    privateKey = fs.readFileSync('./privateKey.txt', {encoding: 'utf8', flag: 'r'});
} catch (el) {
    // No op
}

if (privateKey)
    if ('y' == readline.question(`Found the ${chalk.bold.red('private')} key used last time. Would you like to use a ${chalk.bold.red('different')} one? (${chalk.bold.red('y')}/${chalk.bold.green('N')})`))
        privateKey = null

while (!privateKey) {
    privateKey = readline.question(`To get started setting up your ${chalk.bold.blue('HAVA Hotspot')}. Please input the ${chalk.bold.red('private')} key of the wallet you would like to connect (in hex): \n`)
    fs.writeFileSync("privateKey.txt", privateKey);
}

const initialPaymentQuestion = `The client ${chalk.green("pays")} an initial fee to cover the gas fees of future smart contract calls. Type a whole number to ${chalk.red('change')} the fee (default: ${chalk.green("1 HAVA")}): `
let initialPaymentCost
if (initialPaymentCost = readline.question(initialPaymentQuestion))
    // initialPaymentCost need to be a positive whole number
    while (initialPaymentCost && initialPaymentCost - Math.floor(initialPaymentCost) != 0 && initialPaymentCost > 0)
        initialPaymentCost = readline.question(initialPaymentQuestion)
if (!initialPaymentCost)
    initialPaymentCost = 1

const pricePerMBQuestion = `The client ${chalk.green("pays")} by the MB. Type a whole number to ${chalk.red('change')} the price per MB (default: ${chalk.green("1 HAVA/MB")}): `
let pricePerMB
if (pricePerMB = readline.question(pricePerMBQuestion))
    // pricePerMB need to be a positive whole number
    while (pricePerMB && pricePerMB - Math.floor(pricePerMB) != 0 && pricePerMB > 0)
        pricePerMB = readline.question(pricePerMBQuestion)
if (!pricePerMB)
    pricePerMB = 1

let shouldUploadLocation = readline.question(`Would you like to upload your router's location to the ${chalk.bold.blue('HAVA Hotspot')}App? (${chalk.bold.green('Y')}/${chalk.bold.red('n')})`) != 'n'

if (shouldUploadLocation) {
    let locationObj = {latitude: null, longitude: null}
    locationObj["latitude"] = readline.question(`Please enter your ${chalk.bold.blue('latitude')}: `)
    locationObj["longitude"] = readline.question(`Please enter your ${chalk.bold.blue('longitude')}: `)
    fetch('https://cockroachapp.herokuapp.com/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(locationObj)
    })
}


const infuraProjectId = "239ff2f143084d0f957c39a01c46998e";
const provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${infuraProjectId}`);

let signer = new ethers.Wallet(privateKey, provider);

const contract = new ethers.Contract("0x5F5D95aD138e85C84B2c695081A0b685224f8F66", havaAbi, provider).connect(signer);

console.log(`Server wallet address is ${chalk.underline(signer.address)}`)

let balances = {}
let lockTimestamps = {}
let signedPayments = {} // elements will be [amount, name, signature]
let nonces = {}
let ipAddressWalletMap = new Map();

const domain = {
    name: 'HavaToken',
    version: '1.0.0',
    chainId: 4,
    verifyingContract: contract.address,
};

app.post('/initialize', async (req, res) => {
    // The body should be the signed message from the user
    const {body} = req;
    const {amount, nonce, signature} = body;

    console.log("/initialize", body);

    const types = {
        ClientLockAuthorization: [
            {name: 'amount', type: 'uint256'},
            {name: 'nonce', type: 'uint256'}
        ]
    };

    const address = ethers.utils.verifyTypedData(domain, types, {amount, nonce}, signature);
    // console.log({amount, nonce, signature});

    if (amount != initialPaymentCost) {
        console.log(`${chalk.red.bold("FAILED:")} Initial payment from ${chalk.underline(address)} was for the incorrect amount.`);
        return res.json({
            initialized: false
        });
    }

    // Verify the signature
    // setLock(uint256 amount, uint256 nonce, bytes memory signature)
    let transaction;
    try {
        transaction = await contract.setLock(amount, nonce, signature).then(e => e.wait(1));
    } catch (e) {
        console.log(`${chalk.red.bold("FAILED:")} Initial transaction for ${chalk.underline(address)} could not complete successfully.`);
        console.log(e)
        return res.json({
            initialized: false,
            error: e.message
        });
    }

    ipAddressWalletMap.set(req.ip, address);

    const timestamp = (await provider.getBlock(transaction.blockNumber)).timestamp;

    lockTimestamps[address] = timestamp;

    // console.log("timestamp: ", timestamp);
    // console.log("Date.now(): ", (new Date().getTime()/1000));

    const secondsTillTimeout = 60 * (60 - 1) - (new Date().getTime() / 1000 - timestamp)
    // Try to cash out right before the lock expires
    setTimeout(() => cashInPayment(req.ip,), secondsTillTimeout * 1000)

    const balance = await contract.balanceOf(address);
    balances[address] = balance;

    // Save the nonce to validate future transactions
    nonces[address] = nonce;

    console.log(`${chalk.green.bold("SUCCESS:")} Initial transaction for ${chalk.underline(address)} initialized successfully. ${chalk.green.bold(amount + " HAVA")} has been sent to your wallet!`);

    res.json({
        dataUsed: 0,
        dataLimit: 0,
        initialized: true,
        nonce: nonce
    });
})

app.post('/status', async (req, res) => {
    const {body} = req;
    const {address} = body;
    const amountAlreadyPaid = signedPayments[address] ? signedPayments[address][0] : 0

    let dataUsed = 0;
    if (clientStateMap.has(req.ip)) {
        const clientState = clientStateMap.get(req.ip);
        dataUsed = Number(clientState.download_this_session) + Number(clientState.upload_this_session);
    }

    let dataLimit = amountAlreadyPaid * pricePerMB * 1024;

    res.json({
        dataUsed: dataUsed,
        pricePerMB,
        initialPaymentCost,
        dataLimit,
        amountAlreadyPaid,
        initialized: checkIfLocked(address),
        clientStateMap,
        a: clientStateMap.get(address)
    });
})

app.post('/updatePayment', async (req, res) => {
    const {body} = req;
    const {amount, nonce, signature} = body;

    const types = {
        ClientTransferAuthorization: [
            {name: 'amount', type: 'uint256'},
            {name: 'nonce', type: 'uint256'}
        ]
    };

    const address = ethers.utils.verifyTypedData(domain, types, {amount, nonce}, signature);
    const balance = balances[address]

    if (BigNumber.from(amount).gt(balance) || nonces[address] != nonce || (signedPayments[address] && signedPayments[address][0] >= amount)) {
        console.log(`${chalk.red.bold("FAILED:")} Additional payment from ${chalk.underline(address)} failed because fraud was detected.`);
        if (amount > balance)
            console.log("User out of funds")
        if (nonces[address] != nonce)
            console.log("Nonces don't match")
        if (signedPayments[address] && signedPayments[address][0] >= amount)
            console.log("User did not increase the amount they are willing to pay")
        return res.json({
            success: false
        });
    }

    let additionalPayment = amount
    if (signedPayments[address])
        additionalPayment = amount - signedPayments[address][0]

    signedPayments[address] = [amount, nonce, signature];

    auth(req.ip);

    console.log(`${chalk.green.bold("SUCCESS:")} ${chalk.underline(address)} has bought ${chalk.bold(additionalPayment * pricePerMB)} MB of data for ${chalk.green.bold(additionalPayment)}.`);

    res.json({
        success: true
    });
})

app.listen(port, '0.0.0.0');

function checkIfLocked(address) {
    const diff = new Date().getTime() / 1000 - lockTimestamps[address]
    return (diff < 60 * (60 - 1))
}

async function cashInPayment(ip, address) {
    if (checkIfLocked(address) && signedPayments[address]) {
        lockTimestamps[address] = 0
        //...signedPayments[address] = amount, nonce, signature
        await contract.releaseLock(...signedPayments[address]).then(e => e.wait(5)).catch(console.log)
        signedPayments[address] = null
        console.log(`${chalk.green('Successfully')} received payment from ${chalk.underline(address)} of ${chalk.bold.green(amount)}`)
        deauth(ip);
    }
}

function deauth(ipAddress) {
    console.log("deauthing", ipAddress)
    spawnSync('sudo', ['ndsctl', 'deauth', ipAddress]);
}

function auth(ipAddress) {
    console.log("authing", ipAddress)
    spawnSync('sudo', ['ndsctl', 'auth', ipAddress]);
}

let clientStateMap = new Map();

// TODO: Check the json file to see if client has disconnect, call the cashInPayment function if so
setInterval(() => {
    let ls;
    let parsed;

    try {
        ls = spawnSync('sudo', ['ndsctl', 'json']);
        parsed = JSON.parse(ls.stdout.toString());
    } catch (e) {
        console.error(e);
        return
    }


    let newStateMap = new Map();
    // console.log(clientStateMap);

    Object.values(parsed.clients).forEach(client => {
        newStateMap.set(client.ip, client);
    });

    // TODO: cashInPayment for all clients that are in clientStateMap but not in newStateMap
    clientStateMap.forEach((state, ip) => {
        const walletAddr = ipAddressWalletMap.get(ip);
        if (!walletAddr) {
            return;
        }

        console.log(ip, state.download_this_session + state.upload_this_session)

        if (!newStateMap.has(ip)) {
            cashInPayment(ip, walletAddr);
            return;
        }

        if (balances[walletAddr] &&
            balances[walletAddr][0] > pricePerMB * (Number(state.download_this_session) + Number(state.upload_this_session)) / 1024) {
            deauth(ip);
            return;
        }
    });

    clientStateMap = newStateMap;
}, 1000);