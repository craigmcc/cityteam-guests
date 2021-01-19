// OAuthUserServices ---------------------------------------------------------

// Services implementation for OAuthUser models.

// External Modules ----------------------------------------------------------

import { FindOptions, Op, Order } from "sequelize";

// Internal Modules ----------------------------------------------------------

import { hashPassword } from "./OAuthUtils";
import OAuthAccessToken from "../models/AccessToken";
import OAuthRefreshToken from "../models/RefreshToken";
import OAuthUser from "../models/User";
import AbstractServices from "../services/AbstractServices";
import { NotFound } from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import User from "../models/User";
import AccessToken from "../models/AccessToken";

const OAuthAccessTokensOrder: Order = [
    [ "userId", "ASC" ],
    [ "token", "ASC" ],
];
const OAuthRefreshTokensOrder: Order = [
    [ "userId", "ASC" ],
    [ "token", "ASC" ],
];
const OAuthUsersOrder: Order = [
    [ "username", "ASC" ],
];

// Public Classes ------------------------------------------------------------

export class OAuthUserServices extends AbstractServices<OAuthUser> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<OAuthUser[]> {
        let options: FindOptions = appendQuery({
            order: OAuthUsersOrder
        }, query);
        let results: OAuthUser[] = await OAuthUser.findAll(options);
        results.forEach(result => {
            result.password = "";
        })
        return results;
    }

    public async find(userId: number, query?: any): Promise<OAuthUser> {
        let options: FindOptions = appendQuery({
            where: { id: userId }
        }, query);
        let results = await OAuthUser.findAll(options);
        if (results.length === 1) {
            results[0].password = "";
            return results[0];
        } else {
            throw new NotFound(
                `userId: Missing OAuthUser ${userId}`,
                "OAuthUserServices.find()");
        }
    }

    public async insert(user: OAuthUser): Promise<OAuthUser> {
        const newUser: Partial<OAuthUser> = {
            ...user,
            password: await hashPassword(user.password)
        }
        try {
            let inserted: OAuthUser = await OAuthUser.create(newUser, {
                fields: fields,
            });
            inserted.password = "";
            return inserted;
        } catch (error) {
            throw error;
        }
    }

    public async remove(userId: number): Promise<OAuthUser> {
        let removed = await OAuthUser.findByPk(userId);
        if (!removed) {
            throw new NotFound(
                `userId: Missing OAuthUser ${userId}`,
                "OAuthUserServices.remove()");
        }
        let count = await OAuthUser.destroy({
            where: { id: userId }
        });
        if (count < 1) {
            throw new NotFound(
                `userId: Cannot remove OAuthUser ${userId}`,
                "OAuthUserServices.remove()");
        }
        removed.password = "";
        return removed;
    }

    public async update(userId: number, user: OAuthUser): Promise<OAuthUser> {
        let updatedUser: Partial<OAuthUser> = {
            ...user,
        }
        if (user.password && (user.password.length > 0)) {
            updatedUser.password = await hashPassword(user.password)
        } else {
            delete updatedUser.password;
        }
        try {
            updatedUser.id = userId;
            let results: [number, OAuthUser[]] = await OAuthUser.update(updatedUser, {
                fields: fieldsWithId,
                where: { id: userId }
            });
            if (results[0] === 1) {
                results[1][0].password = "";
                return results[1][0];
            } else {
                throw new NotFound(
                    `userId: Cannot update OAuthUser ${userId}`,
                    "OAuthUserServices.update()");
            }
        } catch (error) {
            throw error;
        }
    }

    // Model-Specific Methods ------------------------------------------------

    // ***** OAuthUser Lookups *****

    public async active(query?: any): Promise<OAuthUser[]> {
        let options: FindOptions = appendQuery({
            order: OAuthUsersOrder,
            where: {
                active: true
            }
        }, query);
        const results: OAuthUser[] = await OAuthUser.findAll(options);
        results.forEach(result => {
            result.password = "";
        })
        return results;
    }

    // NOTE:  exact match against the "username" field
    public async exact(username: string, query?: any): Promise<OAuthUser> {
        let options: FindOptions = appendQuery({
            where: {
                username: username
            }
        }, query);
        let results = await OAuthUser.findAll(options);
        if (results.length !== 1) {
            throw new NotFound(
                `username: Missing OAuthUser '${username}'`,
                "OAuthUserServices.exact()");
        }
        results[0].password = "";
        return results[0];
    }

    // NOTE: match against the "name" field
    public async name(name: string, query?: any): Promise<OAuthUser[]> {
        let options: FindOptions = appendQuery({
            order: OAuthUsersOrder,
            where: {
                name: { [Op.iLike]: `%${name}%` }
            }
        }, query);
        const results: OAuthUser[] = await OAuthUser.findAll(options);
        results.forEach(result => {
            result.password = "";
        })
        return results;
    }

    // Return the User for the (validated) accessToken
    public async me(token: string): Promise<OAuthUser> {
        let options: FindOptions = appendQuery({
            include: [
                User
            ],
            where: {
                token: token
            }
        });
        const accessToken = await AccessToken.findOne(options);
        if (accessToken) {
            const user = await accessToken.$get("user");
            if (user) {
                user.password = "";
                return user;
            } else {
                throw new NotFound(`userId: Missing user ${accessToken.userId}`);
            }
        } else {
            throw new NotFound(`token: Missing access token`);
        }
    }

    // ***** OAuthAccessToken Lookups *****

    public async accessTokensAll(userId: number, query?: any): Promise<OAuthAccessToken[]> {
        let user = await OAuthUser.findByPk(userId);
        if (!user) {
            throw new NotFound(
                `userId: Missing OAuthUser ${userId}`,
                "OAuthUserServices.accessTokensAll()");
        }
        let options: FindOptions = appendQuery({
            order: OAuthAccessTokensOrder
        }, query);
        return user.$get("accessTokens", options);
    }

    // ***** OAuthRefreshToken Lookups *****

    public async refreshTokensAll(userId: number, query?: any): Promise<OAuthRefreshToken[]> {
        let user = await OAuthUser.findByPk(userId);
        if (!user) {
            throw new NotFound(
                `userId: Missing OAuthUser ${userId}`,
                "OAuthUserServices.accessTokensAll()");
        }
        let options: FindOptions = appendQuery({
            order: OAuthRefreshTokensOrder
        }, query);
        return user.$get("refreshTokens", options);
    }

}

export default new OAuthUserServices();

// Private Objects -----------------------------------------------------------

let appendQuery = function(options: FindOptions, query?: any): FindOptions {

    if (!query) {
        return options;
    }
    options = appendPagination(options, query);

    // Inclusion parameters
    let include = [];
    if ("" === query.withAccessTokens) {
        include.push(OAuthAccessToken);
    }
    if ("" === query.withRefreshTokens) {
        include.push(OAuthRefreshToken);
    }
    if (include.length > 0) {
        options.include = include;
    }

    return options;

}

let fields: string[] = [
    "active",
    "name",
    "password",
    "scope",
    "username",
];
let fieldsWithId: string[] = [
    ...fields,
    "id"
];

