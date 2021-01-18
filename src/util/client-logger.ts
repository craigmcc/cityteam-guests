// client-logger -------------------------------------------------------------

// Configure and return a Pino logger for log objects forwarded from clients.

// External Modules ----------------------------------------------------------

import path from "path";
const rfs = require("rotating-file-stream");

// Internal Modules ----------------------------------------------------------

import { nowLocalISO } from "./timestamps";

// Private Objects -----------------------------------------------------------

const LOG_DIRECTORY =
    process.env.LOG_DIRECTORY ? process.env.LOG_DIRECTORY : "./log";
const clientLogStream: WritableStream =
    (process.env.NODE_ENV === "production")
        ? rfs.createStream("client.log", {
            interval: "1d",
            path: path.resolve(LOG_DIRECTORY),
        })
        : process.stdout;

// Public Objects ------------------------------------------------------------

export const clientLogger = require("pino")({
    base: null, // Remove "name", "pid", and "hostname" since we do not need them
    formatters: {
        level: (label: string, number: number) => {
            return { serverLevel: number };
}
    },
    level: (process.env.NODE_ENV !== "production") ? "debug" : "info",
    timestamp: function (): string {
        return ',"time":"' + nowLocalISO() + '"';
    }
}, clientLogStream);

export default clientLogger;
