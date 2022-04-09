import {useQuery} from "@apollo/client";
import {Contract} from "@ethersproject/contracts";
import {shortenAddress, useCall, useEthers, useLookupAddress} from "@usedapp/core";
import React, {useCallback, useEffect, useState} from "react";

import {Body, Button, Container, Header} from "./components";

import {abis, addresses} from "@my-app/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

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

function App() {
    // Read more about useDapp on https://usedapp.io/
    const {error: contractCallError, value: tokenBalance} = useCall({
        contract: new Contract(addresses.havaToken, abis.hava),
        method: "balanceOf",
        args: ["0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C"],
    }) ?? {};

    const {loading, error: subgraphQueryError, data} = useQuery(GET_TRANSFERS);

    useEffect(() => {
        if (subgraphQueryError) {
            console.error("Error while querying subgraph:", subgraphQueryError.message);
            return;
        }
        if (!loading && data && data.transfers) {
            console.log({transfers: data.transfers});
        }
    }, [loading, subgraphQueryError, data]);

    return (<Container>
        <Header>
            <WalletButton/>
        </Header>

        <Body>
            <h1>Hava</h1>
            <h2>A decentralized and open internet for everyone.</h2>

            <h3>Would you like to initialize a connection through this router?</h3>

            <button>
                Connect to internet (1 HAVA).
            </button>
        </Body>
    </Container>);
}

export default App;
