import chalk from 'chalk';
import express from 'express';
import * as bodyParser from 'body-parser';
const app = express()
import { ethers } from "ethers";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const havaAbi = require('../contracts/src/abis/hava.json');
import * as readline from "readline-sync";
import * as fs from "fs";

const port = 4000;

let privateKey = null
try{
privateKey = fs.readFileSync('./privateKey.txt',{encoding:'utf8', flag:'r'});
}catch(el){
    // No op
}
while(!privateKey) {
    privateKey = readline.question(`To get started setting up your ${chalk.bold.blue('HAVA Hotspot')}. Please input the ${chalk.bold.red('private')} key of the wallet you would like to connect (in hex): \n`)
    fs.writeFileSync("privateKey.txt", privateKey);
}

const infuraProjectId = "239ff2f143084d0f957c39a01c46998e";
const provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${infuraProjectId}`);

let signer = new ethers.Wallet(privateKey, provider);

const contract = new ethers.Contract("0x7b41393CFd257394d60153D7b09498fC0DCBeE10", havaAbi, provider);

async function stuff() {
    console.log(signer.address)

    console.log(await contract.balanceOf(signer.getAddress()))

    // console.log(accounts)
}
stuff();


app.post('/initialize', async (req, res) => {
    // The body should be the signed message from the user
    const { body } = req;
    const { amount, nonce, signature } = body;

    if (amount != 1) {
        return res.json({
            "error": true
        });
    }

    // Verify the signature
    // setLock(uint256 amount, uint256 nonce, bytes memory signature)
    await contract.setLock(amount, nonce, signature).then(e => e.wait(5));
    
    // TODO: Send signature to the setLock function
    res.json({
        dataUsed: 0,
        dataLimit: 0,
        initialized: false,
        nonce: ''
    });
})

app.listen(port, () => {
    console.log(`Listeni on port ${port}`)
})
