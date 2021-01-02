// FacilityServices ----------------------------------------------------------

// Services implementation for Facility models.

// External Modules ----------------------------------------------------------

import { FindOptions, Op } from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractServices from "./AbstractServices";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Summary from "../models/Summary";
import Template from "../models/Template";
import User from "../models/User";
import {
    fields as guestFields,
    fieldsWithId as guestFieldsWithId
} from "./GuestServices";
import {
    fields as templateFields,
    fieldsWithId as templateFieldsWithId
} from "./TemplateServices";
import {
    fields as userFields,
    fieldsWithId as userFieldsWithId
} from "./UserServices";

import { BadRequest, Forbidden, NotFound } from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import {
    CHECKIN_ORDER,
    FACILITY_ORDER,
    GUEST_ORDER,
    TEMPLATE_ORDER, USER_ORDER
} from "../util/sort-orders";
import { hashPassword } from "../oauth/OAuthUtils";

// Public Objects ------------------------------------------------------------

export class FacilityServices extends AbstractServices<Facility> {

    // Standard CRUD Methods -------------------------------------------------

    public async all(query?: any): Promise<Facility[]> {
        const options: FindOptions = appendQuery({
            order: FACILITY_ORDER
        }, query);
        return Facility.findAll(options);
    }

    public async find(facilityId: number, query?: any): Promise<Facility> {
        const options: FindOptions = appendQuery({
            where: { id: facilityId }
        }, query);
        const results = await Facility.findAll(options);
        if (results.length === 1) {
            return results[0];
        } else {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.find()");
        }
    }

    public async insert(facility: Facility): Promise<Facility> {
        return await Facility.create(facility, {
            fields: fields,
        });
    }

    public async remove(facilityId: number): Promise<Facility> {
        const removed = await Facility.findByPk(facilityId);
        if (!removed) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.remove()");
        }
        const count = await Facility.destroy({
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
        facility.id = facilityId;
        const result: [number, Facility[]] = await Facility.update(facility, {
            fields: fieldsWithId,
            returning: true,
            where: { id: facilityId }
        });
        if (result[0] < 1) {
            throw new NotFound(
                `facilityId: Cannot update Facility ${facilityId}`,
                "FacilityServices.update()");
        }
        return result[1][0];
    }

    // Model-Specific Methods ------------------------------------------------

    // ***** Facility Lookups *****

    public async active(query?: any): Promise<Facility[]> {
        const options: FindOptions = appendQuery({
            order: FACILITY_ORDER,
            where: {
                active: true
            }
        }, query);
        return await Facility.findAll(options);
    }

    public async exact(name: string, query?: any): Promise<Facility> {
        const options: FindOptions = appendQuery({
            where: {
                name: name
            }
        }, query);
        let results = await Facility.findAll(options);
        if (results.length !== 1) {
            throw new NotFound(
                `name: Missing Facility name '${name}'`,
                "FacilityServices.exact()");
        }
        return results[0];
    }

    public async name(name: string, query?: any): Promise<Facility[]> {
        const options: FindOptions = appendQuery({
            order: FACILITY_ORDER,
            where: {
                name: { [Op.iLike]: `%${name}%` }
            }
        }, query);
        return await Facility.findAll(options);
    }

    public async scope(scope: string, query?: any): Promise<Facility> {
        const options: FindOptions = appendQuery({
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

    // ***** Summary Lookups *****

    public async summaries(facilityId: number, checkinDateFrom: string, checkinDateTo: string): Promise<Summary[]> {

        // Retrieve the relevant registrations
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(`facilityId: Missing Facility ${facilityId}`);
        }
        const options = {
            order: CHECKIN_ORDER,
            where: {
                checkinDate: {
                    [Op.and]: {
                        [Op.gte]: checkinDateFrom,
                        [Op.lte]: checkinDateTo
                    }
                }
            }
        }
        const checkins = await facility.$get("checkins", options);

        // Summarize and return them
        const summaries: Summary[] = [];
        let summary: Summary | null = null;
        checkins.map(checkin => {
            if (summary && (summary.checkinDate !== checkin.checkinDate)) {
                summaries.push(summary);
                summary = null;
            }
            if (!summary) {
                summary = new Summary(checkin.facilityId, checkin.checkinDate);
            }
            if (checkin.guestId) {
                summary.totalAssigned++;
            } else {
                summary.totalUnassigned++;
            }
            if (checkin.paymentAmount) {
                summary.totalAmount += checkin.paymentAmount;
            }
            if (checkin.paymentType) {
                switch (checkin.paymentType) {
                    case "$$": summary.total$$++; break;
                    case "AG": summary.totalAG++; break;
                    case "CT": summary.totalCT++; break;
                    case "FM": summary.totalFM++; break;
                    case "MM": summary.totalMM++; break;
                    case "SW": summary.totalSW++; break;
                    case "UK": summary.totalUK++; break;
                    case "WB": summary.totalWB++; break;
                    default:
                        summary.totalUK++;
                }
            }
        });
        if (summary) {
            summaries.push(summary);
        }
        return summaries;
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
    if ("" === query.withFacility) {
        include.push(Facility);
    }
    if ("" === query.withGuest) {
        include.push(Guest);
    }
    if ("" === query.withGuests) {
        include.push(Guest);
    }
    if ("" === query.withTemplates) {
        include.push(Template);
    }
    if ("" === query.withUsers) {
        include.push(User);
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
