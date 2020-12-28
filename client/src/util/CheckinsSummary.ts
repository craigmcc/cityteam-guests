// CheckinsSummary -------------------------------------------------------------

// Calculate and return a Summary of the specified Checkins.

// Internal Modules ------------------------------------------------------------

import Checkin from "../models/Checkin";
import Summary from "../models/Summary";

// Public Objects --------------------------------------------------------------

const CheckinsSummary = (checkins: Checkin[]): Summary => {
    const summary: Summary = new Summary();
    let accumulatedAmount: number = 0.00;
    checkins.forEach(checkin => {
        summary.checkinDate = checkin.checkinDate;
        summary.facilityId = checkin.facilityId;
        if (checkin.guestId) {
            if (checkin.paymentAmount) {
                accumulatedAmount += checkin.paymentAmount;
            }
            switch (checkin.paymentType) {
                case "$$":  summary.total$$++;   break;
                case "AG":  summary.totalAG++;   break;
                case "CT":  summary.totalCT++;   break;
                case "FM":  summary.totalFM++;   break;
                case "MM":  summary.totalMM++;   break;
                case "SW":  summary.totalSW++;   break;
                case "UK":  summary.totalUK++;   break;
                case "WB":  summary.totalWB++;   break;
                default:    summary.totalUK++;   break;
            }
            summary.totalAssigned++;
        } else {
            summary.totalUnassigned++;
        }
        summary.totalMats++;
    });
    summary.totalAmount = "$" + accumulatedAmount.toFixed(2);
    if (summary.totalMats > 0) {
        summary.percentAssigned =
            "" + (summary.totalAssigned * 100.0 / summary.totalMats).toFixed(1) + "%";
        summary.percentUnassigned =
            "" + (summary.totalUnassigned * 100.0 / summary.totalMats).toFixed(1) + "%";
    }
    return summary;
}

export default CheckinsSummary;
