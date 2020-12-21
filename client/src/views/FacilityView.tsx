// FacilityView --------------------------------------------------------------

// Administrator view for editing Facility objects.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import FacilityContext, { FacilityContextData } from "../contexts/FacilityContext";
import Facility from "../models/Facility";
import * as Replacers from "../util/Replacers";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const FacilityView = () => {

    const facilityContext: FacilityContextData = useContext(FacilityContext);

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [facility, setFacility] = useState<Facility | null>(null);
    const [index, setIndex] = useState<number>(-1);
    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {

        const fetchData = () => {
            let newFacilities: Facility[] = [];
            facilityContext.facilities.forEach((oldFacility) => {
                newFacilities.push(oldFacility);
            });
            console.info("FacilityView.fetchData("
                + JSON.stringify(newFacilities, Replacers.FACILITY)
                + ")");
            setFacilities(newFacilities);
        }

        fetchData();
        setRefresh(false); // TODO - needed?

    }, [facilityContext /*, refresh */]); // Updating facilityContext should trigger

    return (
        <>
            <Container fluid id="FacilityView">


            </Container>

        </>
    )

}

export default FacilityView;
