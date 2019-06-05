import React, { Component } from "react";

import logo from "./logo.svg";
import "./App.css";
import * as APPSDK from "./modules/appSDK";
import * as Log from "./modules/logger";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.onConnect = this.onConnect.bind(this);
        this.onConnectOAuth = this.onConnectOAuth.bind(this);
    }

    async onConnect() {
        try {
            const resultJSON = await APPSDK.askForAGuestAccountAndBot();

            const url =
                "/signed#access_token=" + resultJSON.account.token + "&bot_id=" + resultJSON.botId + "&access_type=jwt";

            this.props.history.push(url);
        } catch (err) {
            Log.error("Can't connect using guest account", err);
        }
    }

    onConnectOAuth() {
        try {
            APPSDK.authenticateOauth();
        } catch (err) {
            Log.error("Can't connect using oauth account", err);
        }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h3>WEBINAR DEMO</h3>
                    <small>May, 29th 2019</small>
                    <br />

                    <div className="App-guest-btn" onClick={this.onConnect}>
                        I need help !
                    </div>

                    <br />

                    <div className="App-oauth-btn" onClick={this.onConnectOAuth}>
                        <span className="App-rainbow-logo" />
                        <span className="App-rainbow-title">Login with Rainbow</span>
                    </div>
                </header>
            </div>
        );
    }
}

export default App;
