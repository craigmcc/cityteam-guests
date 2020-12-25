// SearchBar -----------------------------------------------------------------

// General purpose search bar, with optional decorations.

// External Modules ----------------------------------------------------------

import React, { useState } from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import { OnChangeInput, OnKeyDown } from "./types";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;            // Should element receive autoFocus? [false]
    disabled?: boolean;             // Should element be disabled? [false]
    handleChange?: HandleValue;     // Handle (value) on each change [no handler]
    handleValue?: HandleValue;      // Handle (value) on enter [no handler]
    htmlSize?: number;              // Number of characters to show [not rendered]
    initialValue?: string;          // Initial value to display [""]
    label?: string;                 // Element label [none]
    placeholder?: string;           // Placeholder text [none]
}

export type HandleValue = (value: string) => void;

// Component Details ---------------------------------------------------------

const SearchBar = (props: Props) => {

    const [currentValue, setCurrentValue]
        = useState<string>(props.initialValue ? props.initialValue : "");

    const onChange: OnChangeInput = (event): void => {
        const newValue: string = event.target.value;
        setCurrentValue(newValue);
        if (props.handleChange) {
            props.handleChange(newValue);
        }
    }

    const onKeyDown: OnKeyDown = (event): void => {
        if (event.key === "Enter" && props.handleValue) {
            props.handleValue(currentValue);
        }
    }

    return (
        <Form inline>
            <Form.Label className="mr-1" htmlFor="searchBar">
                {props.label ? props.label : undefined}
            </Form.Label>
            <Form.Control
                autoFocus={props.autoFocus ? props.autoFocus : undefined}
                disabled={props.disabled ? props.disabled : undefined}
                htmlSize={props.htmlSize ? props.htmlSize : 50}
                id="searchBar"
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={props.placeholder ? props.placeholder : undefined}
                value={currentValue}
            />
        </Form>
    )

}

export default SearchBar;
