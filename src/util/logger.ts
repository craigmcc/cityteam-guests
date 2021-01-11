// logger --------------------------------------------------------------------

// Configure and return a Pino logger for this application (and its tests)

// External Modules ----------------------------------------------------------

import path from "path";
const rfs = require("rotating-file-stream");

// Internal Modules ----------------------------------------------------------

import { nowLocalISO } from "./timestamps";

// Private Objects -----------------------------------------------------------

const serverLogStream: WritableStream =
    (process.env.NODE_ENV === "production")
    ? rfs.createStream("server.log", {
            interval: "1d",
            path: path.join(path.resolve("./"), "log"),
        })
    : process.stdout;

// Public Objects ------------------------------------------------------------

export const logger = require("pino")({
    base: { }, // Remove "pid" and "hostname" since we do not need them
    level: (process.env.NODE_ENV !== "production") ? "debug" : "info",
    timestamp: function (): string {
        return ',"time":"' + nowLocalISO() + '"';
    }
}, serverLogStream);

export default logger;
