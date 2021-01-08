// FacilityAssignServices.test -----------------------------------------------

// Functional Tests for FacilityAssignServices.

// External Modules ----------------------------------------------------------

import chai from "chai";
const expect = chai.expect;

// Internal Modules ----------------------------------------------------------

import DevModeServices from "./DevModeServices";
import FacilityAssignServices from "./FacilityAssignServices";
import Assign from "../models/Assign";
import Facility from "../models/Facility";
import {
    CHECKINS_DATE,
    FACILITY_NAME,
    findCheckinById,
    findCheckinsAll,
    findCheckinsAvailable,
    findFacilityByName,
    findGuestByName,
    insertGuest,
} from "../util/test-utils";
import {BadRequest, NotFound} from "../util/http-errors";

// FacilityAssignServices Tests ----------------------------------------------

let facility:Facility;
let facilityId: number;

describe("FacilityAssignServices Functional Tests", () => {

    // Testing Hooks ---------------------------------------------------------

    beforeEach("#beforeEach", async () => {
        await DevModeServices.reload(true);
        facility = await findFacilityByName(FACILITY_NAME);
        facilityId = facility.id ? facility.id : -1;
    })

    // Test Methods ----------------------------------------------------------

    describe("assignsAssign()", () => {

        it("should fail on invalid checkinId", async () => {
            const checkinIdInvalid = -2;
            try {
                const guest = await findGuestByName(
                    facilityId, "Barney", "Rubble"
                );
                const assign: any = {
                    id: checkinIdInvalid,
                    facilityId: facilityId,
                    guestId: guest.id ? guest.id : -3,

                };
                await FacilityAssignServices.assignsAssign(
                    facilityId,
                    checkinIdInvalid,
                    assign
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(
                        `Missing Checkin ${checkinIdInvalid}`
                    );
                } else {
                    expect.fail(
                        `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

        it("should fail on invalid facilityId", async () => {
            const facilityIdInvalid = -1;
            const checkinIdInvalid = -2;
            const guestIdInvalid = -3;
            try {
                const assign: any = {
                    id: checkinIdInvalid,
                    facilityId: facilityIdInvalid,
                    guestId: guestIdInvalid,

                };
                await FacilityAssignServices.assignsAssign(
                    facilityIdInvalid,
                    checkinIdInvalid,
                    assign
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(
                        `Missing Facility ${facilityIdInvalid}`
                    );
                } else {
                    expect.fail(
                        `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

        it("should fail on invalid guestId", async () => {
            const checkinIdInvalid = -2;
            const guestIdInvalid = -3;
            try {
                const assign: any = {
                    id: checkinIdInvalid,
                    facilityId: facilityId,
                    guestId: guestIdInvalid,

                };
                await FacilityAssignServices.assignsAssign(
                    facilityId,
                    checkinIdInvalid,
                    assign
                );
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).includes(
                        `assign: Missing Guest ${guestIdInvalid}`
                    );
                } else {
                    expect.fail(
                        `Should have thrown BadRequest, but threw '${error.message}'`
                    )
                }
            }
        })

        it("should fail on mismatched facilityId", async () => {
            const facilityIdInvalid = -1;
            const checkinIdInvalid = -2;
            const guestIdInvalid = -3;
            try {
                const assign: any = {
                    id: checkinIdInvalid,
                    facilityId: facilityIdInvalid,
                    guestId: guestIdInvalid,

                };
                await FacilityAssignServices.assignsAssign(
                    facilityId,
                    checkinIdInvalid,
                    assign
                );
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).includes(
                        `facilityId is ${facilityId} but assign data says ${facilityIdInvalid}`
                    );
                } else {
                    expect.fail(
                        `Should have thrown BadRequest, but threw '${error.message}'`
                    );
                }
            }

        })

        it("should pass on assignment to a new Guest", async () => {
            try {

                const NEW_COMMENT = "THIS IS A NEW COMMENT";
                const checkins = await findCheckinsAvailable(
                    facilityId,
                    CHECKINS_DATE
                );
                expect(checkins.length).greaterThan(0);

                const guest = await insertGuest(
                    facilityId,
                    true,
                    "George",
                    "Jetson",
                );

                const assign = {
                    comments: NEW_COMMENT,
                    facilityId: facilityId,
                    guestId: guest.id ? guest.id : -1,
                    id: checkins[0].id,
                    paymentAmount: 5.00,
                    paymentType: "$$",
                    showerTime: "05:30:00",
                    wakeupTime: "04:45:00",
                };

                const result = await FacilityAssignServices.assignsAssign(
                    facilityId,
                    checkins[0].id ? checkins[0].id : -1,
                    assign as Assign
                );
                expect(result.comments).equals(NEW_COMMENT);
                expect(result.facilityId).equals(assign.facilityId);
                expect(result.guestId).equals(assign.guestId);
                expect(result.id).equals(assign.id);
                expect(result.paymentAmount).equals(assign.paymentAmount);
                expect(result.paymentType).equals(assign.paymentType);
                expect(result.showerTime).equals(assign.showerTime);
                expect(result.wakeupTime).equals(assign.wakeupTime);
            } catch (error) {
                expect.fail(`Should not have thrown '${error.message}'`);
            }
        })

        it("should pass on update for the same Guest", async () => {
            try {

                const UPDATED_COMMENT = "THIS IS AN UPDATED COMMENT";
                const checkins = await findCheckinsAll(
                    facilityId,
                    CHECKINS_DATE
                );
                expect(checkins.length).greaterThan(0);
                const checkin = checkins[0];

                const assign: any = {
                    comments: UPDATED_COMMENT,
                    facilityId: checkin.facilityId,
                    guestId: checkin.guestId,
                    id: checkin.id,
                    paymentAmount: null,
                    paymentType: "SW",
                    showerTime: checkin.showerTime,
                    wakeupTime: checkin.wakeupTime,
                };

                const result = await FacilityAssignServices.assignsAssign(
                    checkin.facilityId,
                    checkin.id ? checkin.id : -1,
                    assign as Assign,
                );
                expect(result.comments).equals(UPDATED_COMMENT);
                expect(result.facilityId).equals(assign.facilityId);
                expect(result.guestId).equals(assign.guestId);
                expect(result.id).equals(assign.id);
                expect(result.paymentAmount).equals(assign.paymentAmount);
                expect(result.paymentType).equals(assign.paymentType);
                expect(result.showerTime).equals(assign.showerTime);
                expect(result.wakeupTime).equals(assign.wakeupTime);

            } catch (error) {
                expect.fail(`Should not have thrown '${error.message}'`);
            }
        })

    })

    describe("assignsDeassign()", () => {

        it("should fail on invalid checkinId", async () => {
            const checkinIdInvalid = -1;
            try {
                await FacilityAssignServices.assignsDeassign(
                    facilityId,
                    checkinIdInvalid,
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(
                        `Missing Checkin ${checkinIdInvalid}`
                    );
                } else {
                    expect.fail(
                        `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

        it("should fail on invalid facilityId", async () => {
            const facilityIdInvalid = -1;
            const checkins = await findCheckinsAll(facilityId, CHECKINS_DATE);
            try {
                await FacilityAssignServices.assignsDeassign(
                    facilityIdInvalid,
                    checkins[0].id ? checkins[0].id : -1,
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(
                        `Missing Facility ${facilityIdInvalid}`
                    );
                } else {
                    expect.fail(
                        `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

        it("should fail on unassigned Checkin", async () => {
            const checkins = await findCheckinsAvailable(facilityId, CHECKINS_DATE);
            expect(checkins.length).greaterThan(0);
            const checkinId = checkins[0].id ? checkins[0].id : -1;
            try {
                await FacilityAssignServices.assignsDeassign(
                    facilityId,
                    checkinId,
                );
                expect.fail("Should have thrown BadRequest");
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).includes(
                        `Checkin ${checkinId} is not currently assigned`
                    );
                } else {
                    expect.fail(
                        `Should have thrown BadRequest, but threw '${error.message}'`
                    );
                }
            }
        })

        it("should pass on assigned Checkin", async () => {
            const checkins = await findCheckinsAll(facilityId, CHECKINS_DATE);
            expect(checkins.length).greaterThan(0);
            const checkinId = checkins[0].id ? checkins[0].id : -1;
            try {
                const result = await FacilityAssignServices.assignsDeassign(
                    facilityId,
                    checkinId,
                );
                expect(result.comments).equals(null);
                expect(result.guestId).equals(null);
                expect(result.paymentAmount).equals(null);
                expect(result.paymentType).equals(null);
                expect(result.showerTime).equals(null);
                expect(result.wakeupTime).equals(null);
            } catch (error) {
                expect.fail(
                    `Should not have thrown '${error.message}'`
                );
            }
        })

    })

    describe("assignsReassign()", () => {

        it("should fail on assigned newCheckinId", async () => {
            const allCheckins = await findCheckinsAll(
                facilityId,
                CHECKINS_DATE
            )
            const oldCheckin = allCheckins[0];
            const oldCheckinId = oldCheckin.id ? oldCheckin.id : -1;
            const newCheckin = allCheckins[1];
            const newCheckinId = newCheckin.id ? newCheckin.id : -2;
            try {
                await FacilityAssignServices.assignsReassign(
                    facilityId,
                    oldCheckinId,
                    newCheckinId,
                );
            } catch (error) {
                if (error instanceof BadRequest) {
                    expect(error.message).includes(
                        `New Checkin ${newCheckinId} is assigned to Guest ${newCheckin.guestId}`
                    );
                } else {
                    expect.fail("Should have thrown BadRequest");
                }
            }

        })

        it("should fail on invalid facilityId", async () => {
            const allCheckins = await findCheckinsAll(
                facilityId,
                CHECKINS_DATE
            )
            const oldCheckinId = allCheckins[0].id ? allCheckins[0].id : -1;
            const lastCheckin = allCheckins[allCheckins.length - 1];
            const newCheckinId = lastCheckin.id ? lastCheckin.id : -2;
            const facilityIdInvalid = -3;
            try {
                await FacilityAssignServices.assignsReassign(
                    facilityIdInvalid,
                    oldCheckinId,
                    newCheckinId
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(
                        `Missing Facility ${facilityIdInvalid}`
                    );
                } else {
                    expect.fail(
                        `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

        it("should fail on invalid newCheckinId", async () => {
            const newCheckinIdInvalid = -1;
            const oldCheckins = await findCheckinsAll(
                facilityId,
                CHECKINS_DATE
            )
            try {
                await FacilityAssignServices.assignsReassign(
                    facilityId,
                    oldCheckins[0].id ? oldCheckins[0].id : -1,
                    newCheckinIdInvalid
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(
                        `Missing new Checkin ${newCheckinIdInvalid}`
                    );
                } else {
                    expect.fail(
                        `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

        it("should fail on invalid oldCheckinId", async () => {
            const oldCheckinIdInvalid = -1;
            const newCheckins = await findCheckinsAvailable(
                facilityId,
                CHECKINS_DATE
            )
            try {
                await FacilityAssignServices.assignsReassign(
                    facilityId,
                    oldCheckinIdInvalid,
                    newCheckins[0].id ? newCheckins[0].id : -1,
                );
                expect.fail("Should have thrown NotFound");
            } catch (error) {
                if (error instanceof NotFound) {
                    expect(error.message).includes(
                        `Missing old Checkin ${oldCheckinIdInvalid}`
                    );
                } else {
                    expect.fail(
                        `Should have thrown NotFound, but threw '${error.message}'`
                    );
                }
            }
        })

        it("Should pass on valid parameters", async () => {
            const allCheckins = await findCheckinsAll(
                facilityId,
                CHECKINS_DATE
            )
            let oldCheckin = allCheckins[0];
            const oldCheckinId = oldCheckin.id ? oldCheckin.id : -1;
            let newCheckin = allCheckins[allCheckins.length - 1];
            const newCheckinId = newCheckin.id ? newCheckin.id : -2;
            try {
                await FacilityAssignServices.assignsReassign(
                    facilityId,
                    oldCheckinId,
                    newCheckinId
                );
                newCheckin = await findCheckinById(newCheckinId);
                expect(newCheckin.comments).equals(oldCheckin.comments);
                expect(newCheckin.facilityId).equals(oldCheckin.facilityId);
                expect(newCheckin.guestId).equals(oldCheckin.guestId);
                expect(newCheckin.paymentAmount).equals(oldCheckin.paymentAmount);
                expect(newCheckin.paymentType).equals(oldCheckin.paymentType);
                expect(newCheckin.showerTime).equals(oldCheckin.showerTime);
                expect(newCheckin.wakeupTime).equals(oldCheckin.wakeupTime);
                oldCheckin = await findCheckinById(oldCheckinId);
                expect(oldCheckin.comments).equals(null);
                expect(oldCheckin.facilityId).equals(newCheckin.facilityId);
                expect(oldCheckin.guestId).equals(null);
                expect(oldCheckin.paymentAmount).equals(null);
                expect(oldCheckin.paymentType).equals(null);
                expect(oldCheckin.showerTime).equals(null);
                expect(oldCheckin.wakeupTime).equals(null);
            } catch (error) {
                expect.fail(`Should not have thrown ${error.message}`);
            }

        })

    })

});
