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
}

export default App;