<<<<<<< HEAD
import {useQuery} from "@apollo/client";
import {Contract} from "@ethersproject/contracts";
import {formatEther, formatUnits, parseEther} from '@ethersproject/units'
import {shortenAddress, useCall, useEthers, useLookupAddress, useEtherBalance, useTokenBalance, useContractFunction} from "@usedapp/core";
import React, {useEffect, useCallback, useState} from "react";
import {Gradient} from 'react-gradient';
import {Body, Button, Container, Header, Image, Link} from "./components";
import TextField from '@material-ui/core/TextField'
import {BigNumberInput} from "big-number-input";
import { utils } from 'ethers';

import {addresses, abis} from "@my-app/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

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
                    activateBrowserWallet();
                }
            }}
        >
            {rendered === "" && "Connect Wallet"}
            {rendered !== "" && rendered}
        </Button>
    );
}

function App() {
    const multiplier = {
        "ETH": 10000000,
        "HAVA": 1/10000000
    }

    const otherCurrency = {
        "ETH": "HAVA",
        "HAVA": "ETH"
    }
    const [currentCurrency, setCurrentCurrency] = useState("ETH")
    const [conversionBalance, setConversionBalance] = useState("0")

    const decimals = currentCurrency === "ETH" ? 18 : 0;


    const {account, activateBrowserWallet} = useEthers()
    const etherBalance = useEtherBalance(account)
    const havaBalance = useTokenBalance(addresses.havaToken, account)

    const havaInterface = new utils.Interface(abis.hava);
    const contract = new Contract(addresses.havaToken, havaInterface);
    const { state: buyTokenState, send: buyTokenSend } = useContractFunction(contract, 'buyToken', { transactionName: 'Buy HAVA Token' })
    const { state: sellTokenState, send: sellTokenSend } = useContractFunction(contract, 'sellToken', { transactionName: 'Sell HAVA Token' })

    let conversionAmount = BigInt(0);
    try {
      conversionAmount = (BigInt(conversionBalance) / BigInt("1000000000000000000")) * BigInt(multiplier[currentCurrency]);
    } catch (e) {
      console.error(e);
    }

    const swap = useCallback(() => {
      if(currentCurrency === "ETH") {
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
        marginTop: '5vh',
        width: '20%',
        // height: '30%',
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 10,
    }

    return (
        <Container>
            <Header>
                <WalletButton/>
            </Header>

            {havaBalance != null && (
                <div style={divStyle}>
                    <p>HAVA Balance: {formatUnits(havaBalance, 0)}</p>
                </div>
            )}
            <div style={divStyle}>
                <p style={{color: "grey"}}>
                    Max ETH: {etherBalance ? formatEther(etherBalance) : "Not connected"}
                </p>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <BigNumberInput decimals={decimals} value={conversionBalance} onChange={setConversionBalance}
                                    renderInput={(props) => (
                                        <TextField id="outlined-basic" variant="outlined" InputProps={{style:{fontSize:20}}} fullWidth {...props}/>
                                        // <input type='text' value={conversionBalance} {...props} />
                                    )}/>

                    <p style={{paddingLeft: 10}}>{currentCurrency}</p>
                </div>

            <div style={{height: 10}}></div>

            <Button style={{padding: 5, backgroundColor: "#ededed"}} onClick={() => {
                setConversionBalance("0")
                setCurrentCurrency((currentCurrency === "HAVA") ? "ETH" : "HAVA");
            }}>↑↓ Reverse Direction</Button>

            <div style={{height: 10}}></div>

            <div style={{display: 'flex', flexDirection: 'row', paddingBottom: 40, paddingLeft: 10}}>
                <TextField disabled value={conversionAmount.toString()}
                           InputProps={{style: {fontSize: 20}}} variant="filled" fullWidth/>
                <p style={{paddingLeft: 10}}>{currentCurrency === "HAVA" ? "ETH" : "HAVA"}</p>
            </div>
            <p style={{color: "grey"}}>1 {currentCurrency} = {multiplier[currentCurrency]} {otherCurrency[currentCurrency]} </p>
            {account ? <Button style={{backgroundColor: "#d9e6ff", width: "90%"}} onClick={swap}>SWAP</Button> :
                <WalletButton color="#d9e6ff" textColor="#002c7d"/>}
            </div>
                
        </Container>
    );
=======
import React, { useRef, useEffect } from 'react';
import { useLocation, Switch } from 'react-router-dom';
import AppRoute from './utils/AppRoute';
import ScrollReveal from './utils/ScrollReveal';
import Transfer from './Transfer'
// Layouts
import LayoutDefault from './layouts/LayoutDefault';
import { createBrowserHistory } from "history";
import {DAppProvider, Mainnet, Rinkeby} from "@usedapp/core";
// Views 
import Home from './views/Home';

const history = createBrowserHistory();
// Change this to your own Infura project id: https://infura.io/register
const INFURA_PROJECT_ID = "239ff2f143084d0f957c39a01c46998e";
const config = {
  readOnlyChainId: Rinkeby.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: "https://mainnet.infura.io/v3/" + INFURA_PROJECT_ID,
    [Rinkeby.chainId]: "https://rinkeby.infura.io/v3/" + INFURA_PROJECT_ID,
  },
}

const App = () => {
  const TransferPage = ()=>{
    return (<DAppProvider config={config}>
      <Transfer/>
  </DAppProvider>)
  }
  const childRef = useRef();
  let location = useLocation();

  useEffect(() => {
    document.body.classList.add('is-loaded')
    childRef.current.init();
  }, [location]);

  return (
    <ScrollReveal
      ref={childRef}
      children={() => (
        <Switch>
          <AppRoute exact path="/" component={Home} layout={LayoutDefault} />
          <AppRoute exact path="/transfer" component={TransferPage} />
        </Switch>
      )} />
  );
>>>>>>> 8d459ac2668aa023ef3a9e8650db791e41132eac
}


export default App;