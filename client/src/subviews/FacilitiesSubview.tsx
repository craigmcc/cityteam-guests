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
import {HandleIndex, HandleFacilityOptional, Scopes} from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Facility from "../models/Facility";
import * as Abridgers from "../util/abridgers";
import logger from "../util/client-logger";

// Incoming Properties -------------------------------------------------------

export interface Props {
    handleSelect: HandleFacilityOptional;
                                    // Return selected (Facility) for processing,
                                    // or null if previous selection was unselected
    title?: string;                 // Table title [Facilities]
}

// Component Details ---------------------------------------------------------

const FacilitiesSubview = (props : Props) => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [index, setIndex] = useState<number>(-1);

    useEffect(() => {

        const fetchFacilities = async () => {

            // For a superuser, select all Facilities (including inactive)
            // Otherwise, just copy the active ones that are visible to the
            // current user.
            const isSuperuser = loginContext.validateScope(Scopes.SUPERUSER);
            let newFacilities: Facility[] = [];
            if (loginContext.loggedIn) {
                if (isSuperuser) {
                    newFacilities = await FacilityClient.all();
                } else {
                    facilityContext.facilities.forEach(contextFacility => {
                        newFacilities.push(contextFacility);
                    });
                }
            }
            setFacilities(newFacilities);
            logger.info({
                context: "FacilitiesSubview.fetchFacilities",
                isSuperuser: isSuperuser,
                count: newFacilities.length,
            });

        }

        fetchFacilities();

    }, [facilityContext.facilities, loginContext]);

    const handleIndex: HandleIndex = (newIndex) => {
        if (newIndex === index) {
            setIndex(-1);
            logger.trace({ context: "FacilitiesSubview.handleIndex", msg: "UNSET" });
            if (props.handleSelect) {
                props.handleSelect(null);
            }
        } else {
            const newFacility = facilities[newIndex];
            setIndex(newIndex);
            logger.debug({
                context: "FacilitiesSubview.handleIndex",
                index: newIndex,
                facility: Abridgers.FACILITY(newFacility),
            });
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
