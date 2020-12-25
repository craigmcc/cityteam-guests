// async-validators ----------------------------------------------------------

// Custom (to this application) validation methods that can only be used by
// server side applications, because they interact directly with the database.
// In all cases, a "true" return indicates that the proposed value is valid,
// while "false" means it is not.  If a field is required, that must be
// validated separately.

// External Modules ----------------------------------------------------------

import User from "../models/User";

const { Op } = require("sequelize");

// Internal Modules ----------------------------------------------------------

import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Template from "../models/Template";

// Public Objects ------------------------------------------------------------

export const validateCheckinKeyUnique
    = async (checkin: Checkin): Promise<boolean> =>
{
    if (checkin) {
        let options: any = {
            where: {
                checkinDate: checkin.checkinDate,
                facilityId: checkin.facilityId,
                matNumber: checkin.matNumber
            }
        }
        if (checkin.id) {
            options.where.id = { [Op.ne]: checkin.id }
        }
        const results: Checkin[] = await Checkin.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateFacilityId = async (facilityId: number): Promise<boolean> => {
    if (facilityId) {
        const facility: Facility | null = await Facility.findByPk(facilityId);
        return (facility !== null);
    } else {
        return true;
    }
}

export const validateFacilityNameUnique
    = async (facility: Facility): Promise<boolean> =>
{
    if (facility) {
        let options: any = {};
        if (facility.id && (facility.id > 0)) {
            options = {
                where: {
                    id: {[Op.ne]: facility.id},
                    name: facility.name
                }
            }
        } else {
            options = {
                where: {
                    name: facility.name
                }
            }
        }
        let results: Facility[] = await Facility.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateFacilityScopeUnique
    = async (facility: Facility): Promise<boolean> =>
{
    if (facility) {
        let options: any = {};
        if (facility.id && (facility.id > 0)) {
            options = {
                where: {
                    id: {[Op.ne]: facility.id},
                    scope: facility.scope
                }
            }
        } else {
            options = {
                where: {
                    scope: facility.scope
                }
            }
        }
        let results: Facility[] = await Facility.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateGuestId = async (facilityId: number, guestId: number | undefined): Promise<boolean> => {
    if (guestId) {
        const guest: Guest | null = await Guest.findByPk(guestId);
        if (!guest) {
            return false;
        } else {
            return guest.facilityId === facilityId;
        }
    } else {
        return true;
    }
}

export const validateGuestNameUnique
    = async (guest: Guest): Promise<boolean> =>
{
    if (guest) {
        let options: any = {
            where: {
                facilityId: guest.facilityId,
                firstName: guest.firstName,
                lastName: guest.lastName
            }
        }
        if (guest.id) {
            options.where.id = { [Op.ne]: guest.id }
        }
        const results: Guest[] = await Guest.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateTemplateNameUnique
    = async (template: Template): Promise<boolean> =>
{
    if (template) {
        let options: any = {
            where: {
                facilityId: template.facilityId,
                name: template.name
            }
        }
        if (template.id) {
            options.where.id = { [Op.ne]: template.id }
        }
        const results: Template[] = await Template.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

export const validateUserUsernameUnique
    = async (user: User): Promise<boolean> =>
{
    if (user) {
        let options: any = {
            where: {
                facilityId: user.facilityId,
                username: user.username,
            }
        }
        if (user.id) {
            options.where.id = { [Op.ne]: user.id }
        }
        const results: User[] = await User.findAll(options);
        return (results.length === 0);
    } else {
        return true;
    }
}

