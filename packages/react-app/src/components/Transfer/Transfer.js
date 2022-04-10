import {Contract} from "@ethersproject/contracts";
import {formatEther, formatUnits} from '@ethersproject/units'
import {
    shortenAddress,
    useContractFunction,
    useEtherBalance,
    useEthers,
    useLookupAddress,
    useTokenBalance
} from "@usedapp/core";
import React, {useCallback, useEffect, useState} from "react";
import {Button, Container} from "../index";
import {utils} from 'ethers';

import {TransferInputField} from "../TransferInputField/TransferInputField";

import {abis, addresses} from "@my-app/contracts";

const BigInt = window.BigInt;

function WalletButton(props) {
    const [rendered, setRendered] = useState("");
    const ens = useLookupAddress();
    const {account, activateBrowserWallet, deactivate, error} = useEthers();

    useEffect(() => {
        if (ens) {
            setRendered(ens);
        } else if (account) {
            setRendered(shortenAddress(account));
        } else {
            setRendered("");
        }
    }, [account, ens, setRendered]);

    useEffect(() => {
        if (error) {
            console.log("Error while connecting wallet: " + error.message);
        }
    }, [error]);

    return (
        <Button
            style={{backgroundColor: props.color}}
            onClick={() => {
                if (!account) {
                    alert(1);
                    activateBrowserWallet();
                }
            }}>
            {rendered === "" && "Connect Wallet"}
            {rendered !== "" && rendered}
        </Button>
    );
}

export default function Transfer() {
    const multiplier = {
        "ETH": 10000000,
        "HAVA": 1 / 10000000
    }

    const otherCurrency = {
        "ETH": "HAVA",
        "HAVA": "ETH"
    }
    const [currentCurrency, setCurrentCurrency] = useState("ETH")
    const [conversionBalance, setConversionBalance] = useState("0")

    const decimals = currentCurrency === "ETH" ? 18 : 0;

    const {account} = useEthers()
    const etherBalance = useEtherBalance(account)
    const havaBalance = useTokenBalance(addresses.havaToken, account)

    // console.log(etherBalance, havaBalance);

    const havaInterface = new utils.Interface(abis.hava);
    const contract = new Contract(addresses.havaToken, havaInterface);
    const {
        state: buyTokenState,
        send: buyTokenSend
    } = useContractFunction(contract, 'buyToken', {transactionName: 'Buy HAVA Token'})
    const {
        state: sellTokenState,
        send: sellTokenSend
    } = useContractFunction(contract, 'sellToken', {transactionName: 'Sell HAVA Token'})

    let conversionAmount = BigInt(0);
    try {
        conversionAmount = (BigInt(conversionBalance) / BigInt("1000000000000000000")) * BigInt(multiplier[currentCurrency]);
    } catch (e) {
        console.error(e);
    }

    const swap = useCallback(() => {
        if (currentCurrency === "ETH") {
            // function buyToken() payable
            buyTokenSend({value: conversionAmount});
        } else {
            // function sellToken(uint256 amount)
            sellTokenSend(conversionAmount);
        }
    }, [buyTokenSend, sellTokenSend, conversionBalance, currentCurrency]);

    const divStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        alignSelf: 'center',
        width: '450px',
        backgroundColor: '#575252',
        borderRadius: 6,
    }

    return (
        <Container>
            <div style={divStyle}>
                <h1>Swap</h1>
                <TransferInputField currencyName={"ethereum"} balance={etherBalance} symbol={"ETH"} decimals={decimals}
                                    value={conversionBalance} setValue={setConversionBalance}/>

                <div style={{height: "10px"}} />

                <Button style={{padding: 5, backgroundColor: "#ededed"}} onClick={() => {
                    setConversionBalance("0")
                    setCurrentCurrency((currentCurrency === "HAVA") ? "ETH" : "HAVA");
                }}>↑↓ Reverse Direction</Button>

                <div style={{height: "10px"}} />

                <TransferInputField currencyName={"HAVA"} balance={havaBalance} decimals={0}
                                    symbol={"HAVA"} value={conversionAmount.toString()} setValue={() => {
                }}/>

                <p>
                    1 {currentCurrency} = {multiplier[currentCurrency]} {otherCurrency[currentCurrency]}
                </p>

                {account ? <Button style={{backgroundColor: "#d9e6ff", width: "90%"}} onClick={swap}>SWAP</Button> :
                    <WalletButton color="#d9e6ff" textColor="#002c7d"/>}
            </div>

        </Container>
    );
}
