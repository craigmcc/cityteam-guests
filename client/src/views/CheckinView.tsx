// CheckinView ---------------------------------------------------------------

// Regular user view for managing Guest checkins.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ---------------------------------------------------------

import DateSelector from "../components/DateSelector";
import FacilityContext from "../contexts/FacilityContext";
import Checkin from "../models/Checkin";
import { todayDate } from "../util/dates";
import * as Replacers from "../util/replacers";
import Facility from "../models/Facility";

export enum Stage {
    None = "None",
    List = "List",
    Assigned = "Assigned",
    Unassigned = "Unassigned",
}

// Component Details --------------------------------------------------------

const CheckinView = () => {

    const facilityContext = useContext(FacilityContext);

    const [checkin, setCheckin] = useState<Checkin | null>(null);
    const [checkinDate, setCheckinDate] = useState<string>(todayDate());
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [stage, setStage] = useState<Stage>(Stage.None);

    useEffect(() => {

        const newFacility = (facilityContext.index >= 0)
            ? facilityContext.facilities[facilityContext.index]
            : new Facility({name: "(Select)"});
        console.info("CheckinView.setFacility("
            + JSON.stringify(newFacility, Replacers.FACILITY)
            + ")");
        setFacility(newFacility);

    }, [facilityContext])

    const handleCheckin = (newCheckin: Checkin): void => {
        console.info("CheckinView.handleCheckin("
            + JSON.stringify(newCheckin, Replacers.CHECKIN)
            + ")");
        setStage(newCheckin.guestId ? Stage.Assigned : Stage.Unassigned);
    }

    const handleCheckinDate = (newCheckinDate: string): void => {
        console.info(`CheckinView.handleCheckinDate(${newCheckinDate})`);
        setCheckinDate(newCheckinDate);
        setStage(Stage.List);
    }

    const handleStage = (newStage: Stage): void => {
        console.info(`CheckinView.handleStage(${newStage}`);
        setStage(newStage);
    }

    return (

        <>

            {/* Top View (always visible) */}
            <Container fluid id="CheckinView">
                <Row className="mt-3 mb-3 ml-1 mr-1">
                    <Col className="col-8">
                        <strong>
                            Checkins for {facility.name}
                        </strong>
                    </Col>
                    <Col className="col-4">
                        <DateSelector
                            autoFocus
                            handleDate={handleCheckinDate}
                            label="Checkin Date:"
                            required
                            value={checkinDate}
                        />
                    </Col>
                </Row>
            </Container>

        </>

    )

}

export default CheckinView;
