// const chalk = require('chalk');
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const art = require('ascii-art');

const ethers = require('ethers');
const HDWalletProvider = require("@truffle/hdwallet-provider");

const port = 4000;

const infuraProjectId = "239ff2f143084d0f957c39a01c46998e";
const provider = new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${infuraProjectId}`);

// Create web3.js middleware that signs transactions locally
const myPrivateKeyHex = "46088ca5aace355a37b53d8d2b860602d0a10ad426f74adbf729b5cb58f9c7ec";
const localKeyProvider = new HDWalletProvider({
 privateKeys: [myPrivateKeyHex],
 providerOrUrl: provider,
});

let localProvider = new ethers.providers.Web3Provider(localKeyProvider);

async function stuff() {
    let accounts = await provider.listAccounts();
    
    console.log(accounts)
}

console.log(art.font("Some Text", 'doom', true))


app.post('/initialize', (req, res) => {
    // The body should be the signed message from the user
    const { body } = req

    res.send('Hello World!')
})


// app.listen(port, () => {
    // console.log(`Example app listening on port ${port}`)
// })
