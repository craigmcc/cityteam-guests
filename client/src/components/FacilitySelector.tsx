// FacilitySelector ----------------------------------------------------------

// Selector drop-down to choose which Facility the user wants to interact with.
// The options are populated from FacilityContext, and the currently selected
// one is stored there when it changes.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect } from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import { HandleFacility, OnChangeSelect } from "./types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Facility from "../models/Facility";
import * as Replacers from "../util/replacers";

// Incoming Properties -------------------------------------------------------

export interface Props {
    autoFocus?: boolean;            // Should element receive autoFocus? [false]
    disabled?: boolean;             // Should element be disabled? [false]
    handleFacility?: HandleFacility;// Handle (facility) selection [No handler]
    label?: string;                 // Element label [Facility:]
}

// Component Details ---------------------------------------------------------

export const FacilitySelector = (props: Props) => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    useEffect(() => {
        // TODO - just want to cause a re-render on any change in either context
    }, [facilityContext, loginContext]);

    const onChange: OnChangeSelect = (event) => {
        const newIndex: number = parseInt(event.target.value);
        const newFacility: Facility = (newIndex > 0)
            ? facilityContext.facilities[newIndex]
            : { active: false, id: -1, name: "Unselected", scope: "unselected" };
        console.info("FacilitySelector.onChange("
            + newIndex + ", "
            + JSON.stringify(newFacility, Replacers.FACILITY)
            + ")");
        facilityContext.setIndex(newIndex);
        if ((newIndex >= 0) && props.handleFacility) {
            props.handleFacility(newFacility);
        }
    }

    return (

        <>
            <Form inline>
                <Form.Label  className="mr-2" htmlFor="facilitySelector">
                    {props.label ? props.label : "Facility:"}
                </Form.Label>
                <Form.Control
                    as="select"
                    autoFocus={props.autoFocus ? props.autoFocus : undefined}
                    disabled={props.disabled ? props.disabled : undefined}
                    id="facilitySelector"
                    onChange={onChange}
                    size="sm"
                    value={facilityContext.index}
                >
                    <option key="-1" value="-1">(Select)</option>
                    {facilityContext.facilities.map((facility, index) => (
                        <option key={index} value={index}>
                            {facility.name}
                        </option>
                    ))}
                </Form.Control>
            </Form>
        </>

    )

}

export default FacilitySelector;
