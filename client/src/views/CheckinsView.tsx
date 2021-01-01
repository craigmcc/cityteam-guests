// CheckinsView --------------------------------------------------------------

// Regular user view for managing Guest Checkins.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ---------------------------------------------------------

import DateSelector from "../components/DateSelector";
import {HandleCheckin, HandleCheckinOptional, HandleDate, Scopes} from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import CheckinsListSubview from "../subviews/CheckinsListSubview";
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
    const loginContext = useContext(LoginContext);

    const [assigned, setAssigned] = useState<Checkin | null>(null);
    const [canProcess, setCanProcess] = useState<boolean>(false);
    const [selected, setSelected] = useState<Checkin | null>(null);
    const [checkinDate, setCheckinDate] = useState<string>(todayDate());
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [stage, setStage] = useState<Stage>(Stage.None);

    useEffect(() => {

        // Establish the currently selected Facility
        let currentFacility: Facility;
        if (facilityContext.facility) {
            currentFacility = facilityContext.facility;
        } else {
            currentFacility = new Facility({ id: -1, name: "(Select Facility)"});
        }
        console.info("CheckinsView.setFacility("
            + JSON.stringify(currentFacility, Replacers.FACILITY)
            + ")");
        setFacility(currentFacility);

        // Record current permissions
        const isRegular = loginContext.validateScope(Scopes.REGULAR);
        setCanProcess(isRegular);

    }, [selected, facilityContext, loginContext, stage]);

    // Handle a Checkin for which assignment (or unassignment) has been completed
    const handleAssigned: HandleCheckin = (newAssigned) => {
        console.info("CheckinsView.handleAssigned("
            + JSON.stringify(newAssigned, Replacers.CHECKIN)
            + ")");
        setAssigned(newAssigned);
        // TODO - handleAssigned() processing (if any)
        handleStage(Stage.List);
    }

    const handleCheckinDate: HandleDate = (newCheckinDate) => {
        console.info(`CheckinsView.handleCheckinDate(${newCheckinDate})`);
        setCheckinDate(newCheckinDate);
        handleStage(Stage.List);
    }

    // Handle a Checkin for which assignment, editing, or deassignment is to be done
    // or null if a previously selected Checkin is unselected
    const handleSelected: HandleCheckinOptional = (newSelected) => {
        console.info("CheckinsView.handleSelected("
            + JSON.stringify(newSelected, Replacers.CHECKIN)
            + ")");
        if (canProcess) {
            setSelected(newSelected);
            if (newSelected) {
                handleStage(newSelected.guestId ? Stage.Assigned : Stage.Unassigned);
            }
        }
    }

    const handleStage = (newStage : Stage): void => {
        console.info(`CheckinsView.handleStage(${newStage})`);
        setStage(newStage);
    }

    return (

        <>

            <Container fluid id="CheckinsView">

                {/* Checkin Date Selector (always visible) */}
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

                {/* Selected Subview (by stage) */}
                {(stage === Stage.Assigned) ? (
                    <p>CheckinsAssignedSubview goes here</p>
                ) : null}
                {(stage === Stage.List) ? (
                    <CheckinsListSubview
                        checkinDate={checkinDate}
                        facility={facility}
                        handleSelected={handleSelected}
                    />
                ) : null}
                {(stage === Stage.Unassigned) ? (
                    <p>CheckinsUnassignedSubview goes here</p>
                ) : null}

            </Container>

        </>

    )

}

export default CheckinView;