// ExpressApplication --------------------------------------------------------

// Overall Express application, configured as a Javascript class.
// This module configures only settings that are application wide.

// There is only one top level express() object in an application.
// Express lets you add sub-application Routers to an application, so you can
// do pretty much everything sub-application specific by configuring those.

// External Modules ----------------------------------------------------------

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
const rfs = require("rotating-file-stream");

// Internal Modules ----------------------------------------------------------

import { logger } from "../util/logger";

import ApiRouters from "./ApiRouters";
import OAuthRouters from "../oauth/OAuthRouters";
import { handleOAuthError } from "../oauth/OAuthMiddleware";
import {
    handleHttpError,
    handleServerError,
    handleValidationError
} from "../util/middleware";
import { toLocalISO } from "../util/timestamps";

const MORGAN_FORMAT_PROD = ":remote-addr [:timestamp]"
    + " \":method :url\""
    + " :status :res[content-length]";
const MORGAN_FORMAT_DEV = MORGAN_FORMAT_PROD + " \":req[Authorization]\"";

// Public Objects ------------------------------------------------------------

const app = express();

// Configure global middleware
app.use(cors({
    origin: "*"
}));

// Configure access log management
morgan.token("timestamp",
    (req, res): string =>
{
    return toLocalISO(new Date());
});
if (process.env.NODE_ENV === "development") {
    app.use(morgan(MORGAN_FORMAT_DEV));
} else {
    const accessLogStream = rfs.createStream("access.log", {
        interval: "1d",
        path: path.join(path.resolve("./"), "log"),
    });
    app.use(morgan(MORGAN_FORMAT_PROD, {
        stream: accessLogStream
    }));
}

// Configure body handling middleware
app.use(bodyParser.json({
}));
app.use(bodyParser.text({
    limit: "2mb",
    type: "text/csv",
}));
app.use(bodyParser.urlencoded({
    extended: true,
}));

// Configure static file routing
const CLIENT_BASE: string = path.resolve("./") + "/client/build";
logger.info({
    context: "Startup",
    msg: `Setup Static File Handling, path=${CLIENT_BASE}`
});
app.use(express.static(CLIENT_BASE));

// Configure application-specific and OAuth-specific routing
app.use("/api", ApiRouters);
app.use("/oauth", OAuthRouters);

// Configure error handling (must be last)
app.use(handleHttpError);
app.use(handleValidationError);
app.use(handleOAuthError);
app.use(handleServerError); // The last of the last :-)

// Configure unknown mappings back to client
app.get("*", (req, res) => {
    res.sendFile(CLIENT_BASE + "/index.html");
})

export default app;
