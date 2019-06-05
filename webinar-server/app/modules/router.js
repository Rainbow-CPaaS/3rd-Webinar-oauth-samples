"use strict";
const express = require("express");
const router = express.Router();
let fs = require("fs");
const http = require("http");
const https = require("https");
const app = express();
const cors = require("cors");

const logger = require("./logger");

const corsOptions = {
    origin: "https://localhost:3000"
};

const LOG_ID = "WEBINAR/ROUT - ";

class Router {
    constructor() {
        logger.log("info", LOG_ID + "constructor()");
        this.protocol = "http";
        this.port = 8888;
        this.sdk = null;
    }

    async start(config, sdk) {
        return new Promise(resolve => {
            this.protocol = config.protocol;
            this.port = config.port;
            this.sdk = sdk;

            logger.log("info", LOG_ID + "serving " + this.protocol + " requests on port " + this.port);

            let key = fs.readFileSync(__dirname + "/../../" + config.certificates.key);
            let cert = fs.readFileSync(__dirname + "/../../" + config.certificates.cert);
            let https_options = { key: key, cert: cert };

            if (this.protocol === "https") {
                https.createServer(https_options, app).listen(this.port, () => {
                    logger.log("info", LOG_ID + "https server started");
                    resolve();
                });
            } else {
                http.createServer(app).listen(this.port, () => {
                    logger.log("info", LOG_ID + "http server started");
                    resolve();
                });
            }

            app.use(function(req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next();
            });

            app.use(cors(corsOptions));

            this.defineRoute();

            // Define base route to bot
            app.use("/webinar", router);
        });
    }

    defineRoute() {
        /**
         * Health check route
         */
        router.get("/ping", (req, res) => {
            res.status(200).send({ code: 0 });
        });

        /**
         * Create a guest account and authenticate it
         */

        router.get("/guests/authenticate", cors(corsOptions), async (req, res) => {
            try {
                let loggedInAccount = {};

                logger.log("info", LOG_ID + "registering a new account...");
                let account = await this.sdk.createGuestUser();
                logger.log("info", LOG_ID + "account created", account.id);

                loggedInAccount = await this.sdk.authenticateAccount(account);
                logger.log("info", LOG_ID + "account authenticated successfully", account.id);

                res.status(200).send({ code: 0, data: { account: loggedInAccount, botId: this.sdk.id } });
            } catch (err) {
                res.status(500).send({ code: -1, data: { status: this.sdk.state, version: this.sdk.version } });
            }
        });

        /**
         * Create OAuth callback route for Oauth Authorization code grant
         */
        router.get("/oauth", async (req, res) => {
            let code = req.query.code;
            let state = req.query.state;

            logger.log("info", LOG_ID + "access granted received from OAuth. Generate token...");

            try {
                let tokens = await this.sdk.generateJWTTokenFromAccessToken(code);

                logger.log("info", LOG_ID + "token generated. Redirect the application");

                res.redirect(
                    301,
                    "https://localhost:3000/signed#access_token=" +
                        tokens.access_token +
                        "&bot_id=" +
                        this.sdk.id +
                        "&access_type=oauth"
                );
            } catch (err) {
                res.status(500).send({ code: -1, data: { status: this.sdk.state, version: this.sdk.version } });
            }
        });
    }
}

module.exports = new Router();
