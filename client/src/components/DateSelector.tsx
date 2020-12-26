// DateSelector --------------------------------------------------------------

// Selector drop-down to choose a date (YYYY-MM-DD string) for processing.
// On up-to-date browsers like Chrome, this will utilize the browser's
// extended input facilities.  For other browsers, it will fall back to
// accepting and processing regular strings.

// External Modules ----------------------------------------------------------

import { detect as detectBrowser } from "detect-browser";
import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import { OnChangeSelect } from "./types";
import {validateDate} from "../util/validators";

// Incoming Properties -------------------------------------------------------

export type HandleDate = (date: string) => void;

export interface Props {
    autoFocus?: boolean;            // Should element receive autoFocus? [false]
    disabled?: boolean;             // Should element be disabled? [false]
    handleDate: HandleDate;         // Handle new date selection [no handler]
    label?: string;                 // Element label [Date:]
    max?: string;                   // Maximum accepted value [no limit]
    min?: string;                   // Minimum accepted value [no limit]
    required?: boolean;             // Entry is required? [false]
    value?: string                  // Initially displayed value [""]
}

// Component Details ---------------------------------------------------------

export const DateSelector = (props: Props) => {

    const [type, setType] = useState<string>("text");
    const [value, setValue] = useState<string>(props.value ? props.value : "");

    useEffect(() => {
        const browser = detectBrowser();
        let newType: string = "text";
        switch (browser && browser.name) {
            case "chrome":
                newType = "date";
                break;
            default:
                newType = "text";
                break;
        }
        console.info("DateSelector.useEffect("
            + `browser=${browser ? browser.name : "unknown"}, type=${newType})`);
        setType(newType);
    });

    const onChange: OnChangeSelect = (event) => {
        const newValue: string = event.target.value;
        setValue(newValue);
        let newValid: boolean = validateDate(newValue);
        // Validate the response
        if (props.required && (newValue === "")) {
            newValid = false;
        } else if (props.max && (newValue > props.max)) {
            newValid = false;
        } else if (props.min && (newValue < props.min)) {
            newValid = false;
        }
        console.info("DateSelector.onChange("
            + `value=${newValue}, valid=${newValid})`)

        // Forward validated response to parent
        if (!newValid) {
            let message = "Invalid date specifier, must be in format YYYY-MM-DD";
            if (props.max && (newValue > props.max)) {
                message += `, <= ${props.max}`;
            }
            if (props.min && (newValue < props.min)) {
                message += `, >= ${props.min}`;
            }
            alert(message);
        } else if (newValid && props.handleDate) {
            props.handleDate(newValue);
        }
    }

    // TODO - need onKeyDown(enter)?

    return (

        <>
            <Form inline>
                <Form.Label className="mr-1" htmlFor="dateSelector">
                    {props.label ? props.label : "Date:"}
                </Form.Label>
                <Form.Control
                    autoFocus={props.autoFocus ? props.autoFocus : undefined}
                    disabled={props.disabled ? props.disabled : undefined}
                    htmlSize={10}
                    id="dateSelector"
                    onChange={onChange}
                    size="sm"
                    type={type}
                    value={value}
                />
            </Form>
        </>

    )

}

export default DateSelector;
