// GuestRouter ---------------------------------------------------------------

// Express operations on Guest model objects.

// External Modules ----------------------------------------------------------

import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import {
    dumpRequestDetails,
    requireSuperuser
} from "../oauth/OAuthMiddleware";
import GuestServices from "../services/GuestServices";

// Public Objects ------------------------------------------------------------

export const GuestRouter = Router({
    strict: true
});

// Router-wide Middleware ----------------------------------------------------

GuestRouter.use(requireSuperuser);

// Standard CRUD Endpoints ---------------------------------------------------

// Find all Guests
GuestRouter.get("/",
    async (req: Request, res: Response) => {
        res.send(await GuestServices.all(req.query));
    });

// Insert a new Guest
GuestRouter.post("/",
    async (req: Request, res: Response) => {
        res.send(await GuestServices.insert(req.body));
    });

// Remove Guest by guestId
GuestRouter.delete("/:guestId",
    async (req: Request, res: Response) => {
        res.send(await GuestServices.remove
        (parseInt(req.params.guestId)));
    });

// Find Guest by guestId
GuestRouter.get("/:guestId",
    async (req: Request, res: Response) => {
        res.send(await GuestServices.find
        (parseInt(req.params.guestId), req.query));
    });

// Update Guest by guestId
GuestRouter.put("/:guestId",
    async (req: Request, res: Response) => {
        res.send(await GuestServices.update
        (parseInt(req.params.guestId), req.body));
    });

export default GuestRouter;
