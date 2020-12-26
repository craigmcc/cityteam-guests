// months --------------------------------------------------------------------

// All methods except monthFromObject (Date -> String) and
// monthToObject (String -> Date) accept and return strings
// in YYYY-MM format for months, and in YYYY-MM-DD format for dates.

// NOTE:  No validations are done here, use validators.validateMonth() as needed

// External Modules ----------------------------------------------------------

import addMonths from "date-fns/addMonths";
import endOfMonth from "date-fns/endOfMonth";
import startOfMonth from "date-fns/startOfMonth";
import subMonths from "date-fns/subMonths";

// Internal Modules ----------------------------------------------------------

import {
    fromDateObject,
    toDateObject,
    todayDate
} from "./dates";

// Public Objects ------------------------------------------------------------

// Return the specified month minus decrement days
export const decrementMonth = (originalMonth: string, decrement: number): string => {
    let originalDate: Date = toDateObject(originalMonth + "-01");
    let updatedDate: Date = subMonths(originalDate, decrement);
    return fromDate(fromDateObject(updatedDate));
}

// Return the end date for the specified month
export const endDate = (originalMonth: string): string => {
    let date = toDateObject(originalMonth + "-01");
    return fromDateObject(endOfMonth(date));
}

// Return the month containing the specified date
export const fromDate = (originalDate: string): string => {
    return originalDate.substr(0, 7);
}

// Return the specified month plus increment days
export const incrementMonth = (originalMonth: String, increment: number): string => {
    let originalDate: Date = toDateObject(originalMonth + "-01");
    let updatedDate: Date = addMonths(originalDate, increment);
    return fromDate(fromDateObject(updatedDate));
}

// Return the month containing today's date
export const todayMonth = () => {
    return todayDate().substr(0, 7);
}

// Return the start date for the specified month
export const startDate = (originalMonth: string): string => {
    let date: Date = toDateObject(originalMonth + "-01");
    return fromDateObject(startOfMonth(date));
}

