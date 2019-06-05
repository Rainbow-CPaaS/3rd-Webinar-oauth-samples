import * as Log from "./logger";

// STEP 1: ask third party server to create and log-in a guest account
export async function askForAGuestAccountAndBot() {
    return new Promise((resolve, reject) => {
        Log.debug("1. ask server for a Rainbow Guest account");
        window.$.get("https://localhost:3002/webinar/guests/authenticate", json => {
            Log.debug("1.1 guest account created. Token received [OK]");
            resolve(json.data);
        }).fail(function(err) {
            Log.error("1.1. error when creating the account [ERROR]");
            reject(err);
        });
    });
}

// STEP 2: Bootstrap, load, and initialize SDK
async function loadSDK() {
    return new Promise((resolve, reject) => {
        Log.debug("2. initialize the SDK without appSecret");
        window.angular.bootstrap(document, ["sdk"]).get("rainbowSDK");
        window.rainbowSDK.setVerboseLog(true);

        var onReady = function onReady() {
            Log.debug("2.1 sdk initialized [OK]");
            resolve();
        };

        var onLoaded = function onLoaded() {
            window.rainbowSDK
                .initialize("77a9e7707adf11e9bb0c1151ecd4e196", "")
                .then(function() {})
                .catch(function(err) {
                    Log.error("2.2 on SDK initialization [ERROR]", err);
                });
        };

        window.$(document).on(window.rainbowSDK.RAINBOW_ONREADY, onReady);
        window.$(document).on(window.rainbowSDK.RAINBOW_ONLOADED, onLoaded);

        // STEP 5: handle incoming chat message from bot
        var onImReceived = function onImReceived(event, message, conversation, cc) {
            Log.debug("5. im received [OK] =>", message.data);
            Log.debug("webinar demo end!");
        };

        window.$(document).on(window.rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, onImReceived);

        window.rainbowSDK.load();
    });
}

// STEP 3: connect the SDK to Rainbow using the token received
async function signinSDKWithToken(token) {
    Log.debug("3. sign the SDK with the token received");
    return new Promise((resolve, reject) => {
        window.rainbowSDK.connection
            .signinSandBoxWithToken(token)
            .then(() => {
                Log.debug("3.1 sdk signed with the token received [OK]");
                resolve();
            })
            .catch(err => {
                Log.error("3.1 sdk can't sign with the token received [ERROR]");
                reject(err);
            });
    });
}

// STEP 4: guest connected to Rainbow, ready to receive a message
async function sendMessageToBot(id) {
    Log.debug("4. send the help message to the bot");
    return new Promise((resolve, reject) => {
        window.rainbowSDK.contacts
            .searchById(id)
            .then(contact => {
                return window.rainbowSDK.conversations.openConversationForContact(contact);
            })
            .then(conversation => {
                window.rainbowSDK.im.sendMessageToConversation(conversation, "Hello, I need help !");
                Log.debug("4.1 message sent [OK]");
            })
            .catch(err => {
                Log.debug("4.1 sdk can't send message to bot [NOK]", err);
            });
    });
}

export async function connectToRainbowAndAskHelp(token, botId) {
    try {
        await loadSDK();
        await signinSDKWithToken(token);
        await sendMessageToBot(botId);
    } catch (err) {
        Log.error("Error, can't connect to Rainbow!", err);
    }
}

export function authenticateOauth() {
    const appID = "<your application id>"; // Fill with your application ID
    const oauthResponseType = "code"; // Grant
    const oauthRedirectURI = encodeURIComponent("https://localhost:3002/webinar/oauth");

    const oauthScope = "all";
    const oauthState = "7U3QRyn2d";

    let path = `?response_type=${oauthResponseType}&client_id=${appID}&redirect_uri=${oauthRedirectURI}&scope=${oauthScope}&state=${oauthState}`;

    let url = "https://sandbox.openrainbow.com/api/rainbow/authentication/v1.0/oauth/authorize" + path;

    window.location.href = url;
}
