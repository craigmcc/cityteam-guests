// abridgers -----------------------------------------------------------------

// Return abridged versions of model objects for use in log events.

// Internal Modules ----------------------------------------------------------

import Facility from "../models/Facility";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

export const FACILITY = (facility: Facility): any => {
    return {
        id: facility.id,
        name: facility.name,
    };
}

export const USER = (user: User): any => {
    return {
        id: user.id,
        facilityId: user.facilityId,
        scope: user.scope,
        username: user.username,
    };
}

