// client-logger -------------------------------------------------------------

// Configure and return a Pino logger for this browser-based application.

// The goal here is to allow developers to use the same "logger.<level>()"
// semantics on the client side that they get to use on the server side,
// with additional capabilities to dynamically change the client side level
// at which logging messages should be forwarded to the server.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import LogClient from "../clients/LogClient";
import { CURRENT_USERNAME } from "../contexts/LoginContext";

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
        object.level = level;
        object.username = CURRENT_USERNAME ? CURRENT_USERNAME : undefined;
        LogClient.log(object);
    }
}

// Public Objects ------------------------------------------------------------

export let LOG_LEVEL: number = 30;  // Default to info level

export const logger = require("pino")({
    base: null, // Remove "name", "pid", and "hostname" since we do not need them
    browser: {
        asObject: true,
        write: {
            debug:      (object: any) => { write(object, 20) },
            error:      (object: any) => { write(object, 50) },
            fatal:      (object: any) => { write(object, 60) },
            info:       (object: any) => { write(object, 30) },
            trace:      (object: any) => { write(object, 10) },
            warn:       (object: any) => { write(object, 40) },
        },
    },
    timestamp: false, // Server will timestamp for us
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
