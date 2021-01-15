// LogRouter -----------------------------------------------------------------

// Router for downloading log files.

// External Modules ----------------------------------------------------------

import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import logger from "../util/logger";

//import { requireSuperuser } from "../oauth/OAuthMiddleware";
import LogServices from "../services/LogServices";

// Public Objects ------------------------------------------------------------

export const LogRouter = Router({
    strict: true
});

LogRouter.get("/accessLog",
//    requireSuperuser,
    async (req: Request, res: Response) => {
        try {
            res.header("Content-Type", "text/plain")
                .send(await LogServices.accessLog());
        } catch (error) {
            logger.error({
                context: "LogRouter.accessLog",
                msg: error.message,
                error: error
            });
            res.status(500).send(error);
        }
    });

LogRouter.get("/accessLogs/:date",
//    requireSuperuser,
    async (req: Request, res: Response) => {
        try {
            res.header("Content-Type", "text/plain")
                .send(await LogServices.accessLogs(req.params.date));
        } catch (error) {
            logger.error({
                context: "LogRouter.accessLogs",
                msg: error.message,
                error: error
            });
            res.status(500).send(error);
        }
    });

LogRouter.get("/clientLog",
//    requireSuperuser,
    async (req: Request, res: Response) => {
        try {
            res.header("Content-Type", "application/json")
                .send(await LogServices.clientLog());
        } catch (error) {
            logger.error({
                context: "LogRouter.clientLog",
                msg: error.message,
                error: error
            });
            res.status(500).send(error);
        }
    });

LogRouter.post("/clientLog",
//    requireSuperuser, // TODO - rate limiting or something?
    async (req: Request, res: Response) => {
        try {
            await LogServices.logClientRecord(req.body);
            res.sendStatus(204); // No response body
        } catch (error) {
            logger.error({
                context: "LogRouter.logClientRecord",
                msg: error.message,
                error: error
            });
        }
    });

LogRouter.get("/clientLogs/:date",
//    requireSuperuser,
    async (req: Request, res: Response) => {
        try {
            res.header("Content-Type", "application/json")
                .send(await LogServices.clientLogs(req.params.date));
        } catch (error) {
            logger.error({
                context: "LogRouter.accessLogs",
                msg: error.message,
                error: error
            });
            res.status(500).send(error);
        }
    });

LogRouter.get("/serverLog",
//    requireSuperuser,
    async (req: Request, res: Response) => {
        try {
            res.header("Content-Type", "application/json")
                .send(await LogServices.serverLog());
        } catch (error) {
            logger.error({
                context: "LogRouter.serverLog",
                msg: error.message,
                error: error
            });
            res.status(500).send(error);
        }
    });

LogRouter.get("/serverLogs/:date",
//    requireSuperuser,
    async (req: Request, res: Response) => {
        try {
            res.header("Content-Type", "application/json")
                .send(await LogServices.serverLogs(req.params.date));
        } catch (error) {
            logger.error({
                context: "LogRouter.serverLogs",
                msg: error.message,
                error: error
            });
            res.status(500).send(error);
        }
    });

export default LogRouter;
