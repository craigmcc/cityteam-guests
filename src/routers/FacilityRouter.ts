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

// Find active Facilities
FacilityRouter.get("/active",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.active(req.query));
    });

// Find Facility by exact name
FacilityRouter.get("/exact/:name",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.exact(req.params.name, req.query));
    });

// Find Facilities by name match
FacilityRouter.get("/name/:name",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.name(req.params.name, req.query));
    });

// Find Facility by exact scope
FacilityRouter.get("/scope/:scope",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.scope(req.params.scope, req.query));
    });

// Standard CRUD Endpoints ---------------------------------------------------

// Find all Facilities
FacilityRouter.get("/",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.all(req.query));
    });

// Insert a new Facility
FacilityRouter.post("/",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.insert(req.body));
    });

// Remove Facility by facilityId
FacilityRouter.delete("/:facilityId",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.remove
            (parseInt(req.params.facilityId)));
    });

// Find Facility by facilityId
FacilityRouter.get("/:facilityId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.find
            (parseInt(req.params.facilityId), req.query));
    });

// Update Facility by facilityId
FacilityRouter.put("/:facilityId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.update
            (parseInt(req.params.facilityId), req.body));
    });

// Facility -> Checkin Routes ---------------------------------------------

// Find all Checkins for this Facility
FacilityRouter.get("/:facilityId/checkins",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.checkinsAll
            (parseInt(req.params.facilityId), req.query));
    });

// Find all Checkins for this Facility on this checkin date
FacilityRouter.get("/:facilityId/checkins/:checkinDate/all",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.checkinsDate
            (parseInt(req.params.facilityId), req.params.checkinDate, req.query));
    });

// Find available Checkins for this Facility on this checkin date
FacilityRouter.get("/:facilityId/checkins/:checkinDate/available",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.checkinsAvailable
           (parseInt(req.params.facilityId), req.params.checkinDate, req.query));
    });

// Facility -> Guest Routes -----------------------------------------------

// Find all Guests for this Facility
FacilityRouter.get("/:facilityId/guests",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.guestsAll
            (parseInt(req.params.facilityId), req.query));
    });

// Find active Guests for this Facility
FacilityRouter.get("/:facilityId/guests/active",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.guestsActive
            (parseInt(req.params.facilityId), req.query));
    });

// Find Guests for this Facility by exact name
FacilityRouter.get("/:facilityId/guests/exact/:firstName/:lastName",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.guestsExact
            (parseInt(req.params.facilityId), req.params.firstName, req.params.lastName, req.query));
    });

// Find Guests for this Facility by name match
FacilityRouter.get("/:facilityId/guests/name/:name",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.guestsName
            (parseInt(req.params.facilityId), req.params.name, req.query));
    });

// Facility -> Summary Routes ------------------------------------------------

// Find summaries for this Facility for the specified checkin date range
FacilityRouter.get("/:facilityId/summaries/:checkinDateFrom/:checkinDateTo",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.summaries(
            parseInt(req.params.facilityId),
            req.params.checkinDateFrom,
            req.params.checkinDateTo)
        );
    });

// Facility -> Template Routes -----------------------------------------------

// Find all Templates for this Facility
FacilityRouter.get("/:facilityId/templates",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.templatesAll
            (parseInt(req.params.facilityId), req.query));
    });

// Find active Templates for this Facility
FacilityRouter.get("/:facilityId/templates/active",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.templatesActive
            (parseInt(req.params.facilityId), req.query));
    });

// Find Templates for this Facility by exact name
FacilityRouter.get("/:facilityId/templates/exact/:name",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.templatesExact
        (parseInt(req.params.facilityId), req.params.name, req.query));
    });

// Find Templates for this Facility by name match
FacilityRouter.get("/:facilityId/templates/name/:name",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.templatesName
            (parseInt(req.params.facilityId), req.params.name, req.query));
    });

export default FacilityRouter;
