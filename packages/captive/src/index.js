import "./index.css";

import {DAppProvider, Mainnet, Rinkeby} from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

// Change this to your own Infura project id: https://infura.io/register
const INFURA_PROJECT_ID = "239ff2f143084d0f957c39a01c46998e";
const config = {
    readOnlyChainId: Rinkeby.chainId,
    readOnlyUrls: {
        [Mainnet.chainId]: "https://mainnet.infura.io/v3/" + INFURA_PROJECT_ID,
        [Rinkeby.chainId]: "https://rinkeby.infura.io/v3/" + INFURA_PROJECT_ID,
    },
}

ReactDOM.render(
    <React.StrictMode>
        <DAppProvider config={config}>
            <App/>
        </DAppProvider>
    </React.StrictMode>,
    document.getElementById("root"),
);
