import React from 'react';
import {Switch} from 'react-router-dom';
import AppRoute from './utils/AppRoute';
// Layouts
import LayoutDefault from './layouts/LayoutDefault';
import {createBrowserHistory} from "history";
import {DAppProvider, Mainnet, Rinkeby} from "@usedapp/core";
// Views
import Home from './views/Home';

import('./assets/scss/style.scss');

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
  return (
      <DAppProvider config={config}>
        <Switch>
          <AppRoute exact path="/" component={Home} layout={LayoutDefault} />
        </Switch>
      </DAppProvider>
  );
}


export default App;