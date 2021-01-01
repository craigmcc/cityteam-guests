// FacilityRouter ------------------------------------------------------------

// Express operations on Facility model objects.

// External Modules ----------------------------------------------------------

import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import {
    dumpRequestDetails,
    requireAdmin,
    requireNone,
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

// Model-Specific Routes -----------------------------------------------------

// Find all active Facilities
FacilityRouter.get("/active",
    dumpRequestDetails,
    requireNone,
//    requireSuperuser, // Avoid catch-22 on initial population of FacilityContext
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

// Facility -> Assign Routes -------------------------------------------------

// Assign the specified Guest to the specified Checkin
FacilityRouter.post("/:facilityId/assigns/:checkinId/assign",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.assignsAssign(
            parseInt(req.params.facilityId),
            parseInt(req.params.checkinId),
            req.body
        ));
    });

// Deassign the current Guest from the specified Checkin
FacilityRouter.post("/:facilityId/assigns/:checkinId/deassign",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.assignsDeassign(
            parseInt(req.params.facilityId),
            parseInt(req.params.checkinId)
        ));
    });

// Reassign the current Guest at a specified Checkin to a new Checkin
FacilityRouter.post("/:facilityId/assigns/:oldCheckinId/reassign/:newCheckinId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.assignsReassign(
            parseInt(req.params.facilityId),
            parseInt(req.params.oldCheckinId),
            parseInt(req.params.newCheckinId)
        ));
    });

// Facility -> Checkin Routes ------------------------------------------------

// Find all Checkins for this Facility on this checkin date
FacilityRouter.get("/:facilityId/checkins/:checkinDate/all",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.checkinsAll
            (parseInt(req.params.facilityId), req.params.checkinDate, req.query));
    });

// Find available Checkins for this Facility on this checkin date
FacilityRouter.get("/:facilityId/checkins/:checkinDate/available",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.checkinsAvailable
           (parseInt(req.params.facilityId), req.params.checkinDate, req.query));
    });

// Generate Checkins for this Facility on this checkin date from this Template
FacilityRouter.post("/:facilityId/checkins/:checkinDate/generate/:templateId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.checkinsGenerate(
                parseInt(req.params.facilityId),
                 req.params.checkinDate,
                parseInt(req.params.templateId)));
    });

// Facility -> Guest Routes -----------------------------------------------

// Find all Guests for this Facility
FacilityRouter.get("/:facilityId/guests",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.guestsAll
            (parseInt(req.params.facilityId), req.query));
    });

// Insert a new Guest for this Facility
FacilityRouter.post("/:facilityId/guests",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.guestsInsert
            (parseInt(req.params.facilityId), req.body));
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

// Remove Guest from this Facility
FacilityRouter.delete("/:facilityId/guests/:guestId",
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.guestsRemove
            (parseInt(req.params.facilityId), parseInt(req.params.guestId)));
    });

// Update Guest in this Facility
FacilityRouter.put("/:facilityId/guests/:guestId",
    requireRegular,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.guestsUpdate
            (parseInt(req.params.facilityId), parseInt(req.params.guestId), req.body));
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

// Insert a new Template for this Facility
FacilityRouter.post("/:facilityId/templates",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.templatesInsert
        (parseInt(req.params.facilityId), req.body));
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

// Remove Template from this Facility
FacilityRouter.delete("/:facilityId/templates/:templateId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.templatesRemove
            (parseInt(req.params.facilityId), parseInt(req.params.templateId)));
    });

// Update Template in this Facility
FacilityRouter.put("/:facilityId/templates/:templateId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.templatesUpdate
        (parseInt(req.params.facilityId), parseInt(req.params.templateId), req.body));
    });

// Facility -> User Routes ---------------------------------------------------

// Find all Users for this Facility
FacilityRouter.get("/:facilityId/users",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.usersAll
            (parseInt(req.params.facilityId), req.query));
    });

// Insert a new User for this Facility
FacilityRouter.post("/:facilityId/users",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.usersInsert
            (parseInt(req.params.facilityId), req.body));
    });

// Find active Users for this Facility
FacilityRouter.get("/:facilityId/users/active",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.usersActive
            (parseInt(req.params.facilityId), req.query));
    });

// Find Users for this Facility by exact username
FacilityRouter.get("/:facilityId/users/exact/:username",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.usersExact
            (parseInt(req.params.facilityId), req.params.username, req.query));
    });

// Find Users for this Facility by name match
FacilityRouter.get("/:facilityId/users/name/:name",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.usersName
            (parseInt(req.params.facilityId), req.params.name, req.query));
    });

// Find Users globally by exact username
FacilityRouter.get("/:facilityId/users/unique/:username",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.usersUnique
            (parseInt(req.params.facilityId), req.params.username, req.query));
    });

// Remove User from this Facility
FacilityRouter.delete("/:facilityId/users/:userId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.usersRemove
            (parseInt(req.params.facilityId), parseInt(req.params.userId)));
    });

// Update User in this Facility
FacilityRouter.put("/:facilityId/users/:userId",
    requireAdmin,
    async (req: Request, res: Response) => {
        res.send(await FacilityServices.usersUpdate
            (parseInt(req.params.facilityId), parseInt(req.params.userId), req.body));
    });

export default FacilityRouter;
