// async-validators ----------------------------------------------------------

// Custom (to this application) validation methods that must interact with
// the server asynchronously to perform their validations.  In all cases,
// a "true" return indicates that the proposed value is valid, while
// "false" means it is not.  If a field is required, that must be
// validated separately.

// The methods defined here should correspond (in name and parameters) to
// the similar ones in the server side asynch-validators set, because they
// perform the same semantic functions.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import Facility from "../models/Facility";
import Template from "../models/Template";
import Guest from "../models/Guest";
import User from "../models/User";

// Public Objects ------------------------------------------------------------

export const validateFacilityNameUnique
    = async (facility: Facility): Promise<boolean> =>
{
    if (facility) {
        try {
            const result: Facility = await FacilityClient.exact(facility.name);
            return (result.id === facility.id);
        } catch (error) {
            return true; // Definitely unique
        }
    } else {
        return true;
    }
}

export const validateFacilityScopeUnique
    = async (facility: Facility): Promise<boolean> =>
{
    if (facility) {
        try {
            const result: Facility = await FacilityClient.scope(facility.scope);
            return (result.id === facility.id);
        } catch (error) {
            return true; // Definitely unique
        }
    } else {
        return true;
    }
}

export const validateGuestNameUnique
    = async (guest: Guest): Promise<boolean> =>
{
    if (guest) {
        try {
            const result: Guest = await FacilityClient.guestsExact
                (guest.facilityId, guest.firstName, guest.lastName);
            return (result.id === guest.id);
        } catch (error) {
            return true; // Definitely unique
        }
    } else {
        return true;
    }
}

export const validateTemplateNameUnique
    = async (template: Template): Promise<boolean> =>
{
    if (template) {
        try {
            const result: Template
                = await FacilityClient.templatesExact(template.facilityId, template.name);
            return (result.id === template.id);
        } catch (error) {
            return true; // Definitely unique
        }
    } else {
        return true;
    }
}

export const validateUserUsernameUnique
    = async (user: User): Promise<boolean> =>
{
    if (user) {
        try {
            const result: User
                = await FacilityClient.usersUnique(user.facilityId, user.username);
            return (result.id === user.id);
        } catch (error) {
            return true; // Definitely unique
        }
    } else {
        return true;
    }
}

