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
import ImportServices from "../services/ImportServices";

// Public Objects ------------------------------------------------------------

export class Problem extends Error {
    constructor(issue: string, resolution: string, row: Object, fatal: boolean = false) {
        super(issue);
        this.issue = issue;
        this.resolution = resolution;
        this.row = row;
        this.fatal = fatal ? fatal : false;
    }
    fatal: boolean;
    issue: string;
    resolution: string;
    row: Object;
}

export const DevModeRouter = Router({
    strict: true
});

// Import a CSV from the Portland "shelter log" spreadsheet
DevModeRouter.post("/import",
    requireNotProduction,
    requireSuperuser,
    async (req: Request, res: Response) => {


    });

// Resync database and reload data
DevModeRouter.post("/reload",
    requireNotProduction,
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await DevModeServices.reload());
    });

export default DevModeRouter;
