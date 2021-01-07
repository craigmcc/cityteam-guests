// test-utils ----------------------------------------------------------------

// Generic utility methods for tests.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Template from "../models/Template";

// Public Objects ------------------------------------------------------------

export const DATA_DATE = "2020-07-04";
export const DATA_MONTH = "2020-07";
export const FACILITY_NAME = "Test Facility";

export const findFacilityByName = async (name: string): Promise<Facility> => {
    const result = await Facility.findOne({
        where: { name: name }
    });
    if (result) {
        return result;
    } else {
        throw new Error(`name: Should have found Facility ${name}`)
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
        throw new Error(`name: Should have found Facility ${facilityId}`
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
        throw new Error(`name: Should have found Facility ${facilityId}`
            + `Template '${name}'`);
    }
}

