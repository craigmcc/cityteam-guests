// Summary -------------------------------------------------------------------

// Summary of Checkins to a particular Facility, on a particular Date.

// Public Objects ------------------------------------------------------------

class Summary {

    constructor(facilityId?: number, checkinDate?: Date) {
        if (facilityId) {
            this.facilityId = facilityId;
        }
        if (checkinDate) {
            this.checkinDate = checkinDate;
        }
    }

    // Primary key values
    checkinDate: Date = new Date("2019-12-31");
    facilityId: number = 0;

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
    totalAmount: number = 0;
    totalAmountDisplay: string = "";
    totalAssigned: number = 0;
    totalMats: number = 0;
    totalUnassigned: number = 0;

    // Calculated percentages
    percentAssigned: string = "0.0%";  // Will be decorated with "%"
    percentUnassigned: string = "0.0%";// Will be decorated with "%"

}

export default Summary;
