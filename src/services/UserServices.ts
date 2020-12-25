// UsersServices ---------------------------------------------------------

// Services implementation for User models.

// External Modules ----------------------------------------------------------

import { FindOptions } from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractServices from "./AbstractServices";
import Facility from "../models/Facility";
import User from "../models/User";
import { NotFound } from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import { USER_ORDER } from "../util/sort-orders";

// Public Objects ------------------------------------------------------------

export class UserServices extends AbstractServices<User> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<User[]> {
        let options: FindOptions = appendQuery({
            order: USER_ORDER
        }, query);
        return User.findAll(options);
    }

    public async find(userId: number, query?: any): Promise<User> {
        let options: FindOptions = appendQuery({
            where: { id: userId }
        }, query);
        let results = await User.findAll(options);
        if (results.length === 1) {
            // @ts-ignore
            delete results[0].password;
            return results[0];
        } else {
            throw new NotFound(
                `userId: Missing User ${userId}`,
                "UserServices.find()");
        }
    }

    public async insert(user: User): Promise<User> {
        try {
            return await User.create(user, {
                fields: fields,
            });
        } catch (error) {
            throw error;
        }
    }

    public async remove(userId: number): Promise<User> {
        let removed = await User.findByPk(userId);
        if (!removed) {
            throw new NotFound(
                `userId: Missing User ${userId}`,
                "UserServices.remove()");
        }
        let count = await User.destroy({
            where: { id: userId }
        });
        if (count < 1) {
            throw new NotFound(
                `userId: Cannot remove User ${userId}`,
                "UserServices.remove()");
        }
        return removed;
    }

    public async update(userId: number, user: User): Promise<User> {
        try {
            user.id = userId;
            let result: [number, User[]] = await User.update(user, {
                fields: fieldsWithId,
                where: { id: userId }
            });
            if (result[0] < 1) {
                throw new NotFound(
                    `userId: Cannot update User ${userId}`,
                    "UserServices.update()");
            }
            return await this.find(userId);
        } catch (error) {
            throw error;
        }
    }

}

export default new UserServices();

export const fields: string[] = [
    "active",
    "facilityId",
    "name",
    "password",
    "scope",
    "username",
];

export const fieldsWithId: string[] = [
    ...fields,
    "id"
];
// Private Objects -----------------------------------------------------------

const appendQuery = (options: FindOptions, query?: any): FindOptions => {

    if (!query) {
        return options;
    }
    options = appendPagination(options, query);

    // Inclusion parameters
    let include = [];
    if ("" === query.withFacility) {
        include.push(Facility);
    }
    if (include.length > 0) {
        options.include = include;
    }

    return options;

}

