// types ---------------------------------------------------------------------

// Typescript type definitions for application components.

// External Modules ----------------------------------------------------------

import React from "react";

// Internal Modules ----------------------------------------------------------

import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import Template from "../models/Template";
import User from "../models/User";

// Data Object Handlers ------------------------------------------------------

export type HandleAssign = (assign: Assign) => void;
export type HandleAssignOptional = (assign: Assign | null) => void;
export type HandleCheckin = (checkin: Checkin) => void;
export type HandleCheckinOptional = (checkin: Checkin | null) => void;
export type HandleFacility = (facility: Facility) => void;
export type HandleFacilityOptional = (facility: Facility | null) => void;
export type HandleGuest = (guest: Guest) => void;
export type HandleGuestOptional = (guest: Guest | null) => void;
export type HandleIndex = (index: number) => void;
export type HandleTemplate = (template: Template) => void;
export type HandleTemplateOptional = (template: Template | null) => void;
export type HandleUser = (user: User) => void;
export type HandleUserOptional = (user: User | null) => void;

// HTML Event Handlers -------------------------------------------------------

export type OnBlur = (event: React.FocusEvent<HTMLElement>) => void;
export type OnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type OnChangeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => void;
export type OnChangeTextArea = (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
export type OnClick = (event: React.MouseEvent<HTMLElement>) => void;
export type OnFocus = (event: React.FocusEvent<HTMLElement>) => void;
export type OnKeyDown = (event: React.KeyboardEvent<HTMLElement>) => void;

// Enumerations --------------------------------------------------------------

export enum PaymentTypes {
    $$ = "$$-Cash",
    AG = "AG-Agency",
    CT = "CT-CityTeam",
    FM = "FM-Free Mat",
    MM = "MM-Medical Mat",
    SW = "SW-Severe Weather",
    UK = "UK-Unknown",
    WB = "WB-Work Bed",
}

export enum Scopes {
    ADMIN = "admin",
    ANY = "any",
    REGULAR = "regular",
    SUPERUSER = "superuser",
}
