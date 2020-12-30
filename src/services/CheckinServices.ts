// CheckinsServices ----------------------------------------------------------

// Services implementation for Checkin models.

// External Modules ----------------------------------------------------------

import { FindOptions } from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractServices from "./AbstractServices";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import { NotFound } from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import { CHECKIN_ORDER } from "../util/sort-orders";

// Public Objects ------------------------------------------------------------

export class CheckinServices extends AbstractServices<Checkin> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<Checkin[]> {
        let options: FindOptions = appendQuery({
            order: CHECKIN_ORDER
        }, query);
        return Checkin.findAll(options);
    }

    public async find(checkinId: number, query?: any): Promise<Checkin> {
        let options: FindOptions = appendQuery({
            where: { id: checkinId }
        }, query);
        let results = await Checkin.findAll(options);
        if (results.length === 1) {
            return results[0];
        } else {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "CheckinServices.find()");
        }
    }

    public async insert(checkin: Checkin): Promise<Checkin> {
        try {
            return await Checkin.create(checkin, {
                fields: fields,
            });
        } catch (error) {
            throw error;
        }
    }

    public async remove(checkinId: number): Promise<Checkin> {
        let removed = await Checkin.findByPk(checkinId);
        if (!removed) {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "CheckinServices.remove()");
        }
        let count = await Checkin.destroy({
            where: { id: checkinId }
        });
        if (count < 1) {
            throw new NotFound(
                `checkinId: Cannot remove Checkin ${checkinId}`,
                "CheckinServices.remove()");
        }
        return removed;
    }

    public async update(checkinId: number, checkin: Checkin): Promise<Checkin> {
        try {
            checkin.id = checkinId;
            let result: [number, Checkin[]] = await Checkin.update(checkin, {
                fields: fieldsWithId,
                where: { id: checkinId }
            });
            if (result[0] < 1) {
                throw new NotFound(
                    `checkinId: Cannot update Checkin ${checkinId}`,
                    "CheckinServices.update()");
            }
            return await this.find(checkinId);
        } catch (error) {
            throw error;
        }
    }

}

export default new CheckinServices();

export const fields: string[] = [
    "checkinDate",
    "comments",
    "facilityId",
    "features",
    "guestId",
    "matNumber",
    "paymentAmount",
    "paymentType",
    "showerTime",
    "wakeupTime",
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
    if ("" === query.withGuest) {
        include.push(Guest);
    }
    if (include.length > 0) {
        options.include = include;
    }

    return options;

}

