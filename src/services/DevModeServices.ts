// DevModeServices -----------------------------------------------------------

// Development mode services for imports and reloading.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import logger from "../util/server-logger";

import Checkin from "../models/Checkin";
import Database from "../models/Database";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Template from "../models/Template";
import User from "../models/User";
import { hashPassword } from "../oauth/OAuthUtils";
import { toDateObject } from "../util/dates";
import {
    ALL_FACILITY_DATA,
    ALL_PORTLAND_TEMPLATE_DATA,
    TEST_GUEST_DATA,
    TEST_TEMPLATE_DATA,
    TEST_USER_DATA,
} from "../util/seed-data";

// Public Objects ------------------------------------------------------------

export class DevModeServices {

    // Resync database and reload data, returning all of it
    public async reload(suppress: boolean = false): Promise<any> {

        // Resynchronize database metadata
        if (!suppress) {
            logger.info({
                context: "DevModeServices.reload",
                msg: "Resynchronize Database Metadata, force=true"
            })
        }
        await Database.sync({
            force: true,
        });

        // Reload standard data
        if (!suppress) {
            logger.info({
                context: "DevModeServices.reload",
                msg: "Loading Standard Data"
            });
        }
        const allFacilities: Facility[] = await loadFacilities(ALL_FACILITY_DATA);
        const portland: Facility = await findFacilityByScope("pdx");
        const allPortlandTemplates: Template[]
            = await loadTemplates(portland, ALL_PORTLAND_TEMPLATE_DATA);

        // Load test data
        if (!suppress) {
            logger.info({
                context: "DevModeServices.reload",
                msg: "Loading Test Data"
            })
        }
        const testFacility: Facility = await findFacilityByScope("test");
        const testGuests: Guest[] = await loadGuests(testFacility, TEST_GUEST_DATA);
        const testTemplates: Template[] = await loadTemplates(testFacility, TEST_TEMPLATE_DATA);
        const testUsers: User[] = await loadUsers(testFacility, TEST_USER_DATA);
        let testCheckinsData: Partial<Checkin>[] = [];
        testGuests.forEach((testGuest, index) => {
            const testCheckin: Partial<Checkin> = {
                checkinDate: toDateObject("2020-07-04"),
                comments: `${testGuest.lastName}, ${testGuest.firstName}`,
                facilityId: testFacility.id,
                guestId: testGuest.id,
                matNumber: (index + 1),
            }
            testCheckinsData.push(testCheckin);
        });
        for (let index = 7; index <= 12; index++) {
            testCheckinsData.push({
                checkinDate: toDateObject("2020-07-04"),
                comments: "Available Checkin",
                facilityId: testFacility.id,
                matNumber: index
            });
        }
        const testCheckins: Checkin[] = await loadCheckins(testCheckinsData);
        if (!suppress) {
            logger.info({
                context: "DevModeServices.reload",
                msg: "Reload Complete"
            })
        }

        // Return results
        return {
            allCheckins: testCheckins,
            allFacilities: allFacilities,
            allPortlandTemplates: allPortlandTemplates,
            testGuests: testGuests,
            testTemplates: testTemplates,
            testUsers: testUsers,
        }

    }

}

export default new DevModeServices();

// Private Objects -----------------------------------------------------------

const findFacilityByScope = async (scope: string): Promise<Facility> => {
    const result: Facility | null = await Facility.findOne({
        where: { scope: scope }
    });
    if (result) {
        return result;
    } else {
        throw new Error(`scope: Missing Facility scope '${scope}'`);
    }
}

const loadCheckins = async (checkins: Partial<Checkin>[]): Promise<Checkin[]> => {
    return Checkin.bulkCreate(checkins);
}

const loadFacilities = async (facilities: Partial<Facility>[]): Promise<Facility[]> => {
    return Facility.bulkCreate(facilities);
}

const loadGuests = async (facility: Facility, guests: Partial<Guest>[]): Promise<Guest[]> => {
    guests.forEach(guest => {
        guest.facilityId = facility.id ? facility.id : 0;
    })
    return Guest.bulkCreate(guests);
}

const loadTemplates = async (facility: Facility, templates: Partial<Template>[]): Promise<Template[]> => {
    templates.forEach(template => {
        template.facilityId = facility.id ? facility.id : 0;
    })
    return Template.bulkCreate(templates);
}

const hashedPassword = async (password: string | undefined): Promise<string> => {
    return await hashPassword(password ? password : "");
}

const loadUsers = async (facility: Facility, users: Partial<User>[]): Promise<User[]> => {
    users.forEach(user => {
        user.facilityId = facility.id ? facility.id : 0;
    })
    const promises = await users.map(user => hashedPassword(user.password));
    const hashedPasswords: string[] = await Promise.all(promises);
    for (let i = 0; i < users.length; i++) {
        users[i].password = hashedPasswords[i];
    }
    return User.bulkCreate(users);
}
