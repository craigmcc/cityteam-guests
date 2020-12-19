// FacilityRouter ------------------------------------------------------------

// Express operations on Facility model objects.

// External Modules ----------------------------------------------------------

import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import {
    dumpRequestDetails,
    requireAdmin,
    requireRegular,
    requireSuperuser
} from "../oauth/OAuthMiddleware";
import FacilityServices from "../services/FacilityServices";

// Public Objects ------------------------------------------------------------

export const FacilityRouter = Router({
    strict: true
});

// Model-Specific Routes (no facilityId) -------------------------------------

// GET /active - Find active Facilities
FacilityRouter.get("/active",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.active(req.query));
    });

// GET /exact/:name - Find Facility by exact name
FacilityRouter.get("/exact/:name",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.exact(req.params.name, req.query));
    });

// GET /name/:name - Find Facilities by name match
FacilityRouter.get("/name/:name",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.name(req.params.name, req.query));
    });

// GET /scope/:scope - Find Facility by exact scope
FacilityRouter.get("/scope/:scope",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.scope(req.params.scope, req.query));
    });

// Standard CRUD Endpoints ---------------------------------------------------

// GET / - Find all Facilities
FacilityRouter.get("/",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.all(req.query));
    });

// POST / - Insert a new Facility
FacilityRouter.post("/",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.insert(req.body));
    });

// DELETE /:facilityId - Remove Facility by facilityId
FacilityRouter.delete("/:facilityId",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.remove
            (parseInt(req.params.facilityId)));
    });

// GET /:facilityId - Find Facility by facilityId
FacilityRouter.get("/:facilityId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.find
            (parseInt(req.params.facilityId), req.query));
    });

// PUT /:facilityId - Update Facility by facilityId
FacilityRouter.put("/:facilityId",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.update
            (parseInt(req.params.facilityId), req.body));
    });

// TODO - Facility -> Checkin routes

// TODO - Facility -> Guest routes

// TODO - Facility -> Template routes

export default FacilityRouter;
