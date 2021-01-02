// FacilityAssignServices ----------------------------------------------------

// Services implementation for Facility -> Assign models.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import { toDateObject } from "../util/dates";
import { BadRequest, NotFound, ServerError } from "../util/http-errors";

// Public Objects ------------------------------------------------------------

class FacilityAssignServices {

    public async assignsAssign
    (facilityId: number, checkinId: number, assign: Assign): Promise<Checkin> {

        // Validate specified facilityId
        if (!assign.facilityId) {
            throw new BadRequest(
                `assign: Missing facilityId in assign data`,
                "FacilityServices.assignsAssign()");
        } else {
            if (assign.facilityId !== facilityId) {
                throw new BadRequest(
                    `assign: facilityId is ${facilityId} but assign data says ${assign.facilityId}`,
                    "FacilityServices.assignsAssign()");
            }
        }
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.assignsAssign()");
        }

        // Validate specified guestId
        if (!assign.guestId) {
            throw new BadRequest(
                `assign: Missing guestId in assign data`,
                "FacilityServices.assignsAssign()");
        }
        const guest = await Guest.findByPk(assign.guestId);
        if (!guest) {
            throw new BadRequest(
                `assign: Missing Guest ${assign.guestId}`,
                "FacilityServices.assignsAssign()");
        }
        if (guest.facilityId !== facilityId) {
            throw new BadRequest(
                `guestId: Guest ${guest.firstName} ${guest.lastName}`
                + `does not belong to Facility ${facility.name}`,
                "FacilityServices.assignsAssign()");
        }

        // Validate specified checkinId
        const checkin = await Checkin.findByPk(checkinId);
        if (!checkin) {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "FacilityServices.assignsAssign()");
        }
        if (checkin.facilityId !== facility.id) {
            throw new BadRequest(
                `checkinId: Checkin ${checkinId} does not belong to Facility ${facilityId}`,
                "FacilityServices.assignsAssign()");
        }

        // For an assigned Checkin, must be assigned to the specified guestId
        // (allows for information updates)
        if (checkin.guestId && (checkin.guestId !== assign.guestId)) {
            throw new BadRequest(
                `checkinId: Checkin ${checkinId} is already assigned to Guest ${checkin.guestId}`,
                "FacilityServices.assignsAssign()");
        }

        // For an unassigned Checkin, verify that this guestId is not checked in elsewhere
        if (!checkin.guestId) {
            const options = {
                where: {
                    checkinDate: checkin.checkinDate,
                    facilityId: checkin.facilityId,
                    guestId: assign.guestId,
                }
            }
            const results = await Checkin.findAll(options);
            if (results.length > 0) {
                throw new BadRequest(
                    `guestId: Guest ${guest.firstName} ${guest.lastName}`
                    + ` is already assigned to mat ${results[0].matNumber}`,
                    "FacilityServices.assignsAssign()");
            }
        }

        // Perform the assignment changes
        checkin.comments = assign.comments ? assign.comments : undefined;
        checkin.guestId = assign.guestId;
        checkin.paymentAmount = assign.paymentAmount ? assign.paymentAmount : undefined;
        checkin.paymentType = assign.paymentType ? assign.paymentType : undefined;
        checkin.showerTime = assign.showerTime ? toDateObject(assign.showerTime) : undefined;
        checkin.wakeupTime = assign.wakeupTime ? toDateObject(assign.wakeupTime) : undefined;

        // Persist and return these changes
        // WARNING:  IN-PLACE UPDATES OF SEQUELIZE MODELS ARE REALLY FUNKY!!!
        // WARNING:  Use "fields" to choose which columns to update
        // WARNING:  Use "returning: true" to return the updated row (Postgres specific!)
        // WARNING:  Use "validating: false" to avoid validating things you didn't include
        const [count, results] = await Checkin.update(assign, {
            fields: [
                "comments", "guestId", "paymentAmount", "paymentType",
                "showerTime", "wakeupTime"
            ],
//            logging: function(content) {
//                console.info(`Checkin.update(${content})`);
//            },
            returning: true,
            validate: false,
            where: { id: checkinId },
        });
        if ((count === 1) && results) {
            return results[0];
        } else {
            throw new ServerError("Checkin.update returned no results",
                "FacilityServices.assignsAssign");
        }

    }

    public async assignsDeassign
    (facilityId: number, checkinId: number): Promise<Checkin> {

        // Look up the corresponding Facility
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.assignsDeassign()");
        }

        // Look up the corresponding Checkin
        const checkin = await Checkin.findByPk(checkinId);
        if (!checkin) {
            throw new NotFound(
                `checkinId: Missing Checkin ${checkinId}`,
                "FacilityServices.assignsDeassign()");
        }

        // Verify the status of this Checkin
        if (checkin.facilityId !== facility.id) {
            throw new BadRequest(
                `checkinId: Checkin ${checkinId} does not belong to Facility ${facilityId}`,
                "FacilityServices.assignsDeassign()");
        }
        if (!checkin.guestId) {
            throw new BadRequest(
                `checkinId: Checkin ${checkinId} is not currently assigned`,
                "FacilityServices.assignsDeassign()");
        }

        // Update the Checkin and return it.
        const newCheckin: Partial<Checkin> = {
            comments: undefined,
            guestId: undefined,
            paymentAmount: undefined,
            paymentType: undefined,
            showerTime: undefined,
            wakeupTime: undefined,
        }
        const [count, results] = await Checkin.update(newCheckin, {
            where: {
                id: checkinId
            }
        });
        if (count !== 1) {
            throw new BadRequest(
                `checkId: Cannot update Checkin ${checkinId}`
            )
        }
        return results[0];

    }

    public async assignsReassign
    (facilityId: number, oldCheckinId: number, newCheckinId: number): Promise<Checkin> {

        // Look up the corresponding Facility
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            throw new NotFound(
                `facilityId: Missing Facility ${facilityId}`,
                "FacilityServices.assignsReassign()");
        }

        // Look up the corresponding old Checkin
        const oldCheckin = await Checkin.findByPk(oldCheckinId);
        if (!oldCheckin) {
            throw new NotFound(
                `checkinId: Missing old Checkin ${oldCheckinId}`,
                "FacilityServices.assignsReassign()");
        }

        // Verify the status of the old Checkin
        if (oldCheckin.facilityId !== facility.id) {
            throw new BadRequest(
                `checkinId: Old Checkin ${oldCheckinId} does not belong to Facility ${facilityId}`,
                "FacilityServices.assignsReassign()");
        }
        if (!oldCheckin.guestId) {
            throw new BadRequest(
                `checkinId: Old Checkin ${oldCheckinId} is not currently assigned`,
                "FacilityServices.assignsReassign()");
        }

        // Look up the corresponding new Checkin
        const newCheckin = await Checkin.findByPk(newCheckinId);
        if (!newCheckin) {
            throw new NotFound(
                `checkinId: Missing new Checkin ${newCheckinId}`,
                "FacilityServices.assignsReassign()");
        }

        // Verify the status of the new Checkin
        if (newCheckin.facilityId !== facility.id) {
            throw new BadRequest(
                `checkinId: New Checkin ${newCheckinId} does not belong to Facility ${facilityId}`,
                "FacilityServices.assignsReassign()");
        }
        if (newCheckin.guestId) {
            throw new BadRequest(
                `checkinId: New Checkin ${newCheckinId} is assigned to Guest ${newCheckin.guestId}`,
                "FacilityServices.assignsReassign()");
        }

        // Update and save the new Checkin
        const newUpdate: Partial<Checkin> = {
            comments: oldCheckin.comments ? oldCheckin.comments : undefined,
            guestId: oldCheckin.guestId,
            paymentAmount: oldCheckin.paymentAmount ? oldCheckin.paymentAmount : undefined,
            paymentType: oldCheckin.paymentType ? oldCheckin.paymentType : undefined,
            showerTime: oldCheckin.showerTime ? oldCheckin.showerTime : undefined,
            wakeupTime: oldCheckin.wakeupTime ? oldCheckin.wakeupTime : undefined,
        }
        const [newCount, newResults] = await Checkin.update(newCheckin, {
            where: {
                id: newCheckinId
            }
        });
        if (newCount !== 1) {
            throw new BadRequest(
                `newCheckinId: Cannot update Checkin ${newCheckinId}`,
                "FacilityServices.assignsReassign()"
            )
        }

        // Update and save the old Checkin
        const oldCheckinUpdate: Partial<Checkin> = {
            comments: undefined,
            guestId: undefined,
            paymentAmount: undefined,
            paymentType: undefined,
            showerTime: undefined,
            wakeupTime: undefined,
        }
        const [oldCount, oldResults] = await Checkin.update(oldCheckinUpdate, {
            where: {
                id: oldCheckinId
            }
        });
        if (oldCount !== 1) {
            throw new BadRequest(
                `oldCheckinId: Cannot update Checkin ${oldCheckinId}`,
                "FacilityServices.assignsReassign()"

            )
        }

        // Return the updated new Checkin
        return newResults[0];

    }

}

export default new FacilityAssignServices();