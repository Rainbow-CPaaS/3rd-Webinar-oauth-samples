"use strict";

const NodeSDK = require("rainbow-node-sdk");
const logger = require("./logger");
const axios = require("axios");
const qs = require("qs");

const LOG_ID = "WEBINAR/SDKN - ";

class SDK {
    constructor() {
        logger.log("info", LOG_ID + "constructor()");
        this.nodeSDK = null;
        this.bot = null;
    }

    get sdk() {
        return this.nodeSDK;
    }

    get id() {
        return "<bot ID>"; // Fill with the ID of the Agent or bot to contact
    }

    /**
     * RAINBOW
     * Initialize the SDK and listen to incoming Rainbow chat messages and answer to them
     */
    async start(bot) {
        return new Promise((resolve, reject) => {
            // Load and start the SDK with the BOT account
            this.nodeSDK = new NodeSDK(bot);
            this.bot = bot;

            // Subscribe and answer to incoming messages
            this.nodeSDK.events.on("rainbow_onmessagereceived", this.answerChatMessage.bind(this));

            this.nodeSDK
                .start()
                .then(() => {
                    logger.log("info", LOG_ID + "SDK started");
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /**
     * RAINBOW
     * Create a Rainbow Guest user account
     */
    async createGuestUser() {
        return new Promise((resolve, reject) => {
            this.nodeSDK.admin
                .createAnonymousGuestUser(3600)
                .then(guest => {
                    resolve(guest);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /**
     * RAINBOW
     * Authenticate the Guest user account
     */
    async authenticateAccount(account) {
        return new Promise((resolve, reject) => {
            this.nodeSDK.admin
                .askTokenOnBehalf(account.loginEmail, account.password)
                .then(account => {
                    resolve(account);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /**
     * RAINBOW
     * Acknoledge and answer incoming chat messages
     */
    async answerChatMessage(message) {
        // Inform the sender that the message has been read
        this.nodeSDK.im.markMessageAsRead(message);

        // Only answer to user messages (not to group messages)
        if (message.type === "chat") {
            // Get the contact
            this.nodeSDK.contacts
                .getContactByJid(message.fromJid)
                .then(contact => {
                    // Send an answer
                    logger.log("info", LOG_ID + "Received chat message. Answer it!");
                    this.nodeSDK.im.sendMessageToJid(
                        "Hello " + contact.firstName + "! How can I help you?",
                        message.fromJid
                    );
                })
                .catch(err => {});
        }
    }

    /**
     * RAINBOW
     * Generate JWT token from access code
     */
    async generateJWTTokenFromAccessToken(accessCode) {
        return new Promise((resolve, reject) => {
            const url = "https://" + this.bot.rainbow.host + ":443/api/rainbow/authentication/v1.0/oauth/token";
            const applicationAuthent = this.bot.application.appID + ":" + this.bot.application.appSecret;

            const headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + Buffer.from(applicationAuthent).toString("base64")
            };

            const requestBody = {
                grant_type: "authorization_code",
                code: accessCode,
                redirect_uri: "https://localhost:3002/webinar/oauth"
            };

            const encodedBody = qs.stringify(requestBody);

            axios
                .post(url, encodedBody, { headers: headers })
                .then(response => {
                    resolve({ refresh_token: response.data.refresh_token, access_token: response.data.access_token });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}

module.exports = new SDK();
