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
import * as Replacers from "../util/replacers";
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
        console.info("CheckinsUnassignedSubview.useEffect()");
    }, [adding, guest]);

    const configureAssign = (newGuest : Guest): Assign => {
        const newAssign: Assign = new Assign({
            comments: null,
            facilityId: props.facility.id,
            guestId: newGuest.id,
            id: props.checkin.id,
            paymentAmount: 5.00,
            paymentType: "$$",
            showerTime: null,
            wakeupTime: null
        });
        console.info("CheckinsUnassignedSubview.configureAssign("
            + JSON.stringify(newAssign, Replacers.ASSIGN)
            + ")");
        return newAssign;
    }

    const handleAddedGuest: HandleGuest = async (newGuest) => {
        try {
            const inserted: Guest
                = await FacilityClient.guestsInsert(props.facility.id, newGuest);
            console.info("CheckinsUnassignedSubview.handleAddedGuest("
                + JSON.stringify(inserted, Replacers.GUEST)
                + ")");
            setAssigned(configureAssign(inserted));
            setGuest(inserted);
        } catch (error) {
            ReportError("GuestsUnassignedSubview.handleAddedGuest", error);
            setAssigned(null);
            setGuest(null);
        }
    }

    const handleAssignedGuest: HandleAssign = async (newAssign) => {
        try {
            console.info("CheckinsUnassignedSubview.handleAssignedGuest.sending("
                + JSON.stringify(newAssign)
                + ")");
            const assigned = await FacilityClient.assignsAssign
                (newAssign.facilityId, newAssign.id, newAssign);
            console.info("CheckinsUnassignedSubview.handleAssignedGuest("
                + JSON.stringify(assigned, Replacers.CHECKIN)
                + ")");
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
            console.info("CheckinsUnassignedSubview.handleSelectedGuest("
                + JSON.stringify(newGuest, Replacers.GUEST)
                + ")");
            setGuest(newGuest);
            setAssigned(configureAssign(newGuest));
        } else {
            console.info("CheckinViewUnassigned.handleSelectedGuest(UNSELECTED)");
        }
    }

    const onAdd: OnClick = () => {
        console.info("CheckinsUnassignedSubview.onAdd()");
        setAdding(true);
    }

    const onBack: OnClick = () => {
        console.info("CheckinsUnassignedSubview.onBack()");
        props.onBack();
    }

    return (

        <Container fluid id="CheckinsUnassignedSubview">

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
                <Col className="col-5 mt-1 mb-1">

                    <h6 className={"text-center"}>
                        Step 2: Complete Assignment Details
                    </h6>
                    {(guest) ? (
                        <h6 className={"text-center"}>
                            {/* TODO - flattened checkins */}
                            Mat: {props.checkin.matNumber}
                            {props.checkin.features ? props.checkin.features : null}
                            &nbsp;&nbsp;&nbsp;
                            Guest:  {guest.firstName} {guest.lastName}
                        </h6>
                    ) : null }
                    <hr/>

                    {(assigned) ? (
                        <AssignForm
                            assign={assigned}
                            handleAssign={handleAssignedGuest}
                        />
                    ) : null }

                </Col>


            </Row>


        </Container>

    )

}

export default CheckinsUnassignedSubview;
