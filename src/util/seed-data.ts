// seed-data -----------------------------------------------------------------

// Initial data to be loaded when a database is first created.

// Internal Modules ----------------------------------------------------------

import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Template from "../models/Template";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

// ***** All Environments *****

export const ALL_FACILITY_DATA: Partial<Facility>[] = [
    {
        active: true,
        address1: "634 Sproul Street",
        city: "Chester",
        email: "chester@cityteam.org",
        name: "Chester",
        phone: "610-872-6865",
        scope: "phl",
        state: "PA",
        zipCode: "19013",
    },
    {
        active: true,
        address1: "722 Washington St.",
        city: "Oakland",
        email: "oakland@cityteam.org",
        name: "Oakland",
        phone: "510-452-3758",
        scope: "oak",
        state: "CA",
        zipCode: "94607",
    },
    {
        active: true,
        address1: "526 SE Grand Ave.",
        city: "Portland",
        email: "portland@cityteam.org",
        name: "Portland",
        phone: "503-231-9334",
        scope: "pdx",
        state: "OR",
        zipCode: "97214",
    },
    {
        active: true,
        address1: "164 6th Street",
        city: "San Francisco",
        email: "sanfrancisco@cityteam.org",
        name: "San Francisco",
        phone: "415-861-8688",
        scope: "sfo",
        state: "CA",
        zipCode: "94103",
    },
    {
        active: true,
        address1: "2306 Zanker Road",
        city: "San Jose",
        email: "sanjose@cityteam.org",
        name: "San Jose",
        phone: "408-232-5600",
        scope: "sjc",
        state: "CA",
        zipCode: "95131",
    },
    {
        active: true,
        name: "Test Facility",
        scope: "test",
    }
];

// Must set facilityId for Portland on loading
export const ALL_PORTLAND_TEMPLATE_DATA: Partial<Template>[] = [
    {
        active: true,
        allMats: "1-24",
        handicapMats: "1,9-10,21",
        name: "COVID Template",
        socketMats: "17-18,22-23",
        workMats: "6-7",
    },
    {
        active: false,
        allMats: "1-58",
        handicapMats: "1,9-10,21,30-31,34-35,43,54-55,58",
        name: "Standard Template",
        socketMats: "17-18,22-23,30-31,36-37,42,53-54,57-58",
    }
]

// TODO - load an initial superuser to set up everything else

// ***** TEST DATA *****

// Must set facilityId and (if assigned) guestId on loading
export const TEST_CHECKIN_DATA: Partial<Checkin>[] = [
    // TODO - test checkin data
];

// Must set facilityId on loading
export const TEST_GUEST_DATA: Partial<Guest>[] = [
    {
        active: true,
        firstName: "Fred",
        lastName: "Flintstone",
    },
    {
        active: true,
        firstName: "Barney",
        lastName: "Rubble",
    },
    {
        active: true,
        firstName: "Bam Bam",
        lastName: "Rubble",
    },
    {
        active: true,
        firstName: "Charlie",
        lastName: "Brown",
    },
    {
        active: true,
        firstName: "Homer",
        lastName: "Simpson",
    },
    {
        active: true,
        firstName: "Bart",
        lastName: "Simpson",
    },
];

// Must set facilityId for Test Data on loading
export const TEST_TEMPLATE_DATA: Partial<Template>[] = [
    {
        active: true,
        allMats: "1-24",
        handicapMats: "1,9-10,21",
        name: "Test COVID Template",
        socketMats: "17-18,22-23",
        workMats: "6-7",
    },
    {
        active: false,
        allMats: "1-58",
        handicapMats: "1,9-10,21,30-31,34-35,43,54-55,58",
        name: "Test Standard Template",
        socketMats: "17-18,22-23,30-31,36-37,42,53-54,57-58",
    }
]

// Must set facilityId for Test Data on loading
export const TEST_USER_DATA: Partial<User>[] = [
    {
        active: true,
        name: "Superuser",
        password: "superuser",
        scope: "superuser",
        username: "superuser",
    },
    {
        active: true,
        name: "Test Admin",
        password: "testadmin",
        scope: "test admin regular",
        username: "testadmin",
    },
    {
        active: true,
        name: "Test Regular",
        password: "testregular",
        scope: "test regular",
        username: "testregular",
    }
];
