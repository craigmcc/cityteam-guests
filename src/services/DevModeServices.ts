// DevModeServices -----------------------------------------------------------

// Development mode services for imports and reloading.

// External Modules ----------------------------------------------------------

import neatCsv from "neat-csv";

// Internal Modules ----------------------------------------------------------

import Checkin from "../models/Checkin";
import Database from "../models/Database";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Template from "../models/Template";
import User from "../models/User";
import { toDateObject } from "../util/dates";
import { hashPassword } from "../oauth/OAuthUtils";
import {
    ALL_FACILITY_DATA,
    ALL_PORTLAND_TEMPLATE_DATA,
    TEST_GUEST_DATA,
    TEST_TEMPLATE_DATA,
    TEST_USER_DATA,
} from "../util/seed-data";
import {BadRequest} from "../util/http-errors";

// A potentially recoverable problem that should be reported back to the caller
class Problem extends Error {
    constructor(message: string, resolution: string, row: neatCsv.Row) {
        super(message);
        this.message = message;
        this.resolution = resolution;
        this.row = row;
    }
    message: string;
    resolution: string;
    row: neatCsv.Row;
}

// Public Objects ------------------------------------------------------------

export class DevModeServices {

    // Import CSV content from the Portland "shelter log" spreadsheet
    public async import(name: string, body: string): Promise<Object> {

        // Find the Facility for which we are importing Checkins
        const facility = await findFacilityByName(name);
        console.info(`DevModeServices.import: Importing Checkins for Facility '${name}'`);

        // Parse the incoming data into usable JavaScript objects
        const rows: neatCsv.Row[] = await neatCsv(body, {
            headers: [
                "checkinDate",
                "matNumber",
                "firstName",
                "lastName",
                "paymentType",
                "bac",
                "comments",
                "exclude",
                "fm30days"
            ],
            skipLines: 1
        });

        // Global variables for managing the parsing process
        // and collecting our results
        let ignoring = false;
        let previousCheckinDate = "12/31/19";
        let skipping = false;

        // Accumulators for our results
        let processed: number = 0;
        let skipped: number = 0;
        const checkins: Checkin[] = [];
        const problems: Problem[] = [];

        // Process each row and create the appropriate database content
        rows.forEach(row => {

            try {

                // Ignore cruft at the end of the CSV file
                ignoring = !row.checkinDate || (row.checkinDate.length === 0);

                // Turn off skipping when checkinDate changes
                if (skipping && (row.checkinDate !== previousCheckinDate)) {
                    skipping = false;
                }

                // Turn on skipping when we see the end-of-data marker
                if (row.firstName.startsWith("*****")
                    || row.lastName.startsWith("*****")) {
                    skipping = true;
                }

                // Process this row when it is relevant
                if (!ignoring && !skipping) {
                    // TODO
                    processed++;
                } else {
                    skipped++;
                }

                // Track previous checkinDate so we can reset skipping
                previousCheckinDate = row.checkinDate;

            } catch (error) {
                if (error instanceof Problem) {
                    problems.push(error);
                } else {
                    throw error;
                }
            }

        });

        return {
            processed: processed,
            skipped: skipped,
            problems: problems,
            checkins: checkins,
            rows: rows, // TODO - only for development
        };

    }

    // Resync database and reload data, returning all of it
    // TODO - test data only on a test?
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

const findFacilityByName = async (name: string): Promise<Facility> => {
    const result: Facility | null = await Facility.findOne({
        where: { name: name }
    });
    if (result) {
        return result;
    } else {
        throw new BadRequest(`name: Missing Facility name '${name}'`);
    }
}

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

const hashPasswords = async (users: Partial<User>[]): Promise<Partial<User>[]> => {
    const newUsers: Partial<User>[] = [];
    users.map(async user => {
        const newUser: Partial<User> = {
            ...user,
            password: await hashPassword(user.password ? user.password : "")
        }
        newUsers.push(newUser);
    });
    return newUsers;
}

const importRow = async (facility: Facility, row: neatCsv.Row) => {

    const checkin: Partial<Checkin> = {
        facilityId: facility.id,
    }
    let fatal = false;
    const problems: Problem[] = [];

    // Process checkinDate
    if (!row.checkinDate || (row.checkinDate.length === 0)) {
        problems.push(new Problem(
            "Missing checkinDate",
            "Skipping this import",
            row));
        fatal = true;
    } else {
        try {
            checkin.checkinDate = new Date(row.checkinDate);
        } catch (error) {
            problems.push(new Problem(
                "Cannot parse checkinDate",
                "Skipping this import",
                row));
            fatal = true;
        }
    }

    // TODO - continue here

    // TODO - return accumulated errors if any?

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
