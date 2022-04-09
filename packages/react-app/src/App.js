import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";

import { Body, Button, Container, Header, Image, Link } from "./components";
import TextField from '@material-ui/core/TextField'

import { addresses, abis } from "@my-app/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

function WalletButton(props) {
  const [rendered, setRendered] = useState("");
  const ens = useLookupAddress();
  const { account, activateBrowserWallet, deactivate, error } = useEthers();

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
      alert("Error while connecting wallet: "+error.message);
    }
  }, [error]);

  return (
    <Button
    style={{backgroundColor: props.color}}
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
    </Button>
  );
}

function App() {
  const multiplier=1.0
  const [balance, setBalance] = useState("0.0")
  // Read more about useDapp on https://usedapp.io/
  const { error: contractCallError, value: tokenBalance } =
    useCall({
       contract: new Contract(addresses.ceaErc20, abis.erc20),
       method: "balanceOf",
       args: ["0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C"],
    }) ?? {};

  const { loading, error: subgraphQueryError, data } = useQuery(GET_TRANSFERS);

  useEffect(() => {
    if (subgraphQueryError) {
      console.error("Error while querying subgraph:", subgraphQueryError.message);
      return;
    }
    if (!loading && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, subgraphQueryError, data]);
  const handleChange = (event) => {
    setBalance(parseFloat(event.target.value)*multiplier);
  };
  return (
    <Container>
      <Header>
        <WalletButton color="white"/>
      </Header>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          alignSelf: 'center',
          width: '20%',
          height: '30%',
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 10,
        }}>
        <div style={{display: 'flex',flexDirection: 'row', paddingBottom:30}}>
          <TextField id="outlined-basic" placeholder="0.0" variant="outlined" onChange={handleChange} />
          <p style={{paddingLeft: 10}}> ETH</p>
        </div>
        <div style={{display: 'flex',flexDirection: 'row',paddingBottom:50, paddingLeft:10}}>
        <TextField disabled defaultValue={balance} value={balance} variant="filled"/>
          <p style={{paddingLeft: 10}}>HAVA</p>
        </div>
          <WalletButton color="#d9e6ff" textColor="#002c7d"/>
        </div>
    </Container>
  );
}

export default App;
