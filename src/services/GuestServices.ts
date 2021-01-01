// GuestServices -------------------------------------------------------------

// Services implementation for Guest models.

// External Modules ----------------------------------------------------------

import { FindOptions } from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractServices from "./AbstractServices";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import { NotFound } from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import { GUEST_ORDER } from "../util/sort-orders";

// Public Objects ------------------------------------------------------------

export class GuestServices extends AbstractServices<Guest> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<Guest[]> {
        let options: FindOptions = appendQuery({
            order: GUEST_ORDER
        }, query);
        return Guest.findAll(options);
    }

    public async find(guestId: number, query?: any): Promise<Guest> {
        let options: FindOptions = appendQuery({
            where: { id: guestId }
        }, query);
        let results = await Guest.findAll(options);
        if (results.length === 1) {
            return results[0];
        } else {
            throw new NotFound(
                `guestId: Missing Guest ${guestId}`,
                "GuestServices.find()");
        }
    }

    public async insert(guest: Guest): Promise<Guest> {
        try {
            return await Guest.create(guest, {
                fields: fields,
            });
        } catch (error) {
            throw error;
        }
    }

    public async remove(guestId: number): Promise<Guest> {
        let removed = await Guest.findByPk(guestId);
        if (!removed) {
            throw new NotFound(
                `guestId: Missing Guest ${guestId}`,
                "GuestServices.remove()");
        }
        let count = await Guest.destroy({
            where: { id: guestId }
        });
        if (count < 1) {
            throw new NotFound(
                `guestId: Cannot remove Guest ${guestId}`,
                "GuestServices.remove()");
        }
        return removed;
    }

    public async update(guestId: number, guest: Guest): Promise<Guest> {
        try {
            guest.id = guestId;
            let result: [number, Guest[]] = await Guest.update(guest, {
                fields: fieldsWithId,
                where: { id: guestId }
            });
            if (result[0] < 1) {
                throw new NotFound(
                    `guestId: Cannot update Guest ${guestId}`,
                    "GuestServices.update()");
            }
            return await this.find(guestId);
        } catch (error) {
            throw error;
        }
    }

    // Model-Specific Methods ------------------------------------------------

}

export default new GuestServices();

export const fields: string[] = [
    "active",
    "comments",
    "facilityId",
    "favorite",
    "firstName",
    "lastName",
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
    if ("" === query.withCheckins) {
        include.push(Checkin);
    }
    if ("" === query.withFacility) {
        include.push(Facility);
    }
    if (include.length > 0) {
        options.include = include;
    }

    return options;

}

