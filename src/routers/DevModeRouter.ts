// DevModeRouter -------------------------------------------------------------

// Router for development mode operations.

// External Modules ----------------------------------------------------------

import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import {
    requireNotProduction,
    requireSuperuser
} from "../oauth/OAuthMiddleware";
import DevModeServices from "../services/DevModeServices";

// Public Objects ------------------------------------------------------------

export const DevModeRouter = Router({
    strict: true
});

// Resync database and reload data
DevModeRouter.post("/reload",
    requireNotProduction,
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await DevModeServices.reload());
    });

export default DevModeRouter;
