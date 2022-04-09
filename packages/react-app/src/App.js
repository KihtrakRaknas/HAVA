import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { formatEther } from '@ethersproject/units'
import { shortenAddress, useCall, useEthers, useLookupAddress, useEtherBalance, useTokenBalance } from "@usedapp/core";
import React, { useEffect, useState } from "react";
import { Gradient } from 'react-gradient';
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
      console.log("Error while connecting wallet: "+error.message);
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
  const multiplier={
    "ETH": 2.0,
    "HAVA": 0.5
  }
  const [currentCurrency, setCurrentCurrency] = useState("ETH")
  const [balanceText, setBalanceText] = useState("")
  const [conversionBalance, setConversionBalance] = useState(0.0  )

  // Read more about useDapp on https://usedapp.io/
  // const { error: contractCallError, value: tokenBalance } =
  //   useCall({
  //      contract: new Contract(addresses.havaToken, abis.hava),
  //      method: "balanceOf",
  //      args: ["0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C"],
  //   }) ?? {};

  const { account } = useEthers()
  const etherBalance = useEtherBalance(account)
  console.log(etherBalance)
  const daiBalance = useTokenBalance(addresses.havaToken, account)

  const handleChange = (event) => {
    setBalanceText(event.target.value)
    setConversionBalance(parseFloat(event.target.value)*multiplier[currentCurrency]);
  };

  return (
    <Container>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          alignSelf: 'center',
          marginTop: '25vh',
          width: '20%',
          height: '30%',
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 10,
        }}>
          <p style={{color:"grey"}}>Max ETH: {etherBalance?formatEther(etherBalance):"Not connected"}</p>
        <div style={{display: 'flex',flexDirection: 'row'}}>
          <TextField id="outlined-basic" placeholder="0.0" variant="outlined" value={balanceText} onChange={handleChange} InputProps={{style:{fontSize:20}}} fullWidth/>
          <p style={{paddingLeft: 10}}>{currentCurrency}</p>
        </div>
        <p onClick={()=>{
          setBalanceText("0")
          setCurrentCurrency((currentCurrency==="HAVA")?"ETH":"HAVA");
          setConversionBalance(0)
        }}>↑↓ Exchange</p>
        <div style={{display: 'flex',flexDirection: 'row',paddingBottom:40, paddingLeft:10}}>
        <TextField disabled defaultValue={conversionBalance} value={conversionBalance} InputProps={{style:{fontSize:20}}} variant="filled" fullWidth/>
          <p style={{paddingLeft: 10}}>{currentCurrency==="HAVA"?"ETH":"HAVA"}</p>
        </div>
          <WalletButton color="#d9e6ff" textColor="#002c7d"/>
        </div>
    </Container> 
  );
}

export default App;
