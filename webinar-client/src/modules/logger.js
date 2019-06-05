const logdown = require("logdown");

export function debug(message, data) {
    window.localStorage.debug = "*";
    logdown("webinar").info(message, data || "");
}

export function error(message, data) {
    localStorage.debug = "*";
    logdown("webinar").error(message, data || "");
}
