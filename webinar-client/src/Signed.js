import React, { Component } from "react";

import logo from "./bots.png";
import "./Signed.css";
import * as APPSDK from "./modules/appSDK";
import * as Log from "./modules/logger";

function getUrlVars() {
    var vars = {};
    window.location.href.replace(/[#&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function getUrlParam(parameter, defaultvalue) {
    var urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1) {
        urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
}

class Signed extends Component {
    constructor(props) {
        super(props);

        this.state = {
            token: getUrlParam("access_token", ""),
            botId: getUrlParam("bot_id", ""),
            type: getUrlParam("access_type", "")
        };
    }

    componentDidMount() {
        Log.debug(">>> switched to Signed page");
        if (this.state.token && this.state.botId) {
            APPSDK.connectToRainbowAndAskHelp(this.state.token, this.state.botId, this.state.type);
        }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="Signed-logo" alt="logo" />
                    <h3>WELCOME !</h3>
                </header>
            </div>
        );
    }
}

export default Signed;
