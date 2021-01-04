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
import {BadRequest} from "../util/http-errors";
import {validateFeatures, validatePaymentType} from "../util/application-validators";

// A potentially recoverable problem that should be reported back to the caller
class Problem extends Error {
    constructor(issue: string, resolution: string, row: neatCsv.Row, fatal: boolean = false) {
        super(issue);
        this.issue = issue;
        this.resolution = resolution;
        this.row = row;
        this.fatal = fatal ? fatal : false;
    }
    fatal: boolean;
    issue: string;
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
        let avoiding = false;
        let ignoring = false;
        let previousCheckinDate = "12/31/19";
        let skipping = false;

        // Accumulators for our results
        let avoided: number = 0;
        let failed: number = 0;
        let ignored: number = 0;
        let processed: number = 0;
        let skipped: number = 0;

        // Primary results to be returned
        const allCheckins: Checkin[] = [];
        const allProblems: Problem[] = [];

        // Process each row and create the appropriate database content
        rows.forEach(row => {

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
            if (avoiding) {
                avoided++;
            } else if (ignoring) {
                ignored++;
            } else if (skipping) {
                skipped++;
            } else {

                const [rowCheckin, rowProblems] = populateCheckin(facility, row);
                if (!anyFatal(rowProblems)) {
                    const [guest, guestProblems] = createGuest(facility, row);
                    console.info("GUEST:  " + JSON.stringify(guest));
                    console.info("PROBS:  " + JSON.stringify(guestProblems));
                    appendProblems(rowProblems, guestProblems);
                    if (guest) {
                        rowCheckin.guestId = guest.id;
                    }
                }
                // TODO - if no fatal, find or create Guest, or add to rowProblems
                // TODO - if no fatal, insert the completed Checkin, or add to rowProblems
                appendProblems(allProblems, rowProblems);

                if (anyFatal(rowProblems)) {
                    failed++;
                } else {
                    allCheckins.push(rowCheckin);
                    if (processed < 5) {
                        console.info("CHECKIN: " + JSON.stringify(rowCheckin));
                    } else {
                        avoiding = true;
                    }
                    processed++;
                }

            }

            // Track previous checkinDate so we can reset skipping
            previousCheckinDate = row.checkinDate;

        });

        return {
            counts: {
                avoided: avoided,
                failed: failed,
                ignored: ignored,
                processed: processed,
                skipped: skipped,
                problemsLength: allProblems.length,
                checkinsLength: allCheckins.length
            },
            problems: allProblems,
            checkins: allCheckins,
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

// Return true if any of the listed problems is marked as fatal
const anyFatal = (problems: Problem[]): boolean => {
    let result = false;
    problems.forEach(problem => {
        if (problem.fatal) {
            result = true;
        }
    });
    return result;
}

// Append any and all fromProblems items to toProblems
const appendProblems = (toProblems: Problem[], fromProblems: Problem[]): void => {
    fromProblems.forEach(fromProblem => {
        toProblems.push(fromProblem);
    });
}

// Return an existing or new Guest to be assigned to this checkin
const createGuest = (facility: Facility, row: neatCsv.Row)
                  : [outGuest: Guest | null, outProblems: Problem[]] =>
{
    let outGuest: Guest | null = null;
    const outProblems: Problem[] = [];

    const [outFirstName, outLastName, nameProblems] = parseNames(row);
    appendProblems(outProblems, nameProblems);
    if (anyFatal(nameProblems)) {
        return [outGuest, outProblems];
    }
    if (!outFirstName || !outLastName) {
        return [outGuest, outProblems];
    }

    const options: FindOptions = {
        where: {
            facilityId: facility.id ? facility.id : -1,
            firstName: outFirstName,
            lastName: outLastName
        }
    };

    Guest.findOne(options)
        .then((oldGuest) => {
            console.info(`For ${outFirstName} ${outLastName} found ` + JSON.stringify(oldGuest));
            if (!oldGuest) {
                Guest.create({
                    active: true,
                    facilityId: facility.id,
                    firstName: outFirstName,
                    lastName: outLastName,
                })
                    .then((newGuest) => {
                        console.info(`  So created ` + JSON.stringify(newGuest));
                        outGuest = newGuest;
                    })
            }
        })
        .catch((error) => {
            outGuest = null;
            outProblems.push(new Problem(
                error.message,
                "Failing this import",
                row,
                true
            ));
        })
        .finally(() => {
            return [outGuest, outProblems];
        });
    return [outGuest, outProblems];
}

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

const parseCheckinDate
    = (row: neatCsv.Row)
    : [outCheckinDate: Date, outCheckinDateProblems: Problem[]] =>
{
    let outCheckinDate: Date = new Date("2019-12-31");
    const outProblems: Problem[] = [];

    if (!row.checkinDate || (row.checkinDate.length === 0)) {
        outProblems.push(new Problem(
            "Missing checkinDate",
            "Failing this import",
            row,
            true));
    } else {
        try {
            outCheckinDate = new Date(row.checkinDate);
        } catch (error) {
            outProblems.push(new Problem(
                "Cannot parse checkinDate",
                "Failing this import",
                row,
                true));
        }
    }

    return [outCheckinDate, outProblems];
}

const parseComments
    = (row: neatCsv.Row)
    : [outComments: string | null, outProblems: Problem[]] =>
{
    let outComments: string | null = null;
    const outProblems: Problem[] = [];

    if (row.comments) {
        outComments = row.comments;
    }

    return [outComments, outProblems];
}

const parseMatNumberAndFeatures
    = (row: neatCsv.Row)
    : [outMatNumber: number, outFeatures: string | null, outProblems: Problem[]] =>
{
    let outMatNumber: number = 0;
    let outFeatures: string | null = null;
    const outProblems: Problem[] = [];

    if (!row.matNumber || (row.matNumber.length === 0)) {
        outProblems.push(new Problem(
            "Missing matNumber",
            "Failing this import",
            row,
            true
        ));
        return [outMatNumber, outFeatures, outProblems];
    }

    let input = row.matNumber;
    let featuring = false;
    let features = "";
    let matNumber = 0;
    for (let i = 0; i < input.length; i++) {
        let c = input.charAt(i);
        if ((c >= '0') && (c <= '9')) {
            if (featuring) {
                outProblems.push(new Problem(
                    `Cannot parse matNumber from '${input}'`,
                    "Failing this import",
                    row,
                    true
                ));
            } else {
                matNumber = (matNumber * 10) + parseInt(c);
            }
        } else {
            featuring = true;
            features += c;
        }
        if (matNumber > 0) {
            outMatNumber = matNumber;
        } else {
            outProblems.push(new Problem(
                `Missing matNumber in '${input}'`,
                "Failing this import",
                row,
                true
            ));
        }
        if (features.length > 0) {
            if (validateFeatures(features)) {
                outFeatures = features;
            } else {
                outProblems.push(new Problem(
                    `Invalid features '${features}' in '${input}'`,
                    "Ignoring invalid features",
                    row
                ));
            }
        }
    }

    return [outMatNumber, outFeatures, outProblems];
}

// No names means a mat is unassigned
const parseNames
    = (row: neatCsv.Row)
    : [outFirstName: string | null, outLastName: string | null, outProblems: Problem[]] =>
{
    let outFirstName: string | null = null;
    let outLastName: string | null = null;
    const outProblems: Problem[] = [];

    if (((!row.firstName) || (row.firstName.length === 0)) &&
        ((!row.lastName) || (row.lastName.length === 0))) {
        return [outFirstName, outLastName, outProblems];
    }

    if (!row.firstName || (row.firstName.length === 0)) {
        outProblems.push(new Problem(
            "Missing firstName",
            "Failing this import",
            row,
            true
        ));
    } else if (row.firstName.startsWith("*")) {
        outProblems.push(new Problem(
            "Invalid firstName",
            "Failing this import",
            row,
            true
        ));
    } else {
        outFirstName = row.firstName;
    }

    if (!row.lastName || (row.lastName.length === 0)) {
        outProblems.push(new Problem(
            "Missing lastName",
            "Failing this import",
            row,
            true
        ));
    } else if (row.lastName.startsWith("*")) {
        outProblems.push(new Problem(
            "Invalid lastName",
            "Failing this import",
            row,
            true
        ));
    } else {
        outLastName = row.lastName;
    }

    return [outFirstName, outLastName, outProblems];
}

const parsePaymentTypeAmount
    = (row: neatCsv.Row)
    : [paymentType: string | null, paymentAmount: number | null, problems: Problem[]] =>
{
    let outPaymentType: string | null = null;
    let outPaymentAmount: number | null = null;
    const outProblems: Problem[] = [];

    if (row.paymentType && (row.paymentType.length > 0)) {
        if (validatePaymentType(row.paymentType)) {
            outPaymentType = row.paymentType;
        } else {
            outProblems.push(new Problem(
                `Invalid paymentType '${row.paymentType}'`,
                "Set to 'UK'",
                row
            ));
            outPaymentType = "UK";
        }
    } else if (row.firstName && (row.firstName.length > 0) &&
               row.lastName && (row.lastName.length > 0)) {
        outProblems.push(new Problem(
            "Missing payment type for assigned mat",
            "Set to 'UK'",
            row
        ));
        outPaymentType = "UK";
    }
    if (outPaymentType === "$$") {
        outPaymentAmount = 5.00;
    }

    return [outPaymentType, outPaymentAmount, outProblems];
}

// Populate a new Checkin object EXCEPT for guestId, and return the
// Checkin plus an array of any Problem objects generated by parsing
// of the incoming row.
const populateCheckin
    = (facility: Facility, row: neatCsv.Row)
    : [checkin: Checkin, problems: Problem[]] =>
{

    // Prepare our return values
    const checkin: Checkin = new Checkin({
        facilityId: facility.id,
        guestId: -1,
    });
    const rowProblems: Problem[] = [];

    // Process the incoming fields

    const [outCheckinDate, outCheckinDateProblems] = parseCheckinDate(row);
    checkin.checkinDate = outCheckinDate;
    appendProblems(rowProblems, outCheckinDateProblems);

    const [outMatNumber, outFeatures, outMatNumberProblems]
        = parseMatNumberAndFeatures(row);
    checkin.matNumber = outMatNumber;
    checkin.features = outFeatures ? outFeatures : undefined;
    appendProblems(rowProblems, outMatNumberProblems);

    // Names will be checked when finding or inserting a Guest

    const [outPaymentType, outPaymentAmount, outPaymentProblems] =
        parsePaymentTypeAmount(row);
    checkin.paymentType = outPaymentType ? outPaymentType : undefined;
    checkin.paymentAmount = outPaymentAmount ? outPaymentAmount : undefined;
    appendProblems(rowProblems, outPaymentProblems);

    const [outComments, outCommentsProblems] = parseComments(row);
    checkin.comments = outComments ? outComments : undefined;
    appendProblems(rowProblems, outCommentsProblems);

    // Return the results
    return [checkin, rowProblems];

}
