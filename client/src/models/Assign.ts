// Assign --------------------------------------------------------------------

// Assignment details for a Guest being checked in.

// Public Objects ------------------------------------------------------------

class Assign {

    constructor(data: any = {}) {
        this.comments = data.comments || null;
        this.facilityId = data.facilityId || -1;
        this.guestId = data.guestId || -1;
        this.paymentAmount = data.paymentAmount || null;
        this.paymentType = data.paymentType || null;
        this.showerTime = data.showerTime || null;
        this.wakeupTime = data.wakeupTime || null;
    }

    comments?: string;
    facilityId!: number;
    guestId!: number;
    id!: number;                // Will be id of corresponding Checkin
    paymentAmount?: number;
    paymentType?: string;
    showerTime?: string;
    wakeupTime?: string;

}

export default Assign;
