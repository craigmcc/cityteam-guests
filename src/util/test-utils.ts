// test-utils ----------------------------------------------------------------

// Generic utility methods for tests.

// External Modules ----------------------------------------------------------

import {Op} from "sequelize";

// Internal Modules ----------------------------------------------------------

import {CHECKIN_ORDER} from "./sort-orders";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Template from "../models/Template";
import {NotFound} from "./http-errors";

// Public Objects ------------------------------------------------------------

export const CHECKINS_DATE = "2020-07-04";
export const CHECKINS_MONTH = "2020-07";
export const FACILITY_NAME = "Test Facility";

export const findCheckinById = async (checkinId: number): Promise<Checkin> => {
    const result = await Checkin.findByPk(checkinId);
    if (result) {
        return result;
    } else {
        throw new NotFound(`checkinId: Missing checkinId ${checkinId}`)
    }
}

export const findCheckinsAll
    = async (facilityId: number, checkinDate: string)
    : Promise<Checkin[]> =>
{
    const results = await Checkin.findAll({
        order: CHECKIN_ORDER,
        where: {
            checkinDate: checkinDate,
            facilityId: facilityId,
        }
    });
    return results;
}

export const findCheckinsAvailable
    = async (facilityId: number, checkinDate: string)
    : Promise<Checkin[]> =>
{
    const results = await Checkin.findAll({
        order: CHECKIN_ORDER,
        where: {
            checkinDate: checkinDate,
            facilityId: facilityId,
            guestId: { [Op.eq]: null },
        }
    });
    return results;
}

export const findFacilityByName = async (name: string): Promise<Facility> => {
    const result = await Facility.findOne({
        where: { name: name }
    });
    if (result) {
        return result;
    } else {
        throw new NotFound(`name: Should have found Facility ${name}`)
    }
}

export const findGuestByName
    = async (facilityId: number, firstName: string, lastName: string)
    : Promise<Guest> =>
{
    const result = await Guest.findOne({
        where: {
            facilityId: facilityId,
            firstName: firstName,
            lastName: lastName
        }
    });
    if (result) {
        return result;
    } else {
        throw new NotFound(`name: Should have found Facility ${facilityId} `
            + `Guest '${firstName}' '${lastName}'`);
    }
}

export const findTemplateByName
    = async (facilityId: number, name: string)
    : Promise<Template> =>
{
    const result = await Template.findOne({
        where: {
            facilityId: facilityId,
            name: name
        }
    });
    if (result) {
        return result;
    } else {
        throw new NotFound(`name: Should have found Facility ${facilityId} `
            + `Template '${name}'`);
    }
}

export const insertGuest
    = async (facilityId: number, active: boolean, firstName: string, lastName: string)
    : Promise<Guest> =>
{
    const guest: any = {
        active: active,
        facilityId: facilityId,
        firstName: firstName,
        lastName: lastName
    };
    const result = await Guest.create(guest);
    return result;
}

