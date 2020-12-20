// Replacers -----------------------------------------------------------------

// Various replacers (lists of fields to include) for JSON.stringify() calls.

// Public Objects ------------------------------------------------------------

export const CHECKIN = [ "id", "facilityId", "checkinDate", "matNumber", "guestId" ];
export const FACILITY = [ "id", "name" ];
export const GUEST = [ "id", "facilityId", "firstName", "lastName" ];
export const TEMPLATE = [ "id", "facilityId", "name" ];

