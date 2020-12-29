// CheckinViewUnassigned -----------------------------------------------------

// Second-level view of Checkins, for currently unassigned mats.  It offers
// a two-part sequence to assign a Guest to a Checkin for an existing mat:
// - Search for and select an existing Guest, or create and select a new one.
// - Assign the selected Guest to a previously selected unassigned Checkin.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import { Stage } from "./CheckinView";
import FacilityClient from "../clients/FacilityClient";
import AssignForm from "../forms/AssignForm";
import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import GuestsSubview from "../subviews/GuestsSubview";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";
import {OnClick} from "../components/types";

// Incoming Properties -------------------------------------------------------

export type HandleAssign = (assign: Assign) => void;
export type HandleStage = (stage: Stage) => void;

export interface Props {
    checkin: Checkin;               // The (unassigned) Checkin we are processing
    facility: Facility;             // Facility for which we are processing checkins,
                                    // or (facility.id < 0) if no Facility is current
    handleAssign: HandleAssign;     // Handle (assign) when successfully completed
    handleStage: HandleStage;       // Handle (stage) when changing
}

// Component Details ---------------------------------------------------------

const CheckinViewUnassigned = (props: Props) => {

    useEffect(() => {
        console.info("CheckinViewUnassigned.useEffect()");
    });

    const onBack: OnClick = () => {
        props.handleStage(Stage.None);
    }

    return (

        <Container fluid id="CheckinViewUnassigned">

            {/* Back Link */}
            <Row className="ml-1 mr-1 mb-3">
                <Col className="text-right">
                    <Button
                        onClick={onBack}
                        size="sm"
                        type="button"
                        variant="secondary"
                    >
                        Back
                    </Button>
                </Col>
            </Row>

            {/* TODO - parts 1 and 2 */}

        </Container>

    )

}

export default CheckinViewUnassigned;
