// custom-validations --------------------------------------------------------

// Custom (to this application) validation methods that can be used by both
// backend database interactions and frontend UI components.  In all cases,
// a "true" return indicates that the proposed value is valid, while "false"
// means it is not.  If a field is required, that must be validated separately.

// Internal Modules ----------------------------------------------------------

import MatsList from "./MatsList";

// Public Objects ------------------------------------------------------------
export const validateMatsList = (matsList: string): boolean => {
    if (matsList) {
        try {
            new MatsList(matsList);
            return true;
        } catch(error) {
            return false;
        }
    } else {
        return true;
    }
    return true;
}

export const validateMatsSubset = (parentList: string, childList: string): boolean => {
    if (parentList && childList) {
        try {
            const parentMatsList = new MatsList(parentList);
            const childMatsList = new MatsList(childList);
            return childMatsList.isSubsetOf(parentMatsList);
        } catch (error) {
            return false;
        }
    }
    return true;
}

export const validatePaymentAmount = (paymentAmount: number): boolean => {
    if (paymentAmount) {
        return (paymentAmount > 0.00);
    } else {
        return true;
    }
}

export const validatePaymentType = (paymentType: string): boolean => {
    if (paymentType) {
        return validPaymentTypes.includes(paymentType);
    } else {
        return true;
    }
}

// Private Objects -----------------------------------------------------------

const validFeatures: string [] =
    [ "H", "S", "HS", "SH", "W" ];

const validPaymentTypes: string[] =
    [ "$$", "AG", "CT", "FM", "MM", "SW", "UK", "WB" ];
