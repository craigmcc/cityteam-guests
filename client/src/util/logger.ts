// logger --------------------------------------------------------------------

// Configure and return a Pino logger for this browser-based application.

// The goal here is to allow developers to use the same "logger.<level>()"
// semantics on the client side that they get to use on the server side,
// with additional capabilities to dynamically change the client side level
// at which logging messages should be forwarded to the server.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import LogClient from "../clients/LogClient";

// Private Objects -----------------------------------------------------------

// Map log level names to log level values
const LOG_LEVEL_MAP = new Map<string, number>();
LOG_LEVEL_MAP.set("debug", 20);
LOG_LEVEL_MAP.set("error", 50);
LOG_LEVEL_MAP.set("fatal", 60);
LOG_LEVEL_MAP.set("info", 30);
LOG_LEVEL_MAP.set("trace", 10);
LOG_LEVEL_MAP.set("warn", 40);

// Transmit the specified object so that it can be logged (if level is loggable)
const write = (object: any, level: number): void => {
    if (level >= LOG_LEVEL) {
        console.info(`CLIENT LOG(${level}): `, JSON.stringify(object));
        LogClient.log(object);
    }
}

// Public Objects ------------------------------------------------------------

export let LOG_LEVEL: number;

export const logger = require("pino")({
    browser: {
        asObject: true
    },
    write: {
        debug:      (object: any) => { write(object, 20) },
        error:      (object: any) => { write(object, 50) },
        fatal:      (object: any) => { write(object, 60) },
        info:       (object: any) => { write(object, 30) },
        trace:      (object: any) => { write(object, 10) },
        warn:       (object: any) => { write(object, 40) },
    }
});

export const setLevel = (newName: string): void => {
    const newLevel: number | undefined = LOG_LEVEL_MAP.get(newName);
    if (newLevel) {
        LOG_LEVEL = newLevel;
    } else {
        throw new Error(`name: Invalid log level '${newName}'`);
    }
}
setLevel("info"); // Set the default log level

export default logger;
