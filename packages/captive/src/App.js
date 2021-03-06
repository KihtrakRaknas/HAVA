import {Rinkeby, shortenAddress, useEthers, useLookupAddress} from "@usedapp/core";
import React, {useCallback, useEffect, useState} from "react";

import {Body, Button, Container, Header, Input} from "./components";

import {addresses} from "@my-app/contracts";
import {GradientText} from "./components/GradientText/GradientText";
import {MainContainer} from "./components/MainContainer/MainContainer";
import {StyledButton} from "./components/StyledButton/StyledButton";
import {GlowText} from "./components/GlowText/GlowText";
import {Modal} from "./components/Modal/Modal";
import {Alert} from "./components/Alert/Alert";
import {MainContainerWithProgress} from "./components/MainContainerWithProgress/MainContainerWithProgress";

function useWindowLocation() {
  return window.location.protocol + '//' + window.location.hostname + ':8888';
}

function humanFileSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
}


function useServerStatus() {
  const defaultObj = {
    dataUsed: 0,
    dataLimit: 0,
    initialized: false,
    amountAlreadyPaid: "0",
    nonce: localStorage.getItem("nonce")
  }
  const [pricePerMB, setPricePerMB] = useState(1);
  const [initializationPrice, setInitializationPrice] = useState(1);

  const [response, setResponse] = useState(defaultObj);
  const {account} = useEthers();
  const routerAddress = useWindowLocation()
  console.log(routerAddress);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(routerAddress + '/status', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({address: account})
      }).then(res => res.json())
        .then(json => {
          if (json) {
            if (json.pricePerMB) setPricePerMB(json.pricePerMB);
            if (json.initialPaymentCost) setInitializationPrice(json.initialPaymentCost);
            setResponse(json)
          } else {
            setResponse(defaultObj)
          }
        }).catch(() => setResponse(defaultObj));
    }, 1000);
    return () => clearInterval(interval);
  });

  return {...response, pricePerMB, initializationPrice};
}

function WalletButton() {
  const [rendered, setRendered] = useState("");

  const ens = useLookupAddress();
  const {account, activateBrowserWallet, error} = useEthers();

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
  updatePayment: {
    ClientTransferAuthorization: [
      {name: 'amount', type: 'uint256'},
      {name: 'nonce', type: 'uint256'}
    ],
  },
  initialize: {
    ClientLockAuthorization: [
      {name: 'amount', type: 'uint256'},
      {name: 'nonce', type: 'uint256'}
    ]
  }
};

// The data to sign
function App() {
  const {account, library} = useEthers();

  const {dataUsed, dataLimit, initialized, nonce, pricePerMB, amountAlreadyPaid, initializationPrice} = useServerStatus();

  const [modalState, setModalState] = useState('closed');
  const [error, setError] = useState("");
  const routerAddress = useWindowLocation()

  const [MbToBuy, setMbToBuy] = useState(5);

  console.log(routerAddress)

  const signRequest = useCallback((amount, endpoint) => {
    if(endpoint == "initialize")
      localStorage.setItem("nonce", Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString())
    let nonce = localStorage.getItem("nonce")
    // console.log(account)
    if (account)
      setModalState('signConfirmation');
    library.getSigner()._signTypedData(domain, types[endpoint], {amount, nonce}).then(signature => {
      // TODO: Send signed message to server
      fetch(routerAddress + '/' + endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({amount, nonce, signature})
      }).then(res => res.json())
        .then(json => {
          if (json.initialized === false)
            setModalState('failed');
          else
            setModalState('closed');
        });
      setModalState('waitingForConfirmation');
    }).catch((err) => {
      setModalState('closed');
      setError(err);
    });
  }, [account, library, routerAddress]);

  useEffect(() => {
    if (modalState === 'waitingForConfirmation' && initialized) {
      setModalState('closed');
    }
  }, [modalState, initialized]);

  return (
    <Container>
      <Header>
        <WalletButton/>
      </Header>
      <Body>
        <MainContainer>
          <h1><GlowText>Hava</GlowText></h1>
          <h2>
            A <GradientText>decentralized</GradientText> and <GradientText>open</GradientText> internet for
            everyone.
          </h2>
        </MainContainer>

        <Modal isOpen={modalState !== 'closed'}>
          {modalState === "signConfirmation" ? (
            <>
              <h1>Waiting for wallet...</h1>
              <p>
                Review the signing request in your wallet.
                You will <b>not be charged</b> any gas fees.
              </p>
            </>
          ) : null}

          {modalState === "waitingForConfirmation" ? (
            <>
              <h1>Waiting for confirmation...</h1>
              <p>
                The router is verifying your balance. You will be connected to the internet shortly.
              </p>
            </>
          ) : null}

          {modalState === "failed" ? (
            <>
              <h1>Signature verification failed</h1>
              <p>
                The router failed to verify your balance. Please try again.
              </p>
            </>
          ) : null}
        </Modal>

        {!initialized ? (
          <MainContainer>
            <h1>Start a connection?</h1>

            {!error ? (
              <Alert displayed={error !== ''} theme="danger" setDisplayed={() => setError('')}>
                <b>Connection Failed: </b> {error}
              </Alert>
            ) : null}

            <p>
              Connect with this router for <b>1 HAVA</b> for internet.
            </p>

            {account ? (
              <StyledButton theme="primary"
                            onClick={() => signRequest(initializationPrice, "initialize")}>
                Initialize Connection ({initializationPrice} HAVA)
              </StyledButton>
            ) : <WalletButton/>}
          </MainContainer>
        ) : null}

        {initialized ? (
          <>
            <MainContainerWithProgress max={dataLimit / 1024} value={dataUsed / 1024}>
              <h1>You are <GradientText>connected</GradientText></h1>

              <p>
                You have used {humanFileSize(dataUsed * 1024)} of the {dataLimit / 1024} MB.
              </p>
            </MainContainerWithProgress>

            <MainContainer>
              <h1>Purchase more data</h1>
              <p>
                Buy <Input type="number" value={MbToBuy} onChange={e => setMbToBuy(e.target.value)}
                           min={1}/> MB
                of data.
              </p>

              {account ? (
                <StyledButton theme="primary"
                              onClick={() => signRequest(pricePerMB * (Number(amountAlreadyPaid) + MbToBuy), "updatePayment")}>
                  Add data ({pricePerMB * MbToBuy} HAVA)
                </StyledButton>) : <WalletButton/>}
            </MainContainer>
          </>
        ) : null}
      </Body>
    </Container>
  );
}

export default App;
