// FacilityGuestServices -----------------------------------------------------

// Services implementation for Facility -> Guest models.

// External Modules ----------------------------------------------------------

import { FindOptions, Op } from "sequelize";

// Internal Modules ----------------------------------------------------------

import {
    fields as guestFields, fieldsWithId as guestFieldsWithId
} from "./GuestServices";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import { Forbidden, NotFound } from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import { GUEST_ORDER } from "../util/sort-orders";

// Public Objects ------------------------------------------------------------

class FacilityGuestServices {

    public async guestsActive(facilityId: number, query?: any): Promise<Guest[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.guestsActive()");
        }
        const options: FindOptions = appendQuery({
            order: GUEST_ORDER,
            where: {
                active: true,
            },
        }, query);
        return await facility.$get("guests", options);
    }

    public async guestsAll(facilityId: number, query?: any): Promise<Guest[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.guestsAll()");
        }
        const options: FindOptions = appendQuery({
            order: GUEST_ORDER
        }, query);
        return await facility.$get("guests", options);
    }

    public async guestsExact(
        facilityId: number,
        firstName: string,
        lastName: string,
        query?: any
    ): Promise<Guest> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.guestsExact()");
        }
        const options: FindOptions = appendQuery({
            order: GUEST_ORDER,
            where: {
                firstName: firstName,
                lastName: lastName,
            },
        }, query);
        const results = await facility.$get("guests", options);
        if (results.length < 1) {
            throw new NotFound(
                `names: Missing Guest '${firstName} ${lastName}'`,
                "FacilityServices.guestsExact()");
        }
        return results[0];
    }

    public async guestsInsert(
        facilityId: number, guest: Guest
    ): Promise<Guest> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.guestsInsert()");
        }
        guest.facilityId = facilityId; // No cheating
        return await Guest.create(guest, {
            fields: guestFields,
        });
    }

    public async guestsName(
        facilityId: number, name: string, query?: any
    ): Promise<Guest[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.guestsName()");
        }
        const options: FindOptions = appendQuery({
            order: GUEST_ORDER,
            where: {
                [Op.or]: {
                    firstName: {[Op.iLike]: `%${name}%`},
                    lastName: {[Op.iLike]: `%${name}%`},
                }
            },
        }, query);
        return await facility.$get("guests", options);
    }

    public async guestsRemove(
        facilityId: number, guestId: number
    ) : Promise<Guest> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesName()");
        }
        const removed = await Guest.findByPk(guestId);
        if (!removed) {
            throw new NotFound(
                `guestId: Missing Guest ${guestId}`,
                "FacilityServices.guestsName()");
        }
        if (removed.facilityId !== facility.id) { // No cheating
            throw new Forbidden(
                `guestId: Guest ${guestId} does not belong to this Facility`,
                "FacilityServices.guestsRemove()");
        }
        const count = await Guest.destroy({
            where: { id: guestId }
        });
        if (count < 1) {
            throw new NotFound(
                `guestId: Cannot remove Guest ${guestId}`,
                "FacilityServices.guestsRemove()");
        }
        return removed;
    }

    public async guestsUpdate(
        facilityId: number, guestId: number, guest: Guest
    ) : Promise<Guest> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesName()");
        }
        const updated = await Guest.findByPk(guestId);
        if (!updated) {
            throw new NotFound(
                `guestId: Missing Guest ${guestId}`,
                "FacilityServices.guestsUpdate()");
        }
        if (updated.facilityId !== facility.id) { // No cheating
            throw new Forbidden(
                `guestId: Guest ${guestId} does not belong to this Facility`,
                "FacilityServices.guestsUpdate()");
        }
        guest.id = guestId; // No cheating
        const result: [number, Guest[]] = await Guest.update(guest, {
            fields: guestFieldsWithId,
            returning: true,
            where: { id: guestId }
        })
        if (result[0] < 1) {
            throw new NotFound(
                `guestId: Cannot update Guest ${guestId}`,
                "FacilityServices.guestsUpdate()"
            )
        }
        return result[1][0];
    }

}

export default new FacilityGuestServices();

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

