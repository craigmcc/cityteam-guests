// replacers -----------------------------------------------------------------

// Various replacers (lists of fields to include) for JSON.stringify() calls.

// Public Objects ------------------------------------------------------------

export const ASSIGN = [ "id", "facilityId", "guestId" ];
export const CHECKIN = [ "id", "facilityId", "checkinDate", "matNumber", "guestId",
    "guest.firstName", "guest.lastName" ];
export const FACILITY = [ "id", "name" ];
export const GUEST = [ "id", "facilityId", "firstName", "lastName" ];
export const TEMPLATE = [ "id", "facilityId", "name" ];
export const USER = [ "id", "facilityId", "username", "scope" ];
