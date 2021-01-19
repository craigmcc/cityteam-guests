// User ----------------------------------------------------------------------

// A user who may be authenticated to, and use the features of, this application.

// Public Objects ------------------------------------------------------------

class User {

    constructor(data: any = {}) {
        this.active = data.active || true;
        this.facilityId = data.facilityId || -1;
        this.id = data.id || -1;
        this.level = data.level || "info";
        this.name = data.name;
        this.password = data.password || null;
        this.scope = data.scope;
        this.username = data.username;
    }

    active!: boolean;
    facilityId!: number;
    id!: number;
    level?: string;
    name!: string;
    password?: string;
    scope!: string;
    username!: string;

}

export default User;
