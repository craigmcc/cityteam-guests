// FacilityServices ----------------------------------------------------------

// Services implementation for Facility models.

// External Modules ----------------------------------------------------------

import { FindOptions, Op } from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractServices from "./AbstractServices";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Template from "../models/Template";
import { NotFound } from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import {
    CHECKIN_ORDER,
    FACILITY_ORDER,
    GUEST_ORDER,
    TEMPLATE_ORDER
} from "../util/sort-orders";

// Public Objects ------------------------------------------------------------

export class FacilityServices extends AbstractServices<Facility> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<Facility[]> {
        let options: FindOptions = appendQuery({
            order: FACILITY_ORDER
        }, query);
        return Facility.findAll(options);
    }

    public async find(facilityId: number, query?: any): Promise<Facility> {
        let options: FindOptions = appendQuery({
            where: { id: facilityId }
        }, query);
        let results = await Facility.findAll(options);
        if (results.length === 1) {
            return results[0];
        } else {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.find()");
        }
    }

    public async insert(facility: Facility): Promise<Facility> {
        try {
            return await Facility.create(facility, {
                fields: fields,
            });
        } catch (error) {
            throw error;
        }
    }

    public async remove(facilityId: number): Promise<Facility> {
        let removed = await Facility.findByPk(facilityId);
        if (!removed) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.remove()");
        }
        let count = await Facility.destroy({
            where: { id: facilityId }
        });
        if (count < 1) {
            throw new NotFound(
                `facilityId: Cannot remove Facility ${facilityId}`,
                "FacilityServices.remove()");
        }
        return removed;
    }

    public async update(facilityId: number, facility: Facility): Promise<Facility> {
        try {
            facility.id = facilityId;
            let result: [number, Facility[]] = await Facility.update(facility, {
                fields: fieldsWithId,
                where: { id: facilityId }
            });
            if (result[0] < 1) {
                throw new NotFound(
                    `facilityId: Cannot update Facility ${facilityId}`,
                    "FacilityServices.update()");
            }
            return await this.find(facilityId);
        } catch (error) {
            throw error;
        }
    }

    // Model-Specific Methods ------------------------------------------------

    // ***** Facility Lookups *****

    public async active(query?: any): Promise<Facility[]> {
        let options: FindOptions = appendQuery({
            order: FACILITY_ORDER,
            where: {
                active: true
            }
        }, query);
        return await Facility.findAll(options);
    }

    public async exact(name: string, query?: any): Promise<Facility> {
        let options: FindOptions = appendQuery({
            where: {
                name: name
            }
        }, query);
        let results = await Facility.findAll(options);
        if (results.length !== 1) {
            throw new NotFound(
                `name: Missing Facility '${name}'`,
                "FacilityServices.exact()");
        }
        return results[0];
    }

    public async name(name: string, query?: any): Promise<Facility[]> {
        let options: FindOptions = appendQuery({
            order: FACILITY_ORDER,
            where: {
                name: { [Op.iLike]: `%${name}%` }
            }
        }, query);
        return await Facility.findAll(options);
    }

    public async scope(scope: string, query?: any): Promise<Facility> {
        let options: FindOptions = appendQuery({
            where: {
                scope: scope
            }
        }, query);
        let results = await Facility.findAll(options);
        if (results.length !== 1) {
            throw new NotFound(
                `username: Missing Facility scope '${scope}'`,
                "FacilityServices.scope()");
        }
        return results[0];
    }

    // ***** Checkin Lookups *****

    public async checkinsAll(facilityId: number, query?: any): Promise<Checkin[]> {
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkinsAll()");
        }
        let options: FindOptions = appendQuery({
            order: CHECKIN_ORDER
        }, query);
        return await facility.$get("checkins", options);
    }

    public async checkinsAvailable(facilityId: number, checkinDate: string, query?: any): Promise<Checkin[]> {
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkinsAll()");
        }
        let options: FindOptions = appendQuery({
            order: CHECKIN_ORDER,
            where: {
                checkinDate: checkinDate,
                guestId: { [ Op.eq]: null },
            }
        }, query);
        return await facility.$get("checkins", options);
    }

    public async checkinsDate(facilityId: number, checkinDate: string, query?: any): Promise<Checkin[]> {
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkinsAll()");
        }
        let options: FindOptions = appendQuery({
            order: CHECKIN_ORDER,
            where: { checkinDate: checkinDate }
        }, query);
        return await facility.$get("checkins", options);
    }

    // TODO - checkinsSummary()

    // ***** Guest Lookups *****

    public async guestsActive(facilityId: number, query?: any): Promise<Guest[]> {
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.guestsActive()");
        }
        let options: FindOptions = appendQuery({
            order: GUEST_ORDER,
            where: {
                active: true,
            },
        }, query);
        return await facility.$get("guests", options);
    }

    public async guestsAll(facilityId: number, query?: any): Promise<Guest[]> {
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.guestsAll()");
        }
        let options: FindOptions = appendQuery({
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
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.guestsExact()");
        }
        let options: FindOptions = appendQuery({
            order: GUEST_ORDER,
            where: {
                firstName: firstName,
                lastName: lastName,
            },
        }, query);
        let results = await facility.$get("guests", options);
        if (results.length < 1) {
            throw new NotFound(
                `names: Missing Guest '${firstName} ${lastName}'`,
                "FacilityServices.guestsExact()");
        }
        return results[0];
    }

    public async guestsName(
        facilityId: number, name: string, query?: any
    ): Promise<Guest[]> {
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityService.guestsName()");
        }
        let options: FindOptions = appendQuery({
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

    // ***** Template Lookups *****

    public async templatesActive(facilityId: number, query?: any): Promise<Template[]> {
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesActive()");
        }
        let options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER,
            where: {
                active: true,
            },
        }, query);
        return await facility.$get("templates", options);
    }

    public async templatesAll(facilityId: number, query?: any): Promise<Template[]> {
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesAll()");
        }
        let options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER
        }, query);
        return await facility.$get("templates", options);
    }

    public async templatesExact(
        facilityId: number,
        name: string,
        query?: any
    ): Promise<Template> {
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesExact()");
        }
        let options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER,
            where: {
                name: name
            },
        }, query);
        let results = await facility.$get("templates", options);
        if (results.length < 1) {
            throw new NotFound(
                `names: Missing Template '${name}'`,
                "FacilityServices.templatesExact()");
        }
        return results[0];
    }

    public async templatesName(
        facilityId: number, name: string, query?: any
    ): Promise<Template[]> {
        let facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityService.templatesName()");
        }
        let options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER,
            where: {
                name: {[Op.iLike]: `%${name}%`},
            },
        }, query);
        return await facility.$get("templates", options);
    }

}

export default new FacilityServices();

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
    if ("" === query.withGuests) {
        include.push(Guest);
    }
    if ("" === query.withTemplates) {
        include.push(Template);
    }
    if (include.length > 0) {
        options.include = include;
    }

    return options;

}

let fields: string[] = [
    "active",
    "address1",
    "address2",
    "city",
    "email",
    "name",
    "phoneNumber",
    "scope",
    "state",
    "zipCode",
];
let fieldsWithId: string[] = [
    ...fields,
    "id"
];
