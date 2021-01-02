// CheckinRouter -------------------------------------------------------------

// Express operations on Checkin model objects.

// External Modules ----------------------------------------------------------

import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import {
    dumpRequestDetails,
    requireSuperuser
} from "../oauth/OAuthMiddleware";
import CheckinServices from "../services/CheckinServices";

// Public Objects ------------------------------------------------------------

export const CheckinRouter = Router({
    strict: true
});

// Router-wide Middleware ----------------------------------------------------

CheckinRouter.use(requireSuperuser);

// Standard CRUD Endpoints ---------------------------------------------------

// Find all Checkins
CheckinRouter.get("/",
    async (req: Request, res: Response) => {
        res.send(await CheckinServices.all(req.query));
    });

// Insert a new Checkin
CheckinRouter.post("/",
    async (req: Request, res: Response) => {
        res.send(await CheckinServices.insert(req.body));
    });

// Remove Checkin by guestId
CheckinRouter.delete("/:guestId",
    async (req: Request, res: Response) => {
        res.send(await CheckinServices.remove
        (parseInt(req.params.guestId)));
    });

// Find Checkin by guestId
CheckinRouter.get("/:guestId",
    async (req: Request, res: Response) => {
        res.send(await CheckinServices.find
        (parseInt(req.params.guestId), req.query));
    });

// Update Checkin by guestId
CheckinRouter.put("/:guestId",
    async (req: Request, res: Response) => {
        res.send(await CheckinServices.update
        (parseInt(req.params.guestId), req.body));
    });

export default CheckinRouter;
