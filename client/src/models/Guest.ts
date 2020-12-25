// Guest ---------------------------------------------------------------------

// A Guest who has ever checked in at a CityTeam Facility.

// Public Objects ------------------------------------------------------------

class Guest {

    constructor(data: any = {}) {
        this.active = data.active || true;
        this.comments = data.comments || null;
        this.facilityId = data.facilityId || -1;
        this.favorite = data.favorite || null;
        this.firstName = data.firstName || "";
        this.id = data.id || -1;
        this.lastName = data.lastName || "";
    }

    active!: boolean;
    comments?: string;
    facilityId!: number;
    favorite?: number;
    firstName!: string;
    id!: number;
    lastName!: string;

}

export default Guest;
