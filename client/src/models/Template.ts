// Template ------------------------------------------------------------------

// Template for generating mats for Checkins at a particular Facility,
// on a particular checkin date.

// Public Objects ------------------------------------------------------------

class Template {

    constructor(data: any = {}) {
        this.active = data.active || true;
        this.allMats = data.allMats || "";
        this.comments = data.comments || null;
        this.facilityId = data.facilityId || -1;
        this.handicapMats = data.handicapMats || null;
        this.id = data.id || -1;
        this.name = data.name || "";
        this.socketMats = data.socketMats || null;
        this.workMats = data.workMats || null;
    }

    active!: boolean;
    allMats!: string;
    comments?: string;
    facilityId!: number;
    handicapMats?: string;
    id!: number;
    name!: string;
    socketMats?: string;
    workMats?: string;

}

export default Template;
