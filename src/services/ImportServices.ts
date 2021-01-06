// Import Services -----------------------------------------------------------

// Services for importing CSV files of checkins from the "Shelter Log"
// spreadsheet at CityTeam Portland.

// External Modules -----------------------------------------------------------

// Internal Modules -----------------------------------------------------------

import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import { Problem } from "../routers/DevModeRouter";
import {
    validateFeatures, validatePaymentType
} from "../util/application-validators";

// Public Objects -------------------------------------------------------------

export class ImportServices {

    // Public Methods --------------------------------------------------------

    public importCheckin
        = async (facility: Facility, row: Object, allProblems: Problem[])
        : Promise<Checkin | null> =>
    {

        // Set up the data storage we will need
        const rowProblems: Problem[] = [];
        const checkin: Checkin = new Checkin({
            facilityId: facility.id,
            guestId: null,
        });

        // Parse the incoming fields that are always required
        this.parseCheckinDate(checkin, row, rowProblems);
        this.parseMatNumberAndFeatures(checkin, row, rowProblems);

        // Look up or create a Guest to be assigned to this Checkin (if any)
        if (!this.anyFatal(rowProblems)) {
            await this.parseGuestNames(checkin, row, rowProblems);
        }

        // Parse the incoming fields that are required for assigned Guests only
        if (checkin.guestId && (checkin.guestId  > 0) && !this.anyFatal(rowProblems)) {
            this.parsePaymentTypeAndAmount(checkin, row, rowProblems);
            this.parseComments(checkin, row, rowProblems);
        }

        // Update allProblems and return Checkin if there were no fatal errors
        this.appendProblems(allProblems, rowProblems);
        if (this.anyFatal(rowProblems)) {
            return null;
        }

        // Otherwise, persist the created Checkin and return it
        const created = await Checkin.create(checkin);
        return created;

    }

    // Private Methods -------------------------------------------------------

    private anyFatal
        = (problems: Problem[])
        : boolean =>
    {
        let result = false;
        problems.forEach(problem => {
            if (problem.fatal) {
                result = true;
            }
        });
        return result;
    }

    private appendProblems
        = (toProblems: Problem[], fromProblems: Problem[])
        : void =>
    {
        fromProblems.forEach(fromProblem => {
            toProblems.push(fromProblem);
        });
    }

    private parseCheckinDate
        = (checkin: Checkin, row: any, problems: Problem[])
        : void =>
    {
        if (!row.checkinDate || (row.checkinDate.length === 0)) {
            problems.push(new Problem(
                "Missing checkinDate",
                "Failing this import",
                row,
                true
            ));
        } else {
            try {
                checkin.checkinDate = new Date(row.checkinDate);
            } catch (error) {
                problems.push(new Problem(
                    "Cannot parse checkinDate",
                    "Failing this import",
                    row,
                    true
                ));
            }
        }
    }

    private parseComments
        = (checkin: Checkin, row: any, problems: Problem[])
        : void =>
    {
        if (row.comments && (row.comments.lenth > 0)) {
            checkin.comments = row.comments;
        }
    }

    private parseGuestNames
        = async (checkin: Checkin, row: any, problems: Problem[])
        : Promise<void> =>
    {

        // Verify that either both names, or neither name, is present
        let inFirstName = "";
        let inLastName = "";
        if (row.firstName && (row.firstName.length > 0)) {
            inFirstName = row.firstName;
        }
        if (row.lastName && (row.lastName.length > 0)) {
            inLastName = row.lastName;
        }
        if ((inFirstName === "") && (inLastName === "")) {
            return; // No Guest was assigned to the mat
        }

        // Verify that both names are present and valid
        if (inFirstName === "") {
            problems.push(new Problem(
                "Missing firstName but lastName present",
                "Failing this import",
                row,
                true
            ));
        } else if (inFirstName.startsWith("*")) {
            problems.push(new Problem(
                `Invalid firstName '${inFirstName}'`,
                "Failing this import",
                row,
                true
            ));
        }

        if (inLastName === "") {
            problems.push(new Problem(
                "Missing lastName but firstName present",
                "Failing this import",
                row,
                true
            ));
        } else if (inLastName.startsWith("*")) {
            problems.push(new Problem(
                `Invalid lastName '${inLastName}'`,
                "Failing this import",
                row,
                true
            ));
        }
        if (this.anyFatal(problems)) {
            return;
        }

        // Find or create a Guest (within this Facility) with these names
        // and record the Guest's id in the Checkin we are building
        try {
            const [guest, created] = await Guest.findOrCreate({
                defaults: {
                    active: true,
                },
                where: {
                    facilityId: checkin.facilityId,
                    firstName: inFirstName,
                    lastName: inLastName
                }
            });
            checkin.guestId = guest.id;
        } catch (error) {
            problems.push(new Problem(
                "Guest.findOrCreate() error: " + error.message,
                "Failing this import",
                row,
                true
            ));
            console.error(
                `Error from Guest.findOrCreate(${inFirstName} ${inLastName})`,
                error
            );
        }

    }

    private parseMatNumberAndFeatures
        = (checkin: Checkin, row: any, problems: Problem[])
        : void =>
    {

        if (!row.matNumber || (row.matNumber.length === 0)) {
            problems.push(new Problem(
                "Missing matNumber",
                "Failing this import",
                row,
                true
            ));
            return;
        }

        let input = row.matNumber;
        let featuring = false;
        let inFeatures = "";
        let inMatNumber = 0;
        for (let i = 0; i < input.length; i++) {
            let c = input.charAt(i);
            if ((c >= '0') && (c <= '9')) {
                if (featuring) {
                    problems.push(new Problem(
                        `Cannot parse matNumber from '${input}'`,
                        "Failing this import",
                        row,
                        true
                    ));
                } else {
                    inMatNumber = (inMatNumber * 10) + parseInt(c);
                }
            } else {
                featuring = true;
                inFeatures += c;
            }
            if (inMatNumber > 0) {
                checkin.matNumber = inMatNumber;
            } else {
                problems.push(new Problem(
                    `Missing matNumber in '${input}'`,
                    "Failing this import",
                    row,
                    true
                ));
            }
            if (inFeatures.length > 0) {
                if (validateFeatures(inFeatures)) {
                    checkin.features = inFeatures;
                } else {
                    problems.push(new Problem(
                        `Invalid features '${inFeatures}' in '${input}'`,
                        "Ignoring invalid features",
                        row
                    ));
                }
            }

        }

    }

    private parsePaymentTypeAndAmount
        = (checkin: Checkin, row: any, problems: Problem[])
        : void =>
    {
        if (row.paymentType && (row.paymentType.length > 0)) {
            if (validatePaymentType(row.paymentType)) {
                checkin.paymentType = row.paymentType;
                if (row.paymentType === "$$") {
                    row.paymentAmount = 5.00;
                }
            } else {
                problems.push(new Problem(
                    `Invalid payment type ${row.paymentType}`,
                    "Setting to 'UK'",
                    row
                ));
            }
        } else {

        }
    }

}

export default new ImportServices();
