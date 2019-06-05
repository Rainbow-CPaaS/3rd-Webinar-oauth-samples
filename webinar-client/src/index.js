import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Router from "./Router";
import * as serviceWorker from "./serviceWorker";
import * as Log from "./modules/logger";

async function init() {
    ReactDOM.render(<Router />, document.getElementById("router"));
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

document.addEventListener("DOMContentLoaded", () => {
    Log.debug("webinar demo start!");
    init();
});
