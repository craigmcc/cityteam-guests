// FacilitiesSubview ---------------------------------------------------------

// Render a list of Facilities, with a callback to handleSelect(facility) when
// a particular Facility is selected, or handleSelect(null) if a previously
// selected Facility is unselected.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import { HandleIndex, HandleFacilityOptional } from "../components/types";
import LoginContext from "../contexts/LoginContext";
import Facility from "../models/Facility";
import * as Replacers from "../util/replacers";

// Incoming Properties -------------------------------------------------------

export interface Props {
    handleSelect: HandleFacilityOptional;
                                    // Return selected (Facility) for processing,
                                    // or null if previous selection was unselected
    title?: string;                 // Table title [Facilities]
}

// Component Details ---------------------------------------------------------

const FacilitiesSubview = (props : Props) => {

    const loginContext = useContext(LoginContext);

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [index, setIndex] = useState<number>(-1);

    useEffect(() => {

        const fetchFacilities = async () => {

            // Fetch the Facilities visible to this user (if any)
            const newFacilities: Facility[] = [];
            if (loginContext.loggedIn) {
                const allFacilities: Facility[]
                    = await FacilityClient.all();
                allFacilities.forEach(allFacility => {
                    if (loginContext.validateScope(allFacility.scope)) {
                        newFacilities.push(allFacility);
                    }
                });
                console.info("FacilitiesSubview.fetchFacilities("
                    + JSON.stringify(newFacilities, Replacers.FACILITY)
                    + ")");
                setFacilities(newFacilities);
            } else {
                console.info("FacilitiesSubview.fetchFacilities(SKIPPED)");
                setFacilities([]);
            }

        }

        fetchFacilities();

    }, [loginContext]);

    const handleIndex: HandleIndex = (newIndex) => {
        if (newIndex === index) {
            console.info("FacilitiesSubview.handleIndex(UNSET)");
            setIndex(-1);
            if (props.handleSelect) {
                props.handleSelect(null);
            }
        } else {
            const newFacility = facilities[newIndex];
            console.info("TemplatesSubview.handleIndex("
                + newIndex + ", "
                + JSON.stringify(newFacility, Replacers.FACILITY)
                + ")");
            setIndex(newIndex);
            if (props.handleSelect) {
                props.handleSelect(newFacility);
            }
        }
    }

    const listFields = [
        "name",
        "active",
        "city",
        "state",
        "zipCode",
        "email",
        "phone",
        "scope",
    ]

    const listHeaders = [
        "Name",
        "Active",
        "City",
        "State",
        "Zip Code",
        "Email Address",
        "Phone Number",
        "Scope"
    ];

    return (

        <Container fluid id="FacilitiesSubview">
            <Row>
                <SimpleList
                    handleIndex={handleIndex}
                    items={facilities}
                    listFields={listFields}
                    listHeaders={listHeaders}
                    title={props.title ? props.title : "Facilities"}
                />
            </Row>
        </Container>

    )

}

export default FacilitiesSubview;
