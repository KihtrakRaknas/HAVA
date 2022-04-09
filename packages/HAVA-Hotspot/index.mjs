import chalk from 'chalk';
import express from 'express';
import * as bodyParser from 'body-parser';
const app = express()
import art from 'ascii-art';
import HDWalletProvider from "@truffle/hdwallet-provider";
import {ethers} from "ethers";

const port = 4000;
console.log(art.font("Some Text", 'Doom', true))

const infuraProjectId = "239ff2f143084d0f957c39a01c46998e";
const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${infuraProjectId}`);

console.log(provider.provider)

// Create web3.js middleware that signs transactions locally
const myPrivateKeyHex = "46088ca5aace355a37b53d8d2b860602d0a10ad426f74adbf729b5cb58f9c7ec";
// const localKeyProvider = new HDWalletProvider({
//  privateKeys: [myPrivateKeyHex],
//  providerOrUrl: `https://mainnet.infura.io/v3/${infuraProjectId}`,
// });

let localProvider = new ethers.Wallet(myPrivateKeyHex, provider);

async function stuff() {
    console.log(localProvider.address)
    let accounts = await localProvider.listAccounts();
    
    console.log(accounts)
}
stuff();


app.post('/initialize', (req, res) => {
    // The body should be the signed message from the user
    const { body } = req

    res.send('Hello World!')
})

// app.listen(port, () => {
    // console.log(`Example app listening on port ${port}`)
// })
