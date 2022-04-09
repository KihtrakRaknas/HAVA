import "./index.css";
import React from "react";
import ReactDOM from "react-dom"
import { Router } from "react-router-dom";

import { createBrowserHistory } from "history";
import * as serviceWorker from './serviceWorker';
import App from "./App";
import './assets/scss/style.scss';
const history = createBrowserHistory();


ReactDOM.render(
  <Router history={history}>
        <App />
  </Router>,
  document.getElementById("root"),
);

serviceWorker.unregister();
