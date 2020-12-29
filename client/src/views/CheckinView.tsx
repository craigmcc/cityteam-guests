// CheckinView ---------------------------------------------------------------

// Regular user view for managing Guest Checkins.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ---------------------------------------------------------

import CheckinViewList, { HandleSelectedCheckin } from "./CheckinViewList";
import CheckinViewUnassigned, {HandleAssign} from "./CheckinViewUnassigned";
import DateSelector from "../components/DateSelector";
import FacilityContext from "../contexts/FacilityContext";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import { todayDate } from "../util/dates";
import * as Replacers from "../util/replacers";

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
            : new Facility({id: -1, name: "(Select)"});
        console.info("CheckinView.setFacility("
            + JSON.stringify(newFacility, Replacers.FACILITY)
            + ")");
        setFacility(newFacility);

    }, [facilityContext, stage]);

    const handleAssign: HandleAssign
        = (newAssign) => {
        console.info("CheckinViewUnassigned.handleAssign("
            + JSON.stringify(newAssign, Replacers.ASSIGN)
            + ")");
        // TODO - handleAssign
        setStage(Stage.List);
    }

    const handleCheckinDate = (newCheckinDate: string): void => {
        console.info(`CheckinViewUnassigned.handleCheckinDate(${newCheckinDate})`);
        setCheckinDate(newCheckinDate);
        handleStage(Stage.List);
    }

    const handleSelectedCheckin: HandleSelectedCheckin
        = (newCheckin): void =>
    {
        if (newCheckin) {
            console.info("CheckinView.handleSelectedCheckin("
                + JSON.stringify(newCheckin, Replacers.CHECKIN)
                + ")");
            setCheckin(newCheckin);
            handleStage(newCheckin.guestId ? Stage.Assigned : Stage.Unassigned);
        } else {
            console.info("CheckinViewUnassigned.handleSelectedCheckin(unselected)");
        }
        setCheckin(newCheckin);
    }

    const handleStage = (newStage: Stage): void => {
        console.info(`CheckinViewUnassigned.handleStage(${newStage})`);
        setStage(newStage);
    }

    return (

        <>

            {/* Top View (always visible) */}
            <Container fluid id="CheckinView">
                <Row className="mt-3 mb-3 ml-1 mr-1">
                    <Col className="col-9">
                        <strong>
                            Checkins for {facility.name}
                        </strong>
                    </Col>
                    <Col className="col-3">
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

            {/* Selected Subview */}
            {(stage === Stage.List) ? (
                <CheckinViewList
                    checkinDate={checkinDate}
                    facility={facility}
                    handleSelectedCheckin={handleSelectedCheckin}
                    handleStage={handleStage}
                />
            ) : null}
            {(stage === Stage.Unassigned) && (checkin) ? (
                <CheckinViewUnassigned
                    checkin={checkin}
                    facility={facility}
                    handleAssign={handleAssign}
                    handleStage={handleStage}
                />
            ) : null}

        </>

    )

}

export default CheckinView;
