// CheckinsView --------------------------------------------------------------

// Regular user view for managing Guest Checkins.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ---------------------------------------------------------

import DateSelector from "../components/DateSelector";
import { HandleCheckinOptional, HandleDate, Scopes } from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import CheckinsAssignedSubview from "../subviews/CheckinsAssignedSubview";
import CheckinsListSubview from "../subviews/CheckinsListSubview";
import CheckinsUnassignedSubview from "../subviews/CheckinsUnassignedSubview";
import { todayDate } from "../util/dates";
import * as Replacers from "../util/replacers";

enum Stage {
    None = "None",
    List = "List",
    Assigned = "Assigned",
    Unassigned = "Unassigned",
}

// Component Details --------------------------------------------------------

const CheckinView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

//    const [assigned, setAssigned] = useState<Checkin | null>(null);
    const [canProcess, setCanProcess] = useState<boolean>(false);
    const [checkinDate, setCheckinDate] = useState<string>(todayDate());
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [selected, setSelected] = useState<Checkin | null>(null);
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
    // (null means some error prevented the assignment)
    const handleAssigned: HandleCheckinOptional = (newAssigned) => {
        if (newAssigned) {
            console.info("CheckinsView.handleAssigned("
                + JSON.stringify(newAssigned, Replacers.CHECKIN)
                + ")");
        } else {
            console.info("CheckinsView.handleAssigned(SKIPPED)");
        }
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
        if (newSelected) {
            console.info("CheckinsView.handleSelected("
                + JSON.stringify(newSelected, Replacers.CHECKIN)
                + ")");
            if (canProcess) {
                setSelected(newSelected);
                handleStage
                    (newSelected.guestId ? Stage.Assigned : Stage.Unassigned);
            }
        } else {
            console.info("CheckinsView.handleSelected(UNSELECTED)");
        }
    }

    const handleStage = (newStage : Stage): void => {
        console.info(`CheckinsView.handleStage(${newStage})`);
        setStage(newStage);
    }

    const onBack = () => {
        console.info("CheckinsView.onBack()");
        setStage(Stage.List);
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
                    <CheckinsAssignedSubview
                        checkin={selected ? selected : new Checkin()}
                        checkinDate={checkinDate}
                        facility={facility}
                        onBack={onBack}
                    />
                ) : null}
                {(stage === Stage.List) ? (
                    <CheckinsListSubview
                        checkinDate={checkinDate}
                        facility={facility}
                        handleSelected={handleSelected}
                    />
                ) : null}
                {(stage === Stage.Unassigned) ? (
                    <CheckinsUnassignedSubview
                        checkin={selected ? selected : new Checkin()}
                        facility={facility}
                        handleAssigned={handleAssigned}
                        onBack={onBack}
                    />
                ) : null}

            </Container>

        </>

    )

}

export default CheckinView;
