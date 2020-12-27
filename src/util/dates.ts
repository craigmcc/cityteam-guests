// dates ---------------------------------------------------------------------

// All methods except fromDateObject (Date -> String) and
// toDateObject (String -> Date) accept and return strings
// in YYYY-MM-DD format.

// NOTE:  No validations are done here, use validators.validateDate() as needed

// External Modules ----------------------------------------------------------

import addDays from "date-fns/addDays";
import format from "date-fns/format";
import subDays from "date-fns/subDays";

// Public Objects ------------------------------------------------------------

// Return the specified date minus decrement days
export const decrementDate = (originalDate: string, decrement: number): string => {
    return fromDateObject(subDays(toDateObject(originalDate), decrement));
}

// Return the date string from the specified Date object (local time)
export const fromDateObject = (originalObject: Date): string => {
    let temp = format(originalObject, "P");
    return temp.substr(6, 4) + "-" + temp.substr(0, 2)
        + "-" + temp.substr(3, 2);
}

// Return the specified date plus increment days
export const incrementDate = (originalDate: string, increment: number): string => {
    return fromDateObject(addDays(toDateObject(originalDate), increment));
}

// Return the current date in the local time zone
export const todayDate = (): string => {
    return fromDateObject(new Date());
}

// Return the Date object representing the specified date
export const toDateObject = (originalDate: string): Date => {
    return new Date(originalDate + " 00:00:00");
}

