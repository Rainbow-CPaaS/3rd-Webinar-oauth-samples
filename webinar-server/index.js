"use strict";

const LOG_ID = "WEBINAR/INDX - ";

const morgan = require("morgan");
morgan("tiny");

// Load needed modules
const sdk = require("./app/modules/sdk");
const logger = require("./app/modules/logger");
const router = require("./app/modules/router");
const json = require("comment-json");
const fs = require("fs");

// Load configuration file and get parameters
const defaultServer = require("./app/config/router.json");
const botfile = fs.readFileSync("./app/config/bot.json");
let txt = botfile.toString();
let bot = json.parse(txt);
json.stringify(bot, null, 2);

async function start() {
    logger.log("info", LOG_ID + "webinar server starting...");

    // Start the SDK
    await sdk.start(bot);

    // Start the router
    await router.start(defaultServer, sdk);

    logger.log("info", LOG_ID + "webinar server initialized successfully!!!");
}

// Entry point - Start the server application
try {
    start();
} catch (err) {
    logger.error("info", LOG_ID + "webinar server failed to start", err);
}
