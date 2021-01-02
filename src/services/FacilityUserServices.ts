// FacilityUserServices ------------------------------------------------------

// Services implementation for Facility -> User models.

// External Modules ----------------------------------------------------------

import { FindOptions, Op } from "sequelize";

// Internal Modules ----------------------------------------------------------

import {
    fields as userFields, fieldsWithId as userFieldsWithId
} from "./UserServices";
import Facility from "../models/Facility";
import User from "../models/User";
import { hashPassword } from "../oauth/OAuthUtils";
import {BadRequest, Forbidden, NotFound} from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import { USER_ORDER } from "../util/sort-orders";

// Public Objects ------------------------------------------------------------

class FacilityUserServices {

    public async usersActive(facilityId: number, query?: any): Promise<User[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.usersActive()");
        }
        const options: FindOptions = appendQuery({
            order: USER_ORDER,
            where: {
                active: true,
            },
        }, query);
        const results = await facility.$get("users", options);
        results.forEach(result => {
            result.password = "";
        })
        return results;
    }

    public async usersAll(facilityId: number, query?: any): Promise<User[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.usersAll()");
        }
        const options: FindOptions = appendQuery({
            order: USER_ORDER
        }, query);
        const results = await facility.$get("users", options);
        results.forEach(result => {
            result.password = "";
        });
        return results;
    }

    public async usersExact(
        facilityId: number,
        username: string,
        query?: any
    ): Promise<User> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.usersExact()");
        }
        const options: FindOptions = appendQuery({
            order: USER_ORDER,
            where: {
                username: username
            },
        }, query);
        let results = await facility.$get("users", options);
        if (results.length < 1) {
            throw new NotFound(
                `names: Missing User '${name}'`,
                "FacilityServices.usersExact()");
        }
        results[0].password = "";
        return results[0];
    }

    public async usersInsert(
        facilityId: number, user: User
    ): Promise<User> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.usersInsert()");
        }
        user.facilityId = facilityId; // No cheating
        if (!user.password || (user.password.length === 0)) {
            throw new BadRequest("password:  Is required for a new User");
        }
        user.password = await hashPassword(user.password);
        const result = await User.create(user, {
            fields: userFields,
        });
        result.password = "";
        return result;
    }

    public async usersName(
        facilityId: number, name: string, query?: any
    ): Promise<User[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.usersName()");
        }
        const options: FindOptions = appendQuery({
            order: USER_ORDER,
            where: {
                name: {[Op.iLike]: `%${name}%`},
            },
        }, query);
        const results = await facility.$get("users", options);
        results.forEach(result => {
            result.password = "";
        })
        return results;
    }

    public async usersRemove(
        facilityId: number, userId: number
    ) : Promise<User> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.usersRemove()");
        }
        const removed = await User.findByPk(userId);
        if (!removed) {
            throw new NotFound(
                `userId: Missing User ${userId}`,
                "FacilityServices.usersRemove()");
        }
        if (removed.facilityId !== facility.id) { // No cheating
            throw new Forbidden(
                `userId: User ${userId} does not belong to this Facility`,
                "FacilityServices.usersRemove()");
        }
        const count = await User.destroy({
            where: { id: userId }
        });
        if (count < 1) {
            throw new NotFound(
                `userId: Cannot remove User ${userId}`,
                "FacilityServices.usersRemove()");
        }
        removed.password = "";
        return removed;
    }

    // Similar to usersExact except username must be globally unique
    public async usersUnique(
        facilityId: number,
        username: string,
        query?: any
    ): Promise<User> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.usersUnique()");
        }
        const user = await User.findOne({
            where: { username: username }
        });
        if (!user) {
            throw new NotFound(
                `username: Missing User '${username}`,
                "FacilityServices.usersUnique()");
        }
        user.password = "";
        return user;
    }

    public async usersUpdate(
        facilityId: number, userId: number, user: User
    ) : Promise<User> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.usersUpdate()");
        }
        const updated = await User.findByPk(userId);
        if (!updated) {
            throw new NotFound(
                `userId: Missing User ${userId}`,
                "FacilityServices.usersUpdate()");
        }
        if (updated.facilityId !== facility.id) { // No cheating
            throw new Forbidden(
                `userId: User ${userId} does not belong to this Facility`,
                "FacilityServices.usersUpdate()");
        }
        user.id = userId; // No cheating
        if (user.password) {
            if ((user.password === "") || (user.password === null)) {
                // No change requested, so keep the old (hashed) password
                user.password = updated.password;
            } else {
                // New change requested, so hash the new password
                user.password = await hashPassword(user.password);
            }
        } else {
            // Not specified, so keep the old (hashed) password
            user.password = updated.password;
        }
        const result: [number, User[]] = await User.update(user, {
            fields: userFieldsWithId,
            returning: true,
            where: { id: userId }
        })
        if (result[0] < 1) {
            throw new NotFound(
                `userId: Cannot update User ${userId}`,
                "FacilityServices.usersUpdate()"
            )
        }
        result[1][0].password = "";
        return result[1][0];
    }

}

export default new FacilityUserServices();

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

