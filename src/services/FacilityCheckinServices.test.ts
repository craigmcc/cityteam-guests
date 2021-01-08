// FacilityCheckinServices.test ----------------------------------------------

// Functional Tests for FacilityCheckinServices.

// External Modules ----------------------------------------------------------

import chai from "chai";
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import Facility from "../models/Facility";
import DevModeServices from "./DevModeServices";
import FacilityCheckinServices from "./FacilityCheckinServices";
import {
    findFacilityByName,
    findGuestByName,
    findTemplateByName,
    FACILITY_NAME
} from "../util/test-utils";
import {NotFound} from "../util/http-errors";

const CHECKIN_DATE_NEXT = "2020-07-05";
const CHECKIN_DATE_PREVIOUS = "2020-07-03";
const CHECKIN_DATE_VALID = "2020-07-04";
const GUEST_FIRST_NAME_VALID = "Fred";
const GUEST_LAST_NAME_VALID = "Flintstone";
const TEMPLATE_MATS_VALID = 4;
const TEMPLATE_NAME_VALID = "Simple Template";

// FacilitySummaryServices Tests ---------------------------------------------

let facility:Facility;
let facilityId: number;

describe("FacilityCheckinServices Functional Tests", () => {

    // Testing Hooks ---------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await DevModeServices.reload(true);
        facility = await findFacilityByName(FACILITY_NAME);
        facilityId = facility.id ? facility.id : -1;
    })

    // Test Methods ----------------------------------------------------------

    describe("checkinsAll()", () => {

        it("should fail on invalid facilityId", async () => {
        })

        it("should return matches on valid checkinDate", async () => {
            try {
                const results = await FacilityCheckinServices.checkinsAll
                    (facilityId, CHECKIN_DATE_VALID);
                expect(results.length).equals(12);
            } catch (error) {
                expect.fail(`Should not have thrown '${error.message}'`);
            }
        })

        it("should return nothing on empty checkinDate", async () => {
            try {
                const results = await FacilityCheckinServices.checkinsAll
                    (facilityId, CHECKIN_DATE_PREVIOUS);
                expect(results.length).equals(0);
            } catch (error) {
                expect.fail(`Should not have thrown '${error.message}'`);
            }
        })

    })

    describe("checkinsAvailable()", () => {

        it("should fail on invalid facilityId", async () => {
            const facilityIdInvalid = -1;
            try {
                await FacilityCheckinServices.checkinsAvailable
                    (facilityIdInvalid, CHECKIN_DATE_VALID);
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes
                    (`Missing Facility ${facilityIdInvalid}`)
                } else {
                    expect.fail
                    (`Should have thrown NotFound, but threw '${error.message}'`);
                }
            }
        })

        it("should return matches on valid checkinDate", async () => {
            try {
                const results = await FacilityCheckinServices.checkinsAvailable
                    (facilityId, CHECKIN_DATE_VALID);
                expect(results.length).equals(6);
            } catch (error) {
                expect.fail(`Should not have thrown '${error.message}'`);
            }
        })

        it("should return nothing on empty checkinDate", async () => {
            try {
                const results = await FacilityCheckinServices.checkinsAvailable
                    (facilityId, CHECKIN_DATE_PREVIOUS);
                expect(results.length).equals(0);
            } catch (error) {
                expect.fail(`Should not have thrown '${error.message}'`);
            }
        })

    })

    describe("checkinsGenerate()", () => {

        it("should fail on invalid facilityId", async () => {
            const facilityIdInvalid = -1;
            try {
                const template = await findTemplateByName(
                    facilityId,
                    TEMPLATE_NAME_VALID
                );
                await FacilityCheckinServices.checkinsGenerate(
                    facilityIdInvalid,
                    CHECKIN_DATE_NEXT,
                    template.id ? template.id : -2
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes
                    (`Missing Facility ${facilityIdInvalid}`)
                } else {
                    expect.fail
                    (`Should have thrown NotFound, but threw '${error.message}'`);
                }
            }

        })

        it("should fail on invalid templateId", async () => {
            const templateIdInvalid = -2;
            try {
                await FacilityCheckinServices.checkinsGenerate(
                    facilityId,
                    CHECKIN_DATE_NEXT,
                    templateIdInvalid
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes
                    (`Missing Template ${templateIdInvalid}`)
                } else {
                    expect.fail(
                        `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

        it("should pass on valid parameters", async () => {
            try {
                const template = await findTemplateByName(
                    facilityId,
                    TEMPLATE_NAME_VALID
                );
                const templateId = template.id ? template.id : -2;
                const results = await FacilityCheckinServices.checkinsGenerate(
                    facilityId,
                    CHECKIN_DATE_NEXT,
                    templateId
                );
                expect(results.length).equals(TEMPLATE_MATS_VALID);
                for (let index = 0; index < results.length; index++) {
                    if (results[index].matNumber !== (index + 1)) {
                        expect.fail(`Mat index ${index} should have matNumber ${index + 1}`);
                    }
                    if (results[index].guestId) {
                        expect.fail(`Mat ${results[index].matNumber} should not be assigned`);
                    }
                }
            } catch (error) {
                expect.fail(`Should not have thrown '${error.message}'`);
            }
        })

    })

    describe("checkinsGuest()", () => {

        it("should fail on invalid facilityId", async () => {
            const facilityIdInvalid = -1;
            try {
                const guest = await findGuestByName(
                    facilityId,
                    GUEST_FIRST_NAME_VALID,
                    GUEST_LAST_NAME_VALID
                );
                await FacilityCheckinServices.checkinsGuest(
                    facilityIdInvalid,
                    guest.id ? guest.id : -2
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(
                        `Missing Facility ${facilityIdInvalid}`
                    )
                } else {
                    expect.fail(
                       `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

        it("should pass on valid parameters", async () => {
            try {
                const guest = await findGuestByName(
                    facilityId,
                    GUEST_FIRST_NAME_VALID,
                    GUEST_LAST_NAME_VALID
                );
                const results = await FacilityCheckinServices.checkinsGuest(
                    facilityId,
                    guest.id ? guest.id : -2
                );
                expect(results.length).equals(1);
            } catch (error) {
                expect.fail(`Should not have thrown '${error.message}`);
            }
        })

        it("should return nothing on invalid guestId", async () => {
            const guestIdInvalid = -2;
            try {
                const results =await FacilityCheckinServices.checkinsGuest(
                    facilityId,
                    guestIdInvalid
                );
                expect(results.length).equals(0);
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(
                        `Missing Guest ${guestIdInvalid}`
                    )
                } else {
                    expect.fail(
                        `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

    })

    describe("checkinsSummaries()", () => {

        it("should fail on invalid facilityId", async () => {
            const facilityIdInvalid = -1;
            try {
                await FacilityCheckinServices.checkinsSummaries(
                    facilityIdInvalid,
                    CHECKIN_DATE_PREVIOUS,
                    CHECKIN_DATE_NEXT
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(
                        `Missing Facility ${facilityIdInvalid}`
                    )
                } else {
                    expect.fail(
                        `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

        it("should pass on valid parameters", async () => {
            try {
                const results = await FacilityCheckinServices.checkinsSummaries(
                    facilityId,
                    CHECKIN_DATE_PREVIOUS,
                    CHECKIN_DATE_NEXT
                );
                expect(results.length).equals(1);
                expect(results[0].checkinDate).equals(CHECKIN_DATE_VALID);
            } catch (error) {
                expect.fail(`Should not have thrown '${error.message}'`);
            }
        })

        it("should return nothing on empty dates", async () => {
            try {
                const results = await FacilityCheckinServices.checkinsSummaries(
                    facilityId,
                    CHECKIN_DATE_PREVIOUS,
                    CHECKIN_DATE_PREVIOUS
                );
                expect(results.length).equals(0);
            } catch (error) {
                expect.fail(`Should not have thrown '${error.message}'`);
            }
        })

    })

});
