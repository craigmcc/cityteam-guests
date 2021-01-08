// FacilityCheckinServices ---------------------------------------------------

// Services implementation for Facility -> Checkin models.

// External Modules ----------------------------------------------------------

import { FindOptions, Op } from "sequelize";

// Internal Modules ----------------------------------------------------------

import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Summary from "../models/Summary";
import Template from "../models/Template";
import {toDateObject} from "../util/dates";
import { BadRequest, NotFound } from "../util/http-errors";
import MatsList from "../util/MatsList";
import {appendPagination} from "../util/query-parameters";
import { CHECKIN_ORDER } from "../util/sort-orders";

// Public Objects ------------------------------------------------------------

class FacilityCheckinServices {

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
                guestId: { [Op.eq]: null },
            }
        }, query);
        return await facility.$get("checkins", options);
    }

    public async checkinsGenerate(
        facilityId: number,
        checkinDate: string,
        templateId: number): Promise<Checkin[]>
    {

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
        const outputs = await Checkin.bulkCreate(inputs, {
            fields: ["checkinDate", "facilityId", "features", "matNumber"]
        });
        return outputs;

    }

    public async checkinsGuest(facilityId: number, guestId: number, query?: any): Promise<Checkin[]> {
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkinsGuest()");
        }
        const options: FindOptions = appendQuery({
            order: CHECKIN_ORDER,
            where: {
                guestId: guestId
            }
        }, query);
        return await facility.$get("checkins", options);
    }

    public async checkinsSummaries(
        facilityId: number,
        checkinDateFrom: string,
        checkinDateTo: string
    ): Promise<Summary[]> {

        // Select the relevant Checkins for this Facility and date range
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.checkinsSummaries()");
        }
        const options: FindOptions = {
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

        // Accumulate and return the corresponding Summaries
        const summaries: Summary[] = [];
        let summary: Summary = new Summary(-1);
        checkins.map(checkin => {
            if (summary.facilityId < 0) {
                summary = new Summary(checkin.facilityId, checkin.checkinDate);
            }
            if (checkin.checkinDate !== summary.checkinDate) {
                summaries.push(summary);
                summary = new Summary(checkin.facilityId, checkin.checkinDate);
            }
            summary.includeCheckin(checkin);
        });
        if (summary.facilityId >= 0) {
            summaries.push(summary);
        }
        return summaries;

    }

}

export default new FacilityCheckinServices();

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
