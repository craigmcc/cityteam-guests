// TemplateRouter ------------------------------------------------------------

// Express operations on Template model objects.

// External Modules ----------------------------------------------------------

import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import {
    dumpRequestDetails,
    requireSuperuser
} from "../oauth/OAuthMiddleware";
import TemplateServices from "../services/TemplateServices";

// Public Objects ------------------------------------------------------------

export const TemplateRouter = Router({
    strict: true
});

// Router-wide Middleware ----------------------------------------------------

TemplateRouter.use(requireSuperuser);

// Standard CRUD Endpoints ---------------------------------------------------

// GET / - Find all Templates
TemplateRouter.get("/",
    async (req: Request, res: Response) => {
        res.send(await TemplateServices.all(req.query));
    });

// POST / - Insert a new Template
TemplateRouter.post("/",
    async (req: Request, res: Response) => {
        res.send(await TemplateServices.insert(req.body));
    });

// DELETE /:templateId - Remove Template by templateId
TemplateRouter.delete("/:templateId",
    async (req: Request, res: Response) => {
        res.send(await TemplateServices.remove
        (parseInt(req.params.templateId)));
    });

// GET /:templateId - Find Template by templateId
TemplateRouter.get("/:templateId",
    async (req: Request, res: Response) => {
        res.send(await TemplateServices.find
        (parseInt(req.params.templateId), req.query));
    });

// PUT /:templateId - Update Template by templateId
TemplateRouter.put("/:templateId",
    async (req: Request, res: Response) => {
        res.send(await TemplateServices.update
        (parseInt(req.params.templateId), req.body));
    });

export default TemplateRouter;
