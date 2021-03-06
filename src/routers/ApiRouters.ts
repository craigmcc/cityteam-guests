// ApiRouters ----------------------------------------------------------------

// Consolidate Routers for REST APIs for application model objects.

// External Modules ----------------------------------------------------------

import { Router } from "express";

// Internal Modules ----------------------------------------------------------

import CheckinRouter from "./CheckinRouter";
import DevModeRouter from "./DevModeRouter";
import FacilityRouter from "./FacilityRouter";
import GuestRouter from "./GuestRouter";
import LogRouter from "./LogRouter";
import TemplateRouter from "./TemplateRouter";

// Public Objects ------------------------------------------------------------

export const ApiRouters = Router({
    strict: true
})

// Static Routers ------------------------------------------------------------

ApiRouters.get("/", (req, res) => {
    res.send("Hello from CityTeam Guests Checkin Server!");
})

// Model-Specific Routers ----------------------------------------------------

ApiRouters.use("/checkins", CheckinRouter);
ApiRouters.use("/devmode", DevModeRouter);
ApiRouters.use("/facilities", FacilityRouter);
ApiRouters.use("/guests", GuestRouter);
ApiRouters.use("/logs", LogRouter);
ApiRouters.use("/templates", TemplateRouter);

export default ApiRouters;
