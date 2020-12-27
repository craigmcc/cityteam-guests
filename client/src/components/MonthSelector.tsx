// MonthSelector -------------------------------------------------------------

// Selector drop-down to choose a month (YYYY-MM string) for processing.
// On up-to-date browsers like Chrome, this will utilize the browser's
// extended input facilities.  For other browsers, it will fall back to
// accepting and processing regular strings.

// External Modules ----------------------------------------------------------

import { detect as detectBrowser } from "detect-browser";
import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import { OnBlur, OnChangeInput, OnKeyDown } from "./types";
import { validateMonth } from "../util/validators";

// Incoming Properties -------------------------------------------------------

export type HandleMonth = (month: string) => void;

export interface Props {
    autoFocus?: boolean;            // Should element receive autoFocus? [false]
    disabled?: boolean;             // Should element be disabled? [false]
    handleMonth: HandleMonth;        // Handle new month selection [no handler]
    label?: string;                 // Element label [Month:]
    max?: string;                   // Maximum accepted value [no limit]
    min?: string;                   // Minimum accepted value [no limit]
    required?: boolean;             // Entry is required? [false]
    value?: string                  // Initially displayed value [""]
}

// Component Details ---------------------------------------------------------

const MonthSelector = (props: Props) => {

    const [type, setType] = useState<string>("text");
    const [value, setValue] = useState<string>(props.value ? props.value : "");

    useEffect(() => {
        const browser = detectBrowser();
        let newType: string = "text";
        switch (browser && browser.name) {
            case "chrome":
                newType = "month";
                break;
            default:
                newType = "text";
                break;
        }
//        console.info("MonthSelector.useEffect("
//            + `browser=${browser ? browser.name : "unknown"}, type=${newType})`);
        setType(newType);
    }, []);

    const onBlur: OnBlur = (event): void => {
//        console.info(`MonthSelector.onBlur(${value})`);
        processValue(value);
    }

    const onChange: OnChangeInput = (event): void => {
        const newValue: string = event.target.value;
        setValue(newValue);
//        console.info(`MonthSelector.onChange(${newValue})`);
    }

    const onKeyDown: OnKeyDown = (event): void => {
//        console.info(`MonthSelector.onKeyDown(${event.key}, ${value}, `
//            + `${(event.key === "Enter")})`);
        if (event.key === "Enter") {
            processValue(value);
        }
    }

    const processValue = (newValue: string): void => {

        // Validate the response
        let newValid = validateMonth(newValue);
        if (props.required && (newValue === "")) {
            newValid = false;
        } else if (props.max && (newValue > props.max)) {
            newValid = false;
        } else if (props.min && (newValue < props.min)) {
            newValid = false;
        }
//        console.info(`MonthSelector.processMonth(${newValue}, ${newValid})`);

        // Forward response to parent if valid
        if (!newValid) {
            let message = "Invalid month, must be in format YYYY-MM";
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
        } else if (newValid && props.handleMonth) {
            props.handleMonth(newValue);
        }

    }

    return (

        <>
            <Form inline>
                <Form.Label className="mr-2" htmlFor="monthSelector">
                    {props.label ? props.label : "Month:"}
                </Form.Label>
                <Form.Control
                    autoFocus={props.autoFocus ? props.autoFocus : undefined}
                    disabled={props.disabled ? props.disabled : undefined}
                    htmlSize={7}
                    id="monthSelector"
                    max={props.max ? props.max : undefined}
                    min={props.min ? props.min : undefined}
                    onBlur={onBlur}
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

export default MonthSelector;