// sort-orders ---------------------------------------------------------------

// Standard "order" options for sorting returned results.

// External Modules ----------------------------------------------------------

import { Order } from "sequelize";

// Public Objects ------------------------------------------------------------

export const CHECKIN_ORDER: Order = [
    ["facilityId", "ASC"],
    ["checkinDate", "ASC"],
    ["matNumber", "ASC"],
];

export const FACILITY_ORDER: Order = [
    ["name", "ASC"],
];

export const GUEST_ORDER: Order = [
    ["facilityId", "ASC"],
    ["lastName", "ASC"],
    ["firstName", "ASC"],
];

export const TEMPLATE_ORDER: Order = [
    ["facilityId", "ASC"],
    ["name", "ASC"],
];

