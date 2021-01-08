// MonthDropdown -------------------------------------------------------------

// Selector dropdown to choose a month (YYYY-MM string) for processing.

// External Modules ----------------------------------------------------------

import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import { HandleMonth, OnChangeSelect } from "./types";
import {incrementDate} from "../util/dates";
import {endDate, todayMonth} from "../util/months";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;            // Should element receive autoFocus? [false]
    disabled?: boolean;             // Should element be disabled? [false]
    handleMonth?: HandleMonth;      // Handle new month selection [no handler]
    label?: string;                 // Element label [Month:]
    max?: string;                   // Maximum accepted value [2024-12]
    min?: string;                   // Minimum accepted value [2020-01]
    name?: string;                  // Input control name [monthDropdown]
    required?: boolean;             // Entry is required? [false]
    value?: string                  // Initially displayed value [Current Month]
}

// Component Details ---------------------------------------------------------

const MonthDropdown = (props: Props) => {

    const [index, setIndex] = useState<number>(-1);
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        const thisMax: string = props.max ? props.max : "2022-12";
        const thisMin: string = props.min ? props.min : "2020-01";
        const thisMonth: string = props.value ? props.value : todayMonth();
        const values: string[] = [];
        let thisValue = thisMin;
        while (thisValue <= thisMax) {
            values.push(thisValue);
            if (thisValue === thisMonth) {
                setIndex(values.length - 1);
            }
            thisValue =
                incrementDate(endDate(thisValue), 1).substr(0, 7);
        }
        setOptions(values);
    }, [props.max, props.min, props.value]);

    const onChange: OnChangeSelect = (event) => {
        const newIndex = parseInt(event.target.value);
        console.info("MonthDropdown.onChange("
            + newIndex + ", "
            + options[newIndex]
            + ")");
        if (props.handleMonth) {
            props.handleMonth(options[newIndex]);
        }
    }

    return (
        <Form inline id="monthDropdown">
            <Form.Group>
                <Form.Label
                    className="mr-2"
                    htmlFor={props.name ? props.name : "monthDropdown"}
                >
                    {props.label ? props.label : "Month:"}
                </Form.Label>
                <Form.Control
                    as="select"
                    autoFocus={props.autoFocus ? props.autoFocus : undefined}
                    disabled={props.disabled ? props.disabled : undefined}
                    id={props.name ? props.name : "monthDropdown"}
                    onChange={onChange}
                    size="sm"
                    value={index}
                >
                    {options.map((option, index) => (
                        <option key={index} value={index}>
                            {option}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>
        </Form>
    )

}

export default MonthDropdown;
