// CheckinsUnassignedSubview -------------------------------------------------

// Second-level view of Checkins, for currently unassigned mats.  It offers
// a two-part sequence to assign a Guest to a Checkin for an existing mat:
// - Search for and select an existing Guest, or create and select a new one.
// - Assign the selected Guest to a previously selected unassigned Checkin.

// External Modules -----------------------------------------------------------

import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Import Modules ------------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import {
    HandleAssign, HandleCheckinOptional, HandleGuest,
    HandleGuestOptional, OnAction, OnClick
} from "../components/types";
import AssignForm from "../forms/AssignForm";
import GuestForm from "../forms/GuestForm";
import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import GuestsSubview from "../subviews/GuestsSubview";
import logger from "../util/client-logger";
import ReportError from "../util/ReportError";

// Incoming Properties -------------------------------------------------------

export interface Props {
    checkin: Checkin;               // The (unassigned) Checkin we are processing
    facility: Facility;             // Facility for which we are processing
                                    // or (facility.id < 0) if no Facility is current
    handleAssigned?: HandleCheckinOptional;
                                    // Handle (assign) when successfully completed
                                    // or null if no assignment was made
    onBack: OnAction;               // Handle back button click
}

// Component Details ---------------------------------------------------------

const CheckinsUnassignedSubview = (props: Props) => {

    const [adding, setAdding] = useState<boolean>(false);
    const [assigned, setAssigned] = useState<Assign | null>(null);
    const [guest, setGuest] = useState<Guest | null>(null);

    useEffect(() => {
    }, [adding, guest]);

    const configureAssign = (newGuest : Guest): Assign => {
        const assign: Assign = new Assign({
            comments: null,
            facilityId: props.facility.id,
            guestId: newGuest.id,
            id: props.checkin.id,
            paymentAmount: 5.00,
            paymentType: "$$",
            showerTime: null,
            wakeupTime: null
        });
        logger.debug({
            context: "CheckinsUnassignedSubview.configureAssign",
            assign: assign,
        });
        return assign;
    }

    const handleAddedGuest: HandleGuest = async (newGuest) => {
        try {
            const inserted: Guest
                = await FacilityClient.guestsInsert(props.facility.id, newGuest);
            logger.info({
                context: "CheckinsUnassignedSubview.handleAddedGuest",
                guest: {
                    id: inserted.id,
                    facilityId: inserted.facilityId,
                    firstName: inserted.firstName,
                    lastName: inserted.lastName,
                },
            });
            setAssigned(configureAssign(inserted));
            setGuest(inserted);
        } catch (error) {
            ReportError("CheckinssUnassignedSubview.handleAddedGuest", error);
            setAssigned(null);
            setGuest(null);
        }
    }

    const handleAssignedGuest: HandleAssign = async (newAssign) => {
        try {
            const assigned = await FacilityClient.assignsAssign
                (newAssign.facilityId, newAssign.id, newAssign);
            logger.info({
                context: "CheckinsUnassignedSubview.handleAssignedGuest",
                assign: assigned,
            });
            if (props.handleAssigned) {
                props.handleAssigned(assigned);
            }
        } catch (error) {
            ReportError("CheckinsUnassignedSubview.handleAssignedGuest", error);
            if (props.handleAssigned) {
                props.handleAssigned(null);
            }
        }
    }

    const handleSelectedGuest: HandleGuestOptional = (newGuest) => {
        if (newGuest) {
            logger.info({
                context: "CheckinsUnassignedSubview.handleSelectedGuest",
                guest: {
                    id: newGuest.id,
                    facilityId: newGuest.facilityId,
                    firstName: newGuest.firstName,
                    lastName: newGuest.lastName,
                },
            });
            setGuest(newGuest);
            setAssigned(configureAssign(newGuest));
        } else {
            logger.debug({
                context: "CheckinsUnassignedView.handleSelectedGuest",
                msg: "UNSELECTED",
            });
        }
    }

    const onAdd: OnClick = () => {
        setAdding(true);
    }

    const onBack: OnClick = () => {
        props.onBack();
    }

    return (

        <Container fluid id="CheckinsUnassignedSubview">

            {/* Overall Header and Back Link */}
            <Row className="mb-3">
                <Col className="col-11">
                    <Row className="justify-content-center">
                        <span>Mat Number:&nbsp;</span>
                        <span className="text-info">
                            {props.checkin.matNumberAndFeatures}
                        </span>
                        {(props.checkin.guest) ? (
                            <>
                                <span>&nbsp;&nbsp;&nbsp;Guest:&nbsp;</span>
                                <span className="text-info">
                                    {props.checkin.guest.firstName}&nbsp;
                                    {props.checkin.guest.lastName}
                                </span>
                            </>
                        ) : null }
                    </Row>
                </Col>
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

            <Row className="ml-1 mr-1 mb-3">

                {/* Step 1 ----------------------------------------------- */}
                <Col className="col-7 bg-light mb-1">

                    <h6 className="text-center">
                        Step 1: Select or Add A Guest To Assign
                    </h6>
                    <hr/>

                    {(adding) ? (
                        <>
                            <Row className="ml-1 mr-1 mb-3">
                                <Col className="text-left">
                                    <strong>
                                        Adding New Guest
                                    </strong>
                                </Col>
                            </Row>
                            <Row className="ml-1 mr-1">
                                <GuestForm
                                    autoFocus
                                    guest={new Guest({facilityId: -1, id: -1})}
                                    handleInsert={handleAddedGuest}
                                />
                            </Row>
                        </>
                    ) : (
                        <>
                            <GuestsSubview
                                handleSelect={handleSelectedGuest}
                            />
                            <Row className="ml-4 mb-3">
                                <Button
                                    onClick={onAdd}
                                    size="sm"
                                    variant="primary"
                                >
                                    Add
                                </Button>
                            </Row>
                        </>
                    )}

                </Col>

                {/* Step 2 ----------------------------------------------- */}
                <Col className="col-5 mb-1">
                    <h6 className={"text-center"}>
                        Step 2: Complete Assignment Details
                    </h6>
                    <hr/>
                    {(guest) ? (
                        <h6 className={"text-center"}>
                            Guest:&nbsp;&nbsp;
                            <span className="text-info">
                                {guest.firstName} {guest.lastName}
                            </span>
                        </h6>
                    ) : null }
                    {(assigned) ? (
                        <AssignForm
                            assign={assigned}
                            handleAssign={handleAssignedGuest}
                        />
                    ) : null }
                </Col>

            </Row>

            {/* Common Footer -------------------------------------------- */}
            <Row>
                <Col className="col-11">
                    <Row className="justify-content-center">
                        Click&nbsp;
                        <span className="text-secondary">
                            <strong>Back</strong></span>&nbsp;
                        to return to the the list with no changes.
                    </Row>
                </Col>
                <Col className="col-1"/>
            </Row>

        </Container>

    )

}

export default CheckinsUnassignedSubview;
