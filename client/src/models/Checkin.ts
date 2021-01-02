// Checkin -------------------------------------------------------------------

// Record of an actual (guestId !== null) or potential (guestId === null)
// checkin for a particular mat, on a particular checkin date, at a particular
// Facility, by a particular Guest.

// If this Checkin includes (guestId != null), the guest property will be
// filled out if withGuest was specified on the client call to retrieve
// this Checkin.

// Internal Objects ----------------------------------------------------------

import Guest from "./Guest";

// Public Objects ------------------------------------------------------------

class Checkin {

    constructor(data: any = {}) {
        this.checkinDate = data.checkinDate || new Date();
        this.comments = data.comments || null;
        this.facilityId = data.facilityId || -1;
        this.features = data.features || null;
        this.guest = data.guest || null;
        this.guestId = data.guestId || null;
        this.id = data.id || -1;
        this.matNumber = data.matNumber || -1;
        this.paymentAmount = data.paymentAmount || null;
        this.paymentType = data.paymentType || null;
        this.showerTime = data.showerTime || null;
        this.wakeupTime = data.wakeupTime || null;
    }

    checkinDate!: Date;
    comments?: string;
    facilityId!: number;
    features?: string;
    guest?: Guest;
    guestId?: number;
    id!: number;
    matNumber!: number;
    paymentAmount?: number;
    paymentType?: string;
    showerTime?: Date;
    wakeupTime?: Date;

    get matNumberAndFeatures() {
        let result = "" + this.matNumber;
        if (this.features) {
            result += this.features;
        }
        return result;
    }

}

export default Checkin;
