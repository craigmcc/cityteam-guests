// OAuthAccessTokenRouter -----------------------------------------------------------

// Express operations on OAuthAccessToken model objects.

// Exterrnal Modules ---------------------------------------------------------

import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import OAuthAccessTokenServices from "./OAuthAccessTokenServices";
import { requireSuperuser } from "./OAuthMiddleware";

// Public Objects ------------------------------------------------------------

export const OAuthAccessTokenRouter = Router({
    strict: true,
});

// Router-wide Middleware ----------------------------------------------------

OAuthAccessTokenRouter.use(requireSuperuser);

// Model-Specific Routes (no tokenId) ----------------------------------------

// Find OAuthAccessToken by exact token
OAuthAccessTokenRouter.get("/exact/:token",
    async (req: Request, res: Response) => {
        res.send(await OAuthAccessTokenServices.exact(
            req.params.token,
            req.query
        ));
    });

// Purge access (and refresh) tokens that have expired
OAuthAccessTokenRouter.post("/purge",
    async (req: Request, res: Response) => {
        res.send(await OAuthAccessTokenServices.purge());
    })

// Standard CRUD Routes ------------------------------------------------------

// Find all AccessTokens
OAuthAccessTokenRouter.get("/",
    async (req: Request, res: Response) => {
        res.send(await OAuthAccessTokenServices.all(
            req.query
        ));
    });

// Insert a new OAuthAccessToken
OAuthAccessTokenRouter.post("/",
    async (req: Request, res: Response) => {
        res.send(await OAuthAccessTokenServices.insert(
            req.body
        ));
    });

// Remove OAuthAccessToken by ID
OAuthAccessTokenRouter.delete("/:accessTokenId",
    async (req: Request, res: Response) => {
        res.send(await OAuthAccessTokenServices.remove(
            parseInt(req.params.accessTokenId, 10)
        ));
    });

// Find OAuthAccessToken by ID
OAuthAccessTokenRouter.get("/:accessTokenId",
    async (req: Request, res: Response) => {
        res.send(await OAuthAccessTokenServices.find(
            parseInt(req.params.accessTokenId, 10),
            req.query
        ));
    });

// Update OAuthAccessToken by ID
OAuthAccessTokenRouter.put("/:accessTokenId",
    async (req: Request, res: Response) => {
        res.send(await OAuthAccessTokenServices.update(
            parseInt(req.params.accessTokenId, 10),
            req.body
        ));
    });

export default OAuthAccessTokenRouter;
