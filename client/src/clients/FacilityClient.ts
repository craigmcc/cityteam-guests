// FacilityClient ------------------------------------------------------------

// Interact with Facility related server operations.

// Internal Modules ----------------------------------------------------------

import ApiBase from "./ApiBase";
//import Checkin from "../models/Checkin";
//import Facility from "../models/Facility";
//import Guest from "../models/Guest";
//import Summary from "../models/Summary";
//import Template from "../models/Template";

const FACILITIES_BASE = "/facilities";

// Public Objects ------------------------------------------------------------

class FacilityClient {

    // ***** Standard CRUD Methods *****

    async all<Facility>(params?: object): Promise<Facility[]> {
        return (await ApiBase.get(FACILITIES_BASE, params)).data;
    }

    async find<Facility>(facilityId: number, params?: Object): Promise<Facility> {
        return (await ApiBase.get(FACILITIES_BASE + `/${facilityId}`)).data;
    }

    async insert<Facility>(facility: Facility): Promise<Facility> {
        return (await ApiBase.post(FACILITIES_BASE, facility)).data;
    }

    async remove<Facility>(facilityId: number): Promise<Facility> {
        return (await ApiBase.delete(FACILITIES_BASE + `/${facilityId}`)).data;
    }

    async update<Facility>(facilityId: number, facility: Facility): Promise<Facility> {
        return (await ApiBase.put(FACILITIES_BASE + `/${facilityId}`, facility)).data;
    }

    // ***** Model-Specific Methods *****

    async active<Facility>(params?: object): Promise<Facility[]> {
        return (await ApiBase.get(FACILITIES_BASE + "/active", params)).data;
    }

    async exact<Facility>(name: string, params?: object): Promise<Facility> {
        return (await ApiBase.get(FACILITIES_BASE + `/name/${name}`)).data;
    }

    async name<Facility>(name: string, params?: object): Promise<Facility[]> {
        return (await ApiBase.get(FACILITIES_BASE + `/name/${name}`)).data;
    }

    // ***** Facility -> Checkin Methods *****

    // ***** Facility -> Guest Methods *****

    // ***** Facility -> Summary Methods *****

    // ***** Facility -> Template Methods *****

}

export default new FacilityClient();
