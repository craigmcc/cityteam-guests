// CheckinSelector -----------------------------------------------------------

// Selector drop-down to choose which Checkin the user wants to interact with.

// External Modules ----------------------------------------------------------

import React, { useState } from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import { HandleCheckin, OnChangeSelect } from "./types";
import Checkin from "../models/Checkin";

// Incoming Properties -------------------------------------------------------

export interface Props {
    all?: boolean;                  // Select all (vs. active) checkins? [false]
    autoFocus?: boolean;            // Should element receive autoFocus? [false]
    checkins: Checkin[];            // Checkins from which to select
    disabled?: boolean;             // Should element be disabled? [false]
    handleCheckin?: HandleCheckin;  // Handle (checkin) selection [no handler]
    label?: string;                 // Element label [Checkin:]
}

// Component Details ---------------------------------------------------------

const CheckinSelector = (props: Props) => {

    const [index, setIndex] = useState<number>(-1);

    const onChange: OnChangeSelect = (event) => {
        const newIndex: number = parseInt(event.target.value);
        const newCheckin: Checkin = (newIndex >= 0)
            ? props.checkins[newIndex]
            : new Checkin({ active: false, id: -1, name: "Unselected" });
        setIndex(newIndex);
        if ((newIndex >= 0) && props.handleCheckin) {
            props.handleCheckin(newCheckin);
        }
    }

    return (

        <>
            <Form inline>
                <Form.Group>
                    <Form.Label  className="mr-2" htmlFor="checkinSelector">
                        {props.label ? props.label : "Checkin:"}
                    </Form.Label>
                    <Form.Control
                        as="select"
                        autoFocus={props.autoFocus ? props.autoFocus : undefined}
                        disabled={props.disabled ? props.disabled : undefined}
                        id="checkinSelector"
                        onChange={onChange}
                        size="sm"
                        value={index}
                    >
                        <option key="-1" value="-1">(Select)</option>
                        {props.checkins.map((checkin, index) => (
                            <option key={index} value={index}>
                                {checkin.matNumber}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
            </Form>
        </>

    )

}

export default CheckinSelector;
