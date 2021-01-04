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

import {HandleDate, /* OnBlur,*/ OnChangeInput, OnKeyDown} from "./types";
import { validateDate } from "../util/validators";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;            // Should element receive autoFocus? [false]
    disabled?: boolean;             // Should element be disabled? [false]
    handleDate?: HandleDate;        // Handle new date selection [no handler]
    label?: string;                 // Element label [Date:]
    max?: string;                   // Maximum accepted value [no limit]
    min?: string;                   // Minimum accepted value [no limit]
    name?: string;                  // Input control name [dateSelector]
    required?: boolean;             // Entry is required? [false]
    value?: string                  // Initially displayed value [""]
}

// Component Details ---------------------------------------------------------

const DateSelector = (props: Props) => {

    const [name] = useState<string>(props.name ? props.name : "dateSelector");
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
                break;
        }
        setType(newType);
    }, []);

    const onChange: OnChangeInput = (event): void => {
        const newValue: string = event.target.value;
        setValue(newValue);
        console.info(`DateSelector.onChange(${newValue})`);
    }

    const onKeyDown: OnKeyDown = (event): void => {
        console.info(`DateSelector.onKeyDown(${event.key}, ${value})`);
        if ((event.key === "Enter") || (event.key === "Tab")) {
            processValue(value);
        }
    }

    const processValue = (newValue: string): void => {

        // Validate the response
        let newValid = validateDate(newValue);
        if (props.required && (newValue === "")) {
            newValid = false;
        } else if (props.max && (newValue > props.max)) {
            newValid = false;
        } else if (props.min && (newValue < props.min)) {
            newValid = false;
        }

        // Forward response to parent if valid
        if (!newValid) {
            let message = "Invalid date, must be in format YYYY-MM-DD";
            if (props.required && (newValue === "")) {
                message += ", required";
            }
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

    return (

        <>
            <Form inline>
                <Form.Label className="mr-2" htmlFor={name}>
                    {props.label ? props.label : "Date:"}
                </Form.Label>
                <Form.Control
                    autoFocus={props.autoFocus ? props.autoFocus : undefined}
                    disabled={props.disabled ? props.disabled : undefined}
                    htmlSize={10}
                    id={name}
                    max={props.max ? props.max : undefined}
                    min={props.min ? props.min : undefined}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    size="sm"
                    type={type}
                    value={value}
                />
            </Form>
        </>

    )

}

export default DateSelector;
