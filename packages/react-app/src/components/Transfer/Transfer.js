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
import {GradientText} from "../GradientText/GradientText";

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
        "ETH": "10000000",
        "HAVA": "10000000"
    }

    const otherCurrency = {
        "ETH": "HAVA",
        "HAVA": "ETH"
    }
    const [currentCurrency, setCurrentCurrency] = useState("ETH")
    const [conversionBalance, setConversionBalance] = useState("100000000000000")

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
        if (currentCurrency === "ETH") {
            conversionAmount = (BigInt(conversionBalance) * BigInt("10000000") / BigInt("1000000000000000000") );
        } else {
            conversionAmount = (BigInt(conversionBalance) * BigInt("1000000000000000000") / BigInt("10000000") );
        }
    } catch (e) {
        console.error(e);
    }

    const swap = useCallback(() => {
        if (currentCurrency === "ETH") {
            // function buyToken() payable
            buyTokenSend({value: conversionBalance});
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
        width: '500px',
        border: '1px solid black',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 12,
        padding: '32px',
        color: 'black'
    }

    return (
        <Container id="swap">
            <div style={divStyle}>
                <GradientText><h1>Swap</h1></GradientText>
                <TransferInputField currencyName={currentCurrency}
                                    balance={currentCurrency === "HAVA" ? havaBalance : etherBalance}
                                    symbol={currentCurrency}
                                    decimals={currentCurrency === "ETH" ? 18 : 0}
                                    value={conversionBalance} setValue={setConversionBalance}/>

                <div style={{height: "10px"}} />

                <Button style={{padding: 5, backgroundColor: "#ededed"}} onClick={() => {
                    setConversionBalance("0")
                    setCurrentCurrency((currentCurrency === "HAVA") ? "ETH" : "HAVA");
                }}>↑↓ Reverse Direction</Button>

                <div style={{height: "10px"}} />

                <TransferInputField currencyName={currentCurrency === "ETH" ? "HAVA" : "ETH"}
                                    balance={currentCurrency === "ETH" ? havaBalance : etherBalance}
                                    decimals={currentCurrency === "ETH" ? 0 : 18}
                                    symbol={currentCurrency === "ETH" ? "HAVA" : "ETH"}
                                    value={conversionAmount.toString()} setValue={() => {
                }}/>

                <div style={{height: "30px"}} />

                {account ? <Button style={{backgroundColor: "#d9e6ff", width: "90%"}} onClick={swap}>SWAP</Button> :
                    <WalletButton color="#d9e6ff" textColor="#002c7d"/>}
            </div>

        </Container>
    );
}
