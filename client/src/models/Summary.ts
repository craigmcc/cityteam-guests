// Summary -------------------------------------------------------------------

// Summary of Checkins to a particular Facility, on a particular Date.
// These are not a Sequelize model (because they are not stored in the database),
// but it is convenient to structure them like Model classes.

// Internal Modules ----------------------------------------------------------

import Checkin from "./Checkin";

// Public Objects ------------------------------------------------------------

export class Summary {

    constructor(facilityId?: number, checkinDate?: string) {
        if (facilityId) {
            this.facilityId = facilityId;
        }
        if (checkinDate) {
            this.checkinDate = checkinDate;
        }
    }

    // Primary key values
    checkinDate: string = "2019-12-31";
    facilityId: number = -1;

    // Total mat counts by payment type
    total$$: number = 0;
    totalAG: number = 0;
    totalCT: number = 0;
    totalFM: number = 0;
    totalMM: number = 0;
    totalSW: number = 0;
    totalUK: number = 0;
    totalWB: number = 0;

    // Overall totals
    totalAmount: number = 0.00;
    totalAssigned: number = 0;
    totalMats: number = 0;
    totalUnassigned: number = 0;

    // Calculated values
    percentAssigned: string = "0.0%";
    percentUnassigned: string = "0.0%";
    totalAmountDisplay: string = "$0.00";

    // Include the specified Checkin in our information
    includeCheckin(checkin: Checkin): void {
        if (checkin.guestId) {
            if (checkin.paymentAmount) {
                if (typeof checkin.paymentAmount === "string") {
                    this.totalAmount += parseFloat(checkin.paymentAmount);
                } else {
                    this.totalAmount += checkin.paymentAmount;
                }
            }
            switch (checkin.paymentType) {
                case "$$":  this.total$$++;   break;
                case "AG":  this.totalAG++;   break;
                case "CT":  this.totalCT++;   break;
                case "FM":  this.totalFM++;   break;
                case "MM":  this.totalMM++;   break;
                case "SW":  this.totalSW++;   break;
                case "UK":  this.totalUK++;   break;
                case "WB":  this.totalWB++;   break;
                default:    this.totalUK++;   break;
            }
            this.totalAssigned++;
        } else {
            this.totalUnassigned++;
        }
        this.totalMats++;
        this.recalculate();
    }

    includeSummary(summary: Summary): void {
        this.total$$ += summary.total$$;
        this.totalAG += summary.totalAG;
        this.totalCT += summary.totalCT;
        this.totalFM += summary.totalFM;
        this.totalMM += summary.totalMM;
        this.totalSW += summary.totalSW;
        this.totalUK += summary.totalUK;
        this.totalWB += summary.totalWB;
        this.totalAmount += summary.totalAmount;
        this.totalAssigned += summary.totalAssigned;
        this.totalMats += summary.totalMats;
        this.totalUnassigned += summary.totalUnassigned;
        this.recalculate();
    }

    private recalculate = () => {
        this.totalAmountDisplay = "$" + this.totalAmount.toFixed(2);
        if (this.totalMats > 0) {
            this.percentAssigned =
                "" + (this.totalAssigned * 100.0 / this.totalMats).toFixed(1) + "%";
            this.percentUnassigned =
                "" + (this.totalUnassigned * 100.0 / this.totalMats).toFixed(1) + "%";
        } else {
            this.percentAssigned = "0.0%";
            this.percentUnassigned = "0.0%";
        }
    }

}

export default Summary;
