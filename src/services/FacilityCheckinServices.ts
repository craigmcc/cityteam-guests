// FacilityCheckinServices ---------------------------------------------------

// Services implementation for Facility -> Checkin models.

// External Modules ----------------------------------------------------------

import { FindOptions, Op } from "sequelize";

// Internal Modules ----------------------------------------------------------

import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Template from "../models/Template";
import {toDateObject} from "../util/dates";
import { BadRequest, NotFound } from "../util/http-errors";
import MatsList from "../util/MatsList";
import { CHECKIN_ORDER } from "../util/sort-orders";
import {appendPagination} from "../util/query-parameters";
import Guest from "../models/Guest";
import User from "../models/User";

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
