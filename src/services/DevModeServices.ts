// DevModeServices -----------------------------------------------------------

// Development mode services for imports and reloading.

// External Modules ----------------------------------------------------------

import neatCsv from "neat-csv";
import { FindOptions } from "sequelize";

// Internal Modules ----------------------------------------------------------

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
    public async reload(): Promise<any> {

        // Resynchronize database metadata
        console.log("reload: Resynchronize Database Metadata: Starting");
        await Database.sync({
            force: true,
        });
        console.log("reload: Resynchronize Database Metadata: Complete");

        // Load standard data
        console.log("reload: Loading Standard Data: Starting");
        const allFacilities: Facility[] = await loadFacilities(ALL_FACILITY_DATA);
        const portland: Facility = await findFacilityByScope("pdx");
        const allPortlandTemplates: Template[]
            = await loadTemplates(portland, ALL_PORTLAND_TEMPLATE_DATA);
        console.log("reload: Loading Standard Data: Complete");

        // Load test data
        console.log("reload: Loading Test Data: Starting");
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
        const testCheckins: Checkin[] = await loadCheckins(testCheckinsData);
        console.log("reload: Loading Test Data: Complete");

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
