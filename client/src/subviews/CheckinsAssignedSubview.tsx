// CheckinsAssignedSubview ---------------------------------------------------

// Second-level view of Checkins, for currently assigned mats.  It offers
// three options to manage an existing assignment of a Guest to a mat:
// - Edit the assignment details.
// - Move the assignment to a different available mat on the same date.
// - Remove the assignment, making this mat available again.

// External Modules ----------------------------------------------------------

import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

// Import Modules ------------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import {
    HandleAssign, HandleCheckin, OnAction, OnClick
} from "../components/types";
import AssignForm from "../forms/AssignForm";
import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";
import CheckinSelector from "../components/CheckinSelector";

// Incoming Properties -------------------------------------------------------

export interface Props {
    checkin: Checkin;               // The (assigned) Checkin we are processing
    checkinDate: string;            // The checkin date we are processing
    facility: Facility;             // Facility for which we are processing
                                    // (or (facility.id < 0) if no Facility is current
    onBack: OnAction;               // Handle back button click
}

// Component Details ---------------------------------------------------------

const CheckinsAssignedSubview = (props: Props) => {

    // General Support -------------------------------------------------------

    const [availables, setAvailables] = useState<Checkin[]>([]);

    useEffect(() => {

        const fetchAvailables = async () => {
            try {
                const newAvailables: Checkin[] =
                    await FacilityClient.checkinsAvailable
                        (props.facility.id, props.checkinDate);
                console.info("CheckinsAssignedSubview.fetchAvailables("
                    + JSON.stringify(newAvailables, Replacers.CHECKIN)
                    + ")");
                setAvailables(newAvailables);
            } catch (error) {
                ReportError("CheckinsAssignedSubview.fetchAvailables", error);
                setAvailables([]);
            }
        }

        fetchAvailables();

    }, [props.checkinDate, props.facility.id]);

    const onBack: OnClick = () => {
        console.info("CheckinsAssignedSubview.onBack()");
        props.onBack();
    }

    // For Option 1 ----------------------------------------------------------

    const configureAssign = (checkin: Checkin): Assign => {
        const assign: Assign = new Assign({
            comments: checkin.comments,
            facilityId: checkin.facilityId,
            guestId: checkin.guestId,
            id: checkin.id,
            paymentAmount: checkin.paymentAmount,
            paymentType: checkin.paymentType,
            showerTime: checkin.showerTime,
            wakeupTime: checkin.wakeupTime,
        });
        return assign;
    }

    const handleAssign: HandleAssign = async (assign) => {
        console.info("CheckinsAssignedSubview.handleAssign.sending("
            + JSON.stringify(assign)
            + ")");
        const assigned = await FacilityClient.assignsAssign
            (assign.facilityId, assign.id, assign);
        console.info("CheckinsAssignedSubview.handleAssign.receiving("
            + JSON.stringify(assigned)
            + ")");
        props.onBack();
        try {
        } catch (error) {
            ReportError("CheckinsAssignedSubview.handleAssign", error);
        }
    }

    // For Option 2 ----------------------------------------------------------

    const [destination, setDestination]
        = useState<Checkin>(new Checkin({ id: -1 }));

    const handleDestination: HandleCheckin = (newDestination) => {
        console.info("CheckinsAssignedSubview.handleDestination("
            + JSON.stringify(newDestination, Replacers.CHECKIN)
            + ")");
        setDestination(newDestination);
    }

    const onMove: OnAction = async () => {
        console.info("CheckinsAssignedSubview.onMove("
            + JSON.stringify(destination, Replacers.CHECKIN)
            + ")");
        if (destination.id >= 0) {
            try {
                await FacilityClient.assignsReassign
                    (props.checkin.facilityId, props.checkin.id, destination.id);
                props.onBack();
            } catch (error) {
                ReportError("CheckinsAssignedSubview.onMove", error);
            }
        }
    }

    // For Option 3 ----------------------------------------------------------

    const [showDeassignConfirm, setShowDeassignConfirm] = useState<boolean>(false);

    const onDeassignConfirm: OnClick = () => {
        console.info("CheckinsAssignedSubview.onDeassignConfirm()");
        setShowDeassignConfirm(true);
    }

    const onDeassignConfirmNegative: OnClick = () => {
        console.info("CheckinsAssignedSubview.onDeassignConfirmNegative()");
        setShowDeassignConfirm(false);
    }

    const onDeassignConfirmPositive: OnClick = async () => {
        console.info("CheckinsAssignedSubview.onDeassignConfirmPositive("
            + JSON.stringify(props.checkin, Replacers.CHECKIN)
            + ")");
        try {
            await FacilityClient.assignsDeassign
                (props.checkin.facilityId, props.checkin.id);
            setShowDeassignConfirm(false);
            props.onBack();
        } catch (error) {
            ReportError("CheckinsAssignedSubview.onDeassignConfirmPositive", error);
        }
    }

    return (

        <Container fluid id="CheckinsAssignedView">

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

            <Row className="mb-3">

                {/* Option 1 --------------------------------------------- */}
                <Col className="col-5 mb-1">
                    <>
                        <h6 className="text-center">
                            Option 1: Edit Assignment Details
                        </h6>
                        <hr className="mb-3"/>
                        <Row className="ml-2">
                            <AssignForm
                                assign={configureAssign(props.checkin)}
                                handleAssign={handleAssign}
                            />
                        </Row>
                    </>
                </Col>

                {/* Option 2 --------------------------------------------- */}
                <Col className="col-4  bg-light mb-1">
                    <>
                        <h6 className="text-center">
                            Option 2: Move Guest To A Different Mat
                        </h6>
                        <hr className="mb-3"/>
                        <Row className="justify-content-center ml-1 mr-1 mb-3">
                            Move this Guest (and transfer the related
                            assignment details) to a different mat.
                        </Row>
                        <Row className="justify-content-center mb-3">
                            <CheckinSelector
                                checkins={availables}
                                handleCheckin={handleDestination}
                                label="To Mat:"
                            />
                            <Button
                                className="ml-2"
                                disabled={destination.id < 0}
                                onClick={onMove}
                                size="sm"
                                variant="primary"
                            >
                                Move
                            </Button>
                        </Row>
                    </>
                </Col>

                {/* Option 3 --------------------------------------------- */}
                <Col className="col-3 mb-1">
                    <>
                        <h6 className="text-center">
                            Option 3: Remove Assignment
                        </h6>
                        <hr className="mb-3"/>
                        <Row className="justify-content-center ml-1 mr-1 mb-3">
                            Remove the current assignment, erasing any
                            of the details that were specified.
                        </Row>
                        <Row className="mb-5"/>
                        <Row className="justify-content-end">
                            <Button
                                onClick={onDeassignConfirm}
                                size="sm"
                                variant="danger"
                            >
                                Remove
                            </Button>
                        </Row>
                    </>
                </Col>

            </Row>

            {/* Option 3 Confirm Modal ----------------------------------- */}
            <Modal
                animation={false}
                backdrop="static"
                centered
                onHide={onDeassignConfirmNegative}
                show={showDeassignConfirm}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deassign</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Do you really want to remove this assignment
                        and erase the assignment details (including which
                        Guest was assigned to this mat)?
                    </p>
                    <p>
                        If you just want to move an assigned Guest to a
                        different available mat, use Option 2 instead.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={onDeassignConfirmPositive}
                        size="sm"
                        variant="danger"
                    >
                        Confirm
                    </Button>
                    <Button
                        onClick={onDeassignConfirmNegative}
                        size="sm"
                        variant="primary"
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

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

export default CheckinsAssignedSubview;
