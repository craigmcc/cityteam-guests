// TextMonthSelector ---------------------------------------------------------

// Selector (text version) to choose a month (YYYY-MM string) for processing.

// External Modules ----------------------------------------------------------

import React, { useState } from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import { HandleMonth, OnChangeInput, OnKeyDown } from "./types";
import { validateMonth } from "../util/validators";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;            // Should element receive autoFocus? [false]
    disabled?: boolean;             // Should element be disabled? [false]
    handleMonth?: HandleMonth;      // Handle new month selection [no handler]
    label?: string;                 // Element label [Month:]
    max?: string;                   // Maximum accepted value [no limit]
    min?: string;                   // Minimum accepted value [no limit]
    name?: string;                  // Input control name [monthSelector]
    required?: boolean;             // Entry is required? [false]
    value?: string                  // Initially displayed value [""]
}

// Component Details ---------------------------------------------------------

const TextMonthSelector = (props: Props) => {

    const [name] = useState<string>(props.name ? props.name : "monthSelector");
    const [value, setValue] = useState<string>(props.value ? props.value : "");

    const onChange: OnChangeInput = (event) => {
        const newValue: string = event.target.value;
        setValue(newValue);
        console.info(`MonthSelector.onChange(${newValue})`);
    }

    const onKeyDown: OnKeyDown = (event) => {
        console.info(`TextMonthSelector.onKeyDown(${event.key}, ${value})`);
        if ((event.key === "Enter") || (event.key === "Tab")) {
            processValue(value);
        }
    }

    const processValue = (newValue: string): void => {

        console.info(`TextMonthSelector(${newValue})`);

        // Validate the response
        let newValid = validateMonth(newValue);
        if (props.required && (newValue === "")) {
            newValid = false;
        } else if (props.max && (newValue > props.max)) {
            newValid = false;
        } else if (props.min && (newValue < props.min)) {
            newValid = false;
        }

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
//            props.handleMonth(newValue);
        }

    }

    return (
        <Form inline id="TextMonthSelector">
            <Form.Label className="mr-2" htmlFor={name}>
                {props.label ? props.label : "Month:"}
            </Form.Label>
            <Form.Control
                autoFocus={props.autoFocus ? props.autoFocus : undefined}
                disabled={props.disabled ? props.disabled : undefined}
                htmlSize={7}
                id={name}
                max={props.max ? props.max : undefined}
                min={props.min ? props.min : undefined}
                onChange={onChange}
                onKeyDown={onKeyDown}
                size="sm"
                type="text"
                value={value}
            />
        </Form>
    )

}

export default TextMonthSelector;
