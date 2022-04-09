import {shortenAddress, useEthers, useLookupAddress, Rinkeby} from "@usedapp/core";
import React, {useCallback, useEffect, useState} from "react";

import {Body, Button, Container, Header} from "./components";

import {addresses} from "@my-app/contracts";

function useServerStatus() {  
  const defaultObj = {
    dataUsed: 0,
    dataLimit: 0,
    initialized: false,
    nonce: ''
  }
  const [response, setResponse] = useState(defaultObj);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://api.my-app.com/status").then(res => res.json()).then(json=>json?setResponse(json):defaultObj).catch(()=>setResponse(defaultObj));
    }, 1000);
    return () => clearInterval(interval);
  });

  return response;
}

function WalletButton() {
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
            console.error("Error while connecting wallet:", error.message);
        }
    }, [error]);

    return (<Button
        onClick={() => {
            if (!account) {
                activateBrowserWallet();
            } else {
                deactivate();
            }
        }}
    >
        {rendered === "" && "Connect Wallet"}
        {rendered !== "" && rendered}
    </Button>);
}

const domain = {
    name: 'HavaToken',
    version: '1.0.0',
    chainId: Rinkeby.chainId,
    verifyingContract: addresses.havaToken,
}; 
 
// The named list of all type definitions
const types = {
    // ClientTransferAuthorization: [
    //     {name: 'amount', type: 'uint256'},
    //     {name: 'nonce', type: 'uint256'}
    // ],
    ClientLockAuthorization: [
        {name: 'amount', type: 'uint256'},
        {name: 'nonce', type: 'uint256'}
    ]
};

// The data to sign
function App() {
    const {account, library} = useEthers();

    const {dataUsed, dataLimit, initialized, nonce} = useServerStatus();

    const signRequest = useCallback((amount, nonce) => {
      if (!nonce) {
        // generate random nonce uint128
        nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
      }
        // console.log(account)
        if (account)
            library.getSigner()._signTypedData(domain, types, {
              amount: amount,
              nonce: nonce
          }).then(signedMessage => {
              // TODO: Send signed message to server
              console.log(signedMessage);
            });
    }, [account, library]);

    return (<Container>
        <Header>
            <WalletButton/>
        </Header>
        <Body>
            <h1>Hava</h1>

            <h2>A decentralized and open internet for everyone.</h2>
            {
            initialized?
            <>
              <h3>Your connection has initialized. You have used {dataUsed} MB of the {dataLimit} MB you have.</h3>

              {account?<Button onClick={()=>signRequest(5,nonce)}>
                  Add data ({dataLimit - dataUsed} MB left)
              </Button>:<WalletButton/>}
            </>
            :
            <>
              <h3>Would you like to initialize a connection through this router?</h3>

              {account?<Button onClick={()=>signRequest(1)}>
                  Initialize Connection (1 HAVA).
              </Button>:<WalletButton/>}
            </>
            }
        </Body>
    </Container>);
}

export default App;
