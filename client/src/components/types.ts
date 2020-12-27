// types ---------------------------------------------------------------------

// Typescript type definitions for application components.

// External Modules ----------------------------------------------------------

import React from "react";

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


