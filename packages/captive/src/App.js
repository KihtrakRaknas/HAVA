import {Rinkeby, shortenAddress, useEthers, useLookupAddress} from "@usedapp/core";
import React, {useCallback, useEffect, useState} from "react";

import {Body, BodyContainer, Button, Container, Header} from "./components";

import {addresses} from "@my-app/contracts";
import {GradientText} from "./components/GradientText/GradientText";
import {MainContainer} from "./components/MainContainer/MainContainer";
import {StyledButton} from "./components/StyledButton/StyledButton";
import {GlowText} from "./components/GlowText/GlowText";
import {Modal} from "./components/Modal/Modal";
import {Alert} from "./components/Alert/Alert";

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
            fetch("https://api.my-app.com/status").then(res => res.json()).then(json => json ? setResponse(json) : defaultObj).catch(() => setResponse(defaultObj));
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

    const [modalState, setModalState] = useState('closed');
    const [error, setError] = useState("");

    const signRequest = useCallback((amount, nonce) => {
        if (!nonce) {
            // generate random nonce uint128
            nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
        }
        // console.log(account)
        if (account)
            setModalState('signConfirmation');
        library.getSigner()._signTypedData(domain, types, {
            amount: amount,
            nonce: nonce
        }).then(signedMessage => {
            // TODO: Send signed message to server
            console.log(signedMessage);
            setModalState('waitingForConfirmation');
        }).catch((err) => {
            setModalState('closed');
            setError(err);
        });
    }, [account, library]);

    return (
        <Container>
            <Header>
                <WalletButton/>
            </Header>
            <Body>
                <MainContainer>
                    <h1 style={{fontSize: "68px"}}><GlowText>Hava</GlowText></h1>
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
                            <StyledButton theme="primary" onClick={() => signRequest(1)}>
                                Initialize Connection (1 HAVA).
                            </StyledButton>
                        ) : <WalletButton/>}
                    </MainContainer>
                ) : null}

                {initialized ? (
                    <MainContainer>
                        <h1>You are connected</h1>
                        <p>
                            You have used {dataUsed} MB of the {dataLimit} MB.
                        </p>

                        {account ? (
                            <StyledButton theme="primary" onClick={() => signRequest(5, nonce)}>
                                Add data ({dataLimit - dataUsed} MB left)
                            </StyledButton>
                        ) : <WalletButton/>}
                    </MainContainer>
                ) : null}
            </Body>
        </Container>
    );
}

export default App;
