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
import {HandleAssign, HandleCheckin, HandleGuestOptional, OnClick} from "../components/types";
import AssignForm from "../forms/AssignForm";
import GuestForm from "../forms/GuestForm";
import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import GuestsSubview from "../subviews/GuestsSubview";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";
import { Stage } from "../views/CheckinView";

// Incoming Properties -------------------------------------------------------

export type HandleStage = (stage: Stage) => void;

export interface Props {
    checkin: Checkin;               // The (unassigned) Checkin we are processing
    facility: Facility;             // Facility for which we are processing
                                    // or (facility.id < 0) if no Facility is current
    handleAssigned?: HandleCheckin; // Handle (assign) when successfully completed
    handleStage: HandleStage;       // Handle (stage) when changing
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
            paymentAmount: "5.00",
            paymentType: "$$",
            showerTime: null,
            wakeupTime: null
        });
        console.info("CheckinsUnassignedSubview.configureAssign("
            + JSON.stringify(newAssign, Replacers.ASSIGN)
            + ")");
        return newAssign;
    }

    const handleAddedGuest: HandleGuestOptional = async (newGuest) => {
        if (newGuest) {
            try {
                const inserted: Guest
                    = await FacilityClient.guestsInsert(props.facility.id, newGuest);
                console.info("CheckinsUnassignedSubview.handleAddedGuest("
                    + JSON.stringify(inserted, Replacers.GUEST)
                    + ")");
                setAssigned(configureAssign(newGuest));
                setGuest(inserted);
            } catch (error) {
                ReportError("GuestsView.handleInsert", error);
                setAssigned(null);
                setGuest(null);
            }
        } else {
            console.info("CheckinViewUnassigned.handleAddGuest(unselected)");
        }
    }

    const handleAssigned: HandleAssign = async (newAssign) => {
        try {
            const assigned = await FacilityClient.assignsAssign
                (newAssign.facilityId, newAssign.id, newAssign);
            console.info("CheckinsUnassignedSubview.handleAssigned("
                + JSON.stringify(assigned, Replacers.CHECKIN)
                + ")");
            if (props.handleAssigned) {
                props.handleAssigned(assigned);
            }
            props.handleStage(Stage.List);
        } catch (error) {
            ReportError("CheckinsUnassignedSubview.handleAssigned", error);
        }
    }

    const handleSelected: HandleGuestOptional = (newGuest) => {
        if (newGuest) {
            console.info("CheckinsUnassignedSubview.handleSelectedGuest("
                + JSON.stringify(newGuest, Replacers.GUEST)
                + ")");
            setGuest(newGuest);
            setAssigned(configureAssign(newGuest));
        } else {
            console.info("CheckinViewUnassigned.handleSelectedGuest(unselected)");
        }
    }

    const onAdd: OnClick = () => {
        console.info("CheckinsUnassignedSubview.onAdd()");
        setAdding(true);
    }

    const onBack: OnClick = () => {
        props.handleStage(Stage.List);
    }

    // TODO - the return part

}

export default CheckinsUnassignedSubview;
