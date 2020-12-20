// Facility ------------------------------------------------------------------

// A CityTeam Facility with overnight guests managed with this application.

// Public Objects -------------------------------------------------------------

class Facility {

    constructor(data: any = {}) {
        this.active = data.active || true;
        this.address1 = data.address1 || null;
        this.address2 = data.address2 || null;
        this.city = data.city || null;
        this.email = data.email || null;
        this.id = data.id || -1;
        this.name = data.name;
        this.phone = data.phone || null;
        this.scope = data.scope || "";
        this.state = data.state || null;
        this.zipCode = data.zipCode || null;
    }

    active!: boolean;
    address1?: string;
    address2?: string;
    city?: string;
    email?: string;
    id!: number;
    name!: string;
    phone?: string;
    scope!: string;
    state?: string;
    zipCode?: string;

}

export default Facility;
