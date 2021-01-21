// abridgers -----------------------------------------------------------------

// Return abridged versions of model objects for use in log events.

// Internal Modules ----------------------------------------------------------

import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Template from "../models/Template";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

export const ASSIGN = (assign: Assign): any => {
    return {
        id: assign.id,
        facilityId: assign.facilityId,
        guestId: assign.guestId,
    };
}

export const CHECKIN = (checkin: Checkin): any => {
    return {
        id: checkin.id,
        checkinDate: checkin.checkinDate,
        facilityId: checkin.facilityId,
        guestId: checkin.guestId,
        matNumber: checkin.matNumber,
    };
}

export const FACILITY = (facility: Facility): any => {
    return {
        id: facility.id,
        name: facility.name,
    };
}

export const GUEST = (guest: Guest): any => {
    return {
        id: guest.id,
        facilityId: guest.facilityId,
        firstName: guest.firstName,
        lastName: guest.lastName,
    };
}

export const TEMPLATE = (template: Template): any => {
    return {
        id: template.id,
        facilityId: template.facilityId,
        name: template.name,
    }
}

export const USER = (user: User): any => {
    return {
        id: user.id,
        facilityId: user.facilityId,
        scope: user.scope,
        username: user.username,
    };
}

