// ApiRouters ----------------------------------------------------------------

// Consolidate Routers for REST APIs for application model objects.

// External Modules ----------------------------------------------------------

import { Router } from "express";

// Internal Modules ----------------------------------------------------------

import FacilityRouter from "./FacilityRouter";

// Public Objects ------------------------------------------------------------

export const ApiRouters = Router({
    strict: true
})

// Static Routers ------------------------------------------------------------

ApiRouters.get("/", (req, res) => {
    res.send("Hello from Bookcase Server!");
})

// Model-Specific Routers ----------------------------------------------------

ApiRouters.use("/facilities", FacilityRouter);

export default ApiRouters;
