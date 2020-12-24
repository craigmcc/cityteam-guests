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
import TemplateServices, {
    fields as templateFields,
    fieldsWithId as templateFieldsWithId
} from "./TemplateServices";

import {Forbidden, NotFound} from "../util/http-errors";
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
            where: { id: facilityId }
        });
        if (result[0] < 1) {
            throw new NotFound(
                `facilityId: Cannot update Facility ${facilityId}`,
                "FacilityServices.update()");
        }
        return await this.find(facilityId);
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

    // ***** Checkin Interactions *****

    public async checkinsAll(facilityId: number, query?: any): Promise<Checkin[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkinsAll()");
        }
        const options: FindOptions = appendQuery({
            order: CHECKIN_ORDER
        }, query);
        return await facility.$get("checkins", options);
    }

    public async checkinsAvailable(facilityId: number, checkinDate: string, query?: any): Promise<Checkin[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkinsAll()");
        }
        const options: FindOptions = appendQuery({
            order: CHECKIN_ORDER,
            where: {
                checkinDate: checkinDate,
                guestId: { [ Op.eq]: null },
            }
        }, query);
        return await facility.$get("checkins", options);
    }

    public async checkinsDate(facilityId: number, checkinDate: string, query?: any): Promise<Checkin[]> {
        const facility = await Facility.findByPk(facilityId);
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

    // ***** Guest Interactions *****

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
                        console.error("Bad checkin.paymentType: "
                            + JSON.stringify(checkin, ["id", "facilityId", "matNumber", "paymentType"]));
                        summary.totalUK++;
                }
            }
        });
        if (summary) {
            summaries.push(summary);
        }
        return summaries;
    }

    // ***** Template Interactions *****

    public async templatesActive(facilityId: number, query?: any): Promise<Template[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesActive()");
        }
        const options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER,
            where: {
                active: true,
            },
        }, query);
        return await facility.$get("templates", options);
    }

    public async templatesAll(facilityId: number, query?: any): Promise<Template[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesAll()");
        }
        const options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER
        }, query);
        return await facility.$get("templates", options);
    }

    public async templatesExact(
        facilityId: number,
        name: string,
        query?: any
    ): Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesExact()");
        }
        const options: FindOptions = appendQuery({
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

    public async templatesInsert(
        facilityId: number, template: Template
    ): Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesInsert()");
        }
        template.facilityId = facilityId; // No cheating
        return await Template.create(template, {
            fields: templateFields,
        });
    }

    public async templatesName(
        facilityId: number, name: string, query?: any
    ): Promise<Template[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesName()");
        }
        const options: FindOptions = appendQuery({
            order: TEMPLATE_ORDER,
            where: {
                name: {[Op.iLike]: `%${name}%`},
            },
        }, query);
        return await facility.$get("templates", options);
    }

    public async templatesRemove(
        facilityId: number, templateId: number
    ) : Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesName()");
        }
        const removed = await Template.findByPk(templateId);
        if (!removed) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "FacilityServices.templatesName()");
        }
        if (removed.facilityId !== facility.id) { // No cheating
            throw new Forbidden(
                `templateId: Template ${templateId} does not belong to this Facility`,
                "FacilityServices.templatesRemove()");
        }
        const count = await Template.destroy({
            where: { id: templateId }
        });
        if (count < 1) {
            throw new NotFound(
                `templateId: Cannot remove Template ${templateId}`,
                "FacilityServices.templatesRemove()");
        }
        return removed;
    }

    public async templatesUpdate(
        facilityId: number, templateId: number, template: Template
    ) : Promise<Template> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.templatesName()");
        }
        console.info("templatesUpdate.facility = ", JSON.stringify(facility));
        const updated = await Template.findByPk(templateId);
        if (!updated) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "FacilityServices.templatesName()");
        }
        console.info("templatesUpdate.template = ", JSON.stringify(updated));
        if (updated.facilityId !== facility.id) { // No cheating
            throw new Forbidden(
                `templateId: Template ${templateId} does not belong to this Facility`,
                "FacilityServices.templatesUpdate()");
        }
        template.id = templateId; // No cheating
        const result: [number, Template[]] = await Template.update(template, {
            fields: templateFieldsWithId,
            where: { id: templateId }
        })
        if (result[0] < 1) {
            throw new NotFound(
                `templateId: Cannot update Template ${templateId}`,
                "FacilityServices.templatesUpdate()"
            )
        }
        return await TemplateServices.find(templateId);
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
