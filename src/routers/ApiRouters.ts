// ApiRouters ----------------------------------------------------------------

// Consolidate Routers for REST APIs for application model objects.

// External Modules ----------------------------------------------------------

import { Router } from "express";

// Internal Modules ----------------------------------------------------------

import DevModeRouter from "./DevModeRouter";
import FacilityRouter from "./FacilityRouter";
import GuestRouter from "./GuestRouter";
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

ApiRouters.use("/devmode", DevModeRouter);
ApiRouters.use("/facilities", FacilityRouter);
ApiRouters.use("/guests", GuestRouter);
ApiRouters.use("/templates", TemplateRouter);

export default ApiRouters;
