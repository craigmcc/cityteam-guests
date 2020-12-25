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
        return (await ApiBase.get(FACILITIES_BASE + `/exact/${name}`)).data;
    }

    async name<Facility>(name: string, params?: object): Promise<Facility[]> {
        return (await ApiBase.get(FACILITIES_BASE + `/name/${name}`)).data;
    }

    async scope<Facility>(scope: string, params?: object): Promise<Facility> {
        return (await ApiBase.get(FACILITIES_BASE + `/scope/${scope}`)).data;
    }

    // ***** Facility -> Checkin Methods *****

    // ***** Facility -> Guest Methods *****

    async guestsActive<Guest>
            (facilityId: number, params?: object): Promise<Guest[]> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/guests/active`)).data;
    }

    async guestsAll<Guest>
            (facilityId: number, params?: object): Promise<Guest[]> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/guests`)).data;
    }

    async guestsExact<Guest>
            (facilityId: number, firstName: string, lastName: string, params?: object): Promise<Guest> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/guests/exact/${firstName}/${lastName}`)).data;
    }

    async guestsInsert<Guest>
            (facilityId: number, guest: Guest): Promise<Guest> {
        return (await ApiBase.post(FACILITIES_BASE
            + `/${facilityId}/guests`, guest)).data;
    }

    async guestsName<Guest>
            (facilityId: number, name: string, params?: object): Promise<Guest[]> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/guests/name/${name}`)).data;
    }

    async guestsRemove<Guest>
            (facilityId: number, guestId: number): Promise<Guest> {
        return (await ApiBase.delete(FACILITIES_BASE
            + `/${facilityId}/guests/${guestId}`)).data;
    }

    async guestsUpdate<Guest>
            (facilityId: number, guestId: number, guest: Guest): Promise<Guest> {
        return (await ApiBase.put(FACILITIES_BASE
            + `/${facilityId}/guests/${guestId}`, guest)).data;
    }

    // ***** Facility -> Summary Methods *****

    // ***** Facility -> Template Methods *****

    async templatesActive<Template>
            (facilityId: number, params?: object): Promise<Template[]> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/templates/active`)).data;
    }

    async templatesAll<Template>
    (facilityId: number, params?: object): Promise<Template[]> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/templates`)).data;
    }

    async templatesExact<Template>
            (facilityId: number, name: string, params?: object): Promise<Template> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/templates/exact/${name}`)).data;
    }

    async templatesInsert<Template>
            (facilityId: number, template: Template): Promise<Template> {
        return (await ApiBase.post(FACILITIES_BASE
            + `/${facilityId}/templates`, template)).data;
    }

    async templatesName<Template>
            (facilityId: number, name: string, params?: object): Promise<Template[]> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/templates/name/${name}`)).data;
    }

    async templatesRemove<Template>
            (facilityId: number, templateId: number): Promise<Template> {
        return (await ApiBase.delete(FACILITIES_BASE
            + `/${facilityId}/templates/${templateId}`)).data;
    }

    async templatesUpdate<Template>
            (facilityId: number, templateId: number, template: Template): Promise<Template> {
        return (await ApiBase.put(FACILITIES_BASE
            + `/${facilityId}/templates/${templateId}`, template)).data;
    }

    // ***** Facility -> User Methods *****

    async usersActive<User>
    (facilityId: number, params?: object): Promise<User[]> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/users/active`)).data;
    }

    async usersAll<User>
    (facilityId: number, params?: object): Promise<User[]> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/users`)).data;
    }

    async usersExact<User>
    (facilityId: number, name: string, params?: object): Promise<User> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/users/exact/${name}`)).data;
    }

    async usersInsert<User>
    (facilityId: number, user: User): Promise<User> {
        return (await ApiBase.post(FACILITIES_BASE
            + `/${facilityId}/users`, user)).data;
    }

    async usersName<User>
    (facilityId: number, name: string, params?: object): Promise<User[]> {
        return (await ApiBase.get(FACILITIES_BASE
            + `/${facilityId}/users/name/${name}`)).data;
    }

    async usersRemove<User>
    (facilityId: number, userId: number): Promise<User> {
        return (await ApiBase.delete(FACILITIES_BASE
            + `/${facilityId}/users/${userId}`)).data;
    }

    async usersUpdate<User>
    (facilityId: number, userId: number, user: User): Promise<User> {
        return (await ApiBase.put(FACILITIES_BASE
            + `/${facilityId}/users/${userId}`, user)).data;
    }

}

export default new FacilityClient();
