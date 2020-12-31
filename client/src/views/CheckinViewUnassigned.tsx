// CheckinViewUnassigned -----------------------------------------------------

// Second-level view of Checkins, for currently unassigned mats.  It offers
// a two-part sequence to assign a Guest to a Checkin for an existing mat:
// - Search for and select an existing Guest, or create and select a new one.
// - Assign the selected Guest to a previously selected unassigned Checkin.

// External Modules ----------------------------------------------------------

import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import { Stage } from "./CheckinView";
import FacilityClient from "../clients/FacilityClient";
import {HandleGuestOptional, OnClick} from "../components/types";
import AssignForm from "../forms/AssignForm";
import GuestForm from "../forms/GuestForm";
import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import GuestsSubview from "../subviews/GuestsSubview";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Incoming Properties -------------------------------------------------------

export type HandleAssign = (assign: Assign) => void;
export type HandleAssigned = (checkin: Checkin) => void;
export type HandleStage = (stage: Stage) => void;

export interface Props {
    checkin: Checkin;               // The (unassigned) Checkin we are processing
    facility: Facility;             // Facility for which we are processing checkins,
                                    // or (facility.id < 0) if no Facility is current
    handleAssigned: HandleAssigned; // Handle (assign) when successfully completed
    handleStage: HandleStage;       // Handle (stage) when changing
}

// Component Details ---------------------------------------------------------

const CheckinViewUnassigned = (props: Props) => {

    const [adding, setAdding] = useState<boolean>(false);
    const [assign, setAssign] = useState<Assign | null>(null);
    const [guest, setGuest] = useState<Guest | null>(null);

    useEffect(() => {
        console.info("CheckinViewUnassigned.useEffect()");
    }, [adding, guest]);

    const configureAssign = (newGuest : Guest): void => {
        const newAssign: Assign = new Assign({
            comments: null,
            facilityId: props.facility.id,
            guestId: newGuest.id,
            id: props.checkin.id,
            paymentAmount: "5.00",
            paymentType: "$$",
            showerTime: null,
            wakeupTime: null
        });
        console.info("CheckinViewUnassigned.configureAssign("
            + JSON.stringify(newAssign, Replacers.ASSIGN)
            + ")");
        setAssign(newAssign);
    }

    const emptyGuest: Guest = new Guest({
        facilityId: -1,
        id: -1,
    })

    const handleAddedGuest: HandleGuestOptional = async (newGuest) => {
        if (newGuest) {
            try {
                const inserted: Guest
                    = await FacilityClient.guestsInsert(props.facility.id, newGuest);
                console.info("CheckinViewUnassigned.handleAddedGuest("
                    + JSON.stringify(inserted, Replacers.GUEST)
                    + ")");
                setGuest(inserted);
                configureAssign(newGuest);
            } catch (error) {
                ReportError("GuestsView.handleInsert", error);
                setGuest(null);
            }
            setGuest(newGuest);
        } else {
            console.info("CheckinViewUnassigned.handleAddGuest(unselected)");
        }
    }

    const handleAssignedGuest: HandleAssign
        = async (newAssign) =>
    {
        try {
            console.info("CheckinViewUnassigned.handleAssignedGuest.send("
                + JSON.stringify(newAssign/*, Replacers.ASSIGN*/)
                + ")");
            const assigned = await FacilityClient.assignsAssign
                (newAssign.facilityId, newAssign.id, newAssign);
            console.info("CheckinViewUnassigned.handleAssignedGuest.result("
                + JSON.stringify(assigned/*, Replacers.CHECKIN*/)
                + ")");
            props.handleAssigned(assigned);
            props.handleStage(Stage.List);
        } catch (error) {
            ReportError("CheckinViewUnassigned.handleAssignedGuest", error);
        }
    }

    const handleSelectedGuest: HandleGuestOptional = (newGuest) => {
        if (newGuest) {
            console.info("CheckinViewUnassigned.handleSelectedGuest("
                + JSON.stringify(newGuest, Replacers.GUEST)
                + ")");
            setGuest(newGuest);
            configureAssign(newGuest);
        } else {
            console.info("CheckinViewUnassigned.handleSelectedGuest(unselected)");
        }
    }

    const onAdd: OnClick = () => {
        console.info("CheckViewUnassigned.onAdd()");
        setAdding(true);
    }

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

            <Row className="ml-1 mr-1 mb-3">

                {/* Step 1 ----------------------------------------------- */}
                <Col className="col-7 bg-light mt-1 mb-1">

                    <h6 className={"text-center"}>
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

                            <Row className="ml-1 mr-1">
                                <GuestForm
                                    autoFocus
                                    guest={emptyGuest}
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
                <Col className="col-5 mt-1 mb-1">

                    <h6 className={"text-center"}>
                        Step 2: Complete Assignment Details
                    </h6>
                    {(guest) ? (
                        <h6 className={"text-center"}>
                            {/*// TODO - flattened checkin*/}
                            Mat: {props.checkin.matNumber}
                            &nbsp;&nbsp;&nbsp;
                            Guest:  {guest.firstName} {guest.lastName}
                        </h6>
                    ) : null }
                    <hr/>

                    {(assign) ? (
                        <AssignForm
                            assign={assign}
                            handleAssign={handleAssignedGuest}
                        />
                    ) : null }

                </Col>


            </Row>


        </Container>

    )

}

export default CheckinViewUnassigned;
