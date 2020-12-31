// FacilityServices ----------------------------------------------------------

// Services implementation for Facility models.

// External Modules ----------------------------------------------------------

import { FindOptions, Op } from "sequelize";

// Internal Modules ----------------------------------------------------------

import AbstractServices from "./AbstractServices";
import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Summary from "../models/Summary";
import Template from "../models/Template";
import User from "../models/User";
import CheckinServices, {
    fields as checkinFields,
    fieldsWithId as checkinFieldsWithId
} from "./CheckinServices";
import GuestServices, {
    fields as guestFields,
    fieldsWithId as guestFieldsWithId
} from "./GuestServices";
import TemplateServices, {
    fields as templateFields,
    fieldsWithId as templateFieldsWithId
} from "./TemplateServices";
import UserServices, {
    fields as userFields,
    fieldsWithId as userFieldsWithId
} from "./UserServices";

import {BadRequest, Forbidden, NotFound} from "../util/http-errors";
import { appendPagination } from "../util/query-parameters";
import {
    CHECKIN_ORDER,
    FACILITY_ORDER,
    GUEST_ORDER,
    TEMPLATE_ORDER, USER_ORDER
} from "../util/sort-orders";
import {hashPassword} from "../oauth/OAuthUtils";
import MatsList from "../util/MatsList";
import {toDateObject} from "../util/dates";

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

    // ***** Assign Interactions *****

    public async assignsAssign
        (facilityId: number, checkinId: number, assign: Assign): Promise<Checkin> {

        // Validate required fields in the specified Assign
        if (!assign.facilityId) {
            throw new BadRequest(
                `assign: Missing facilityId in assign data`,
                "FacilityServices.assignsAssign()");
        }
        if (!assign.guestId) {
            throw new BadRequest(
                `assign: Missing guestId in assign data`,
                "FacilityServices.assignsAssign()");
        }

        // Look up the corresponding Facility
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.assignsAssign()");
        }

        // Look up the corresponding Checkin
        const checkin = await Checkin.findByPk(checkinId);
        if (!checkin) {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "FacilityServices.assignsAssign()");
        }

        // Verify the status of this Checkin
        if (checkin.facilityId !== facility.id) {
            throw new BadRequest(
                `checkinId: Checkin ${checkinId} does not belong to Facility ${facilityId}`,
                "FacilityServices.assignsAssign()");
        }
        if (checkin.guestId && (checkin.guestId != assign.guestId)) {
            throw new BadRequest(
                `checkinId: Checkin ${checkinId} is already assigned to Guest ${checkin.guestId}`,
                "FacilityServices.assignsAssign()");
        }

        // For an unassigned Checkin, verify that this guestId is not checked in elsewhere
        if (!checkin.guestId) {
            const options = {
                where: {
                    checkinDate: checkin.checkinDate,
                    facilityId: checkin.facilityId,
                    guestId: assign.guestId,
                }
            }
            const results = await Checkin.findAll(options);
            if (results.length > 0) {
                throw new BadRequest(
                    `guestId: Guest ${assign.guestId} is already assigned to mat ${results[0].matNumber}`,
                    "FacilityServices.assignsAssign()");
            }
        }

        // Perform the assignment and return the updated Checkin
        checkin.comments = assign.comments ? assign.comments : undefined;
        checkin.guestId = assign.guestId;
        checkin.paymentAmount = assign.paymentAmount;
        checkin.paymentType = assign.paymentType;
        checkin.showerTime = assign.showerTime ? toDateObject(assign.showerTime) : undefined;
        checkin.wakeupTime = assign.wakeupTime ? toDateObject(assign.wakeupTime) : undefined;
        console.info("FacilityServices.assignsAssign.attempting("
            + JSON.stringify(checkin)
            + ")");
        const [count, results] = await Checkin.update(checkin, {
            where: {
                id: checkinId
            }
        });
        if (count !== 1) {
            throw new BadRequest(
                `checkId: Cannot update Checkin ${checkinId}`
            )
        }
        return results[0];

    }

    public async assignsDeassign
        (facilityId: number, checkinId: number): Promise<Checkin> {

        // Look up the corresponding Facility
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.assignsDeassign()");
        }

        // Look up the corresponding Checkin
        const checkin = await Checkin.findByPk(checkinId);
        if (!checkin) {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "FacilityServices.assignsDeassign()");
        }

        // Verify the status of this Checkin
        if (checkin.facilityId !== facility.id) {
            throw new BadRequest(
                `checkinId: Checkin ${checkinId} does not belong to Facility ${facilityId}`,
                "FacilityServices.assignsDeassign()");
        }
        if (!checkin.guestId) {
            throw new BadRequest(
                `checkinId: Checkin ${checkinId} is not currently assigned`,
                "FacilityServices.assignsDeassign()");
        }

        // Update the Checkin and return it.
        const newCheckin: Partial<Checkin> = {
            comments: undefined,
            guestId: undefined,
            paymentAmount: undefined,
            paymentType: undefined,
            showerTime: undefined,
            wakeupTime: undefined,
        }
        const [count, results] = await Checkin.update(newCheckin, {
            where: {
                id: checkinId
            }
        });
        if (count !== 1) {
            throw new BadRequest(
                `checkId: Cannot update Checkin ${checkinId}`
            )
        }
        return results[0];

    }

    public async assignsReassign
        (facilityId: number, oldCheckinId: number, newCheckinId: number): Promise<Checkin> {

        // Look up the corresponding Facility
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.assignsReassign()");
        }

        // Look up the corresponding old Checkin
        const oldCheckin = await Checkin.findByPk(oldCheckinId);
        if (!oldCheckin) {
            throw new NotFound(
                `checkinId: Missing old Checkin ${oldCheckinId}`,
                "FacilityServices.assignsReassign()");
        }

        // Verify the status of the old Checkin
        if (oldCheckin.facilityId !== facility.id) {
            throw new BadRequest(
                `checkinId: Old Checkin ${oldCheckinId} does not belong to Facility ${facilityId}`,
                "FacilityServices.assignsReassign()");
        }
        if (!oldCheckin.guestId) {
            throw new BadRequest(
                `checkinId: Old Checkin ${oldCheckinId} is not currently assigned`,
                "FacilityServices.assignsReassign()");
        }

        // Look up the corresponding new Checkin
        const newCheckin = await Checkin.findByPk(newCheckinId);
        if (!newCheckin) {
            throw new NotFound(
                `checkinId: Missing new Checkin ${newCheckinId}`,
                "FacilityServices.assignsReassign()");
        }

        // Verify the status of the new Checkin
        if (newCheckin.facilityId !== facility.id) {
            throw new BadRequest(
                `checkinId: New Checkin ${newCheckinId} does not belong to Facility ${facilityId}`,
                "FacilityServices.assignsReassign()");
        }
        if (newCheckin.guestId) {
            throw new BadRequest(
                `checkinId: New Checkin ${newCheckinId} is assigned to Guest ${newCheckin.guestId}`,
                "FacilityServices.assignsReassign()");
        }

        // Update and save the new Checkin
        const newUpdate: Partial<Checkin> = {
            comments: oldCheckin.comments ? oldCheckin.comments : undefined,
            guestId: oldCheckin.guestId,
            paymentAmount: oldCheckin.paymentAmount ? oldCheckin.paymentAmount : undefined,
            paymentType: oldCheckin.paymentType ? oldCheckin.paymentType : undefined,
            showerTime: oldCheckin.showerTime ? oldCheckin.showerTime : undefined,
            wakeupTime: oldCheckin.wakeupTime ? oldCheckin.wakeupTime : undefined,
        }
        const [newCount, newResults] = await Checkin.update(newCheckin, {
            where: {
                id: newCheckinId
            }
        });
        if (newCount !== 1) {
            throw new BadRequest(
                `newCheckinId: Cannot update Checkin ${newCheckinId}`,
                "FacilityServices.assignsReassign()"
            )
        }

        // Update and save the old Checkin
        const oldCheckinUpdate: Partial<Checkin> = {
            comments: undefined,
            guestId: undefined,
            paymentAmount: undefined,
            paymentType: undefined,
            showerTime: undefined,
            wakeupTime: undefined,
        }
        const [oldCount, oldResults] = await Checkin.update(oldCheckinUpdate, {
            where: {
                id: oldCheckinId
            }
        });
        if (oldCount !== 1) {
            throw new BadRequest(
                `oldCheckinId: Cannot update Checkin ${oldCheckinId}`,
                "FacilityServices.assignsReassign()"

            )
        }

        // Return the updated new Checkin
        return newResults[0];

    }

    // ***** Checkin Interactions *****

    public async checkinsAll(facilityId: number, checkinDate: string, query?: any): Promise<Checkin[]> {
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

    public async checkinsAvailable(facilityId: number, checkinDate: string, query?: any): Promise<Checkin[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkinsAvailable()");
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

    public async checkinsGenerate(
            facilityId: number,
            checkinDate: string,
            templateId: number): Promise<Checkin[]>
    {

        console.info("FacilityServices.arguments("
            + facilityId + ", "
            + checkinDate + ", "
            + templateId
            + ")");
        // Look up the requested Facility and Template
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkinsGenerate()");
        }
        const template = await Template.findByPk(templateId);
        if (!template) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "FacilityServices.checkinsGenerate()");
        }
        if (template.facilityId !== facility.id) {
            throw new BadRequest(
                `templateId: Template ${templateId} does not belong to this Facility`,
                "FacilityServices.checkinsGenerate()");
        }

        // Verify that there are no checkins for this combination already
        let options: FindOptions = {
            where: {
                checkinDate: checkinDate,
                facilityId: facilityId,
            }
        }
        const count: number = await Checkin.count(options);
        if (count > 0) {
            throw new BadRequest(
                `checkinDate: There are already ${count} checkins for this date`,
                "FacilityServices.checkinsGenerate()");
        }

        // Set up the parameters we will need
        const allMats = new MatsList(template.allMats);
        const handicapMats = new MatsList(template.handicapMats);
        const socketMats = new MatsList(template.socketMats);
        const workMats = new MatsList(template.workMats);

        // Accumulate the requested (and unassigned) checkins to be created
        const inputs: Partial<Checkin>[] = [];
        allMats.exploded().forEach(matNumber => {
            let features: string | null = "";
            if (handicapMats && handicapMats.isMemberOf(matNumber)) {
                features += "H";
            }
            if (socketMats && socketMats.isMemberOf(matNumber)) {
                features += "S";
            }
            if (workMats && workMats.isMemberOf(matNumber)) {
                features += "W";
            }
            if (features.length === 0) {
                features = null;
            }
            const input: Partial<Checkin> = {
                checkinDate: toDateObject(checkinDate),
                facilityId: facilityId,
                features: features ? features : undefined,
                guestId: undefined,
                matNumber: matNumber,
            }
            inputs.push(input);
        });

        // Persist and return the requested checkins
        console.info("FacilityServices.checkinsGenerate.inputs("
            + JSON.stringify(inputs)
            + ")");
        const outputs = await Checkin.bulkCreate(inputs, {
            fields: ["checkinDate", "facilityId", "features", "matNumber"]
        });
        console.info("FacilityServices.checkinsGenerate.outputs("
            + JSON.stringify(outputs)
            + ")");
        return outputs;

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
            where: { id: guestId }
        })
        if (result[0] < 1) {
            throw new NotFound(
                `guestId: Cannot update Guest ${guestId}`,
                "FacilityServices.guestsUpdate()"
            )
        }
        return await GuestServices.find(guestId);
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
                "FacilityServices.templatesRemove()");
        }
        const removed = await Template.findByPk(templateId);
        if (!removed) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "FacilityServices.templatesRemove()");
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
                "FacilityServices.templatesUpdate()");
        }
        const updated = await Template.findByPk(templateId);
        if (!updated) {
            throw new NotFound(
                `templateId: Missing Template ${templateId}`,
                "FacilityServices.templatesUpdate()");
        }
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

    // ***** User Interactions *****

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
            // @ts-ignore
            delete result.password;
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
            // @ts-ignore
            delete result.password;
        })
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
        // @ts-ignore
        delete results[0].password;
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
        if (!user.password) {
            throw new BadRequest("password:  Is required for a new User");
        }
        user.password = await hashPassword(user.password);
        const result = await User.create(user, {
            fields: userFields,
        });
        // @ts-ignore
        delete result.password;
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
            // @ts-ignore
            delete result.password;
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
        // @ts-ignore
        delete removed.password;
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
                "FacilityServices.usersExact()");
        }
        const user = await User.findOne({
            where: { username: username }
        });
        if (!user) {
            throw new NotFound(
                `username: Missing User '${username}`,
                "FacilityServices.usersUnique()");
        }
        // @ts-ignore
        delete user.password;
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
        if (user.password !== undefined) {
            if (!user.password || (user.password.length === 0)) {
                // @ts-ignore
                delete user.password;
            } else {
                user.password = await hashPassword(user.password);
            }
        }
        const result: [number, User[]] = await User.update(user, {
            fields: userFieldsWithId,
            where: { id: userId }
        })
        if (result[0] < 1) {
            throw new NotFound(
                `userId: Cannot update User ${userId}`,
                "FacilityServices.usersUpdate()"
            )
        }
        return await UserServices.find(userId);
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
