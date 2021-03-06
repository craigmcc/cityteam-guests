// OAuthUserRouter -----------------------------------------------------------

// Express operations on OAuthUser model objects.

// External Modules ----------------------------------------------------------

import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import { requireSuperuser } from "./OAuthMiddleware";
import OAuthUserServices from "./OAuthUserServices";

// Public Objects ------------------------------------------------------------

export const OAuthUserRouter = Router({
    strict: true,
});

// Router-wide Middleware ----------------------------------------------------

// TODO - support admin access to users associated with a particular facility
OAuthUserRouter.use(requireSuperuser);

// Model-Specific Routes (no userId) -----------------------------------------

// Find active Users
OAuthUserRouter.get("/active",
    async (req: Request, res: Response) => {
        res.send(await OAuthUserServices.active(
            req.query
        ));
    });

// Find OAuthUser by exact username
OAuthUserRouter.get("/exact/:username",
    async (req: Request, res: Response) => {
        res.send(await OAuthUserServices.exact(
            req.params.username,
            req.query
        ));
    });

// Find Users by name match
OAuthUserRouter.get("/name/:name",
    async (req: Request, res: Response) => {
        res.send(await OAuthUserServices.name(
            req.params.name,
            req.query
        ));
    });

// Standard CRUD Routes ------------------------------------------------------

// Find all Users
OAuthUserRouter.get("/",
    async (req: Request, res: Response) => {
        res.send(await OAuthUserServices.all(
            req.query
        ));
    });

// Insert a new OAuthUser
OAuthUserRouter.post("/",
    async (req: Request, res: Response) => {
        res.send(await OAuthUserServices.insert(
            req.body
        ));
    });

// Remove OAuthUser by ID
OAuthUserRouter.delete("/:userId",
    async (req: Request, res: Response) => {
        res.send(await OAuthUserServices.remove(
            parseInt(req.params.userId, 10)
        ));
    });

// Find OAuthUser by ID
OAuthUserRouter.get("/:userId",
    async (req: Request, res: Response) => {
        res.send(await OAuthUserServices.find(
            parseInt(req.params.userId, 10),
            req.query
        ));
    });

// Update OAuthUser by ID
OAuthUserRouter.put("/:userId",
    async (req: Request, res: Response) => {
        res.send(await OAuthUserServices.update(
            parseInt(req.params.userId, 10),
            req.body
        ));
    });

// OAuthUser->OAuthAccessToken Routes ----------------------------------------

// Find all related access tokens
OAuthUserRouter.get("/:userId/accessTokens/all",
    async (req: Request, res: Response) => {
      res.send(await OAuthUserServices.accessTokensAll(
            parseInt(req.params.userId, 10),
            req.query
        ));
    });

// OAuthUser->OAuthRefreshToken Routes ---------------------------------------

// Find all related refresh tokens
OAuthUserRouter.get("/:userId/refreshTokens/all",
    async (req: Request, res: Response) => {
        res.send(await OAuthUserServices.refreshTokensAll(
            parseInt(req.params.userId, 10),
            req.query
        ));
    });

export default OAuthUserRouter;
