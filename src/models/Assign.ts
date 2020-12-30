// Assign --------------------------------------------------------------------

// Subset of Checkin data associated with assigning a specific Guest to a
// specific Checkin.  These are not a Sequelize model (because they are not
// stored separately in the database), but it is convenient to structure them
// like Model classes.

// Public Objects {

class Assign {

    constructor (data: any = {}) {
        this.comments = data.comments || null;
        this.facilityId = data.facilityId || -1;
        this.guestId = data.guestId || -1;
        this.id = data.id || -1;
        this.paymentAmount = data.paymentAmount || null;
        this.paymentType = data.paymentType || null;
        this.showerTime = data.showerTime || null;
        this.wakeupTime = data.wakeupTime || null;
    }

    comments?: string;
    facilityId!: number;
    guestId!: number;
    id!: number;
    paymentAmount?: number;
    paymentType?: string;
    showerTime?: string;
    wakeupTime?: string;
}

export default Assign;
