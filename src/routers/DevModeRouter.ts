// DevModeRouter -------------------------------------------------------------

// Router for development mode operations.

// External Modules ----------------------------------------------------------

import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import {
    dumpRequestDetails,
    requireNotProduction,
    requireSuperuser
} from "../oauth/OAuthMiddleware";
import DevModeServices from "../services/DevModeServices";

// Public Objects ------------------------------------------------------------

export const DevModeRouter = Router({
    strict: true
});

// Import a CSV from the Portland "shelter log" spreadsheet
DevModeRouter.post("/import",
    requireNotProduction,
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await DevModeServices.import("Portland", req.body));
    });

// Import a CSV from the "shelter log" spreadsheet for the named Facility
DevModeRouter.post("/import/:name",
    requireNotProduction,
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await DevModeServices.import(req.params.name, req.body));
    });

// Resync database and reload data
DevModeRouter.post("/reload",
    requireNotProduction,
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await DevModeServices.reload());
    });

export default DevModeRouter;
