// GuestsView ----------------------------------------------------------------

// Administrator view for listing and editing Guests.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import { HandleGuest, HandleGuestOptional, Scopes } from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import GuestForm from "../forms/GuestForm";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import GuestsSubview from "../subviews/GuestsSubview";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const GuestsView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canAdd, setCanAdd] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [guest, setGuest] = useState<Guest | null>(null);
    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {

        const fetchGuests = async () => {

            // Establish the currently selected Facility
            let currentFacility: Facility;
            if (facilityContext.facility) {
                currentFacility = facilityContext.facility;
            } else {
                currentFacility = new Facility({ id: -1, name: "(Select Facility)"});
            }
            console.info("GuestsView.setFacility("
                + JSON.stringify(currentFacility, Replacers.FACILITY)
                + ")");
            setFacility(currentFacility);

            // Record current permissions
            const isRegular = loginContext.validateScope(Scopes.REGULAR);
            setCanAdd(isRegular);
            setCanEdit(isRegular);
            setCanRemove(loginContext.validateScope(Scopes.SUPERUSER));

            // Reset refresh flag if necessary
            if (refresh) {
                setRefresh(false);
            }

        }

        fetchGuests();

    }, [facilityContext, loginContext, facility.id, refresh]);

    const handleInsert: HandleGuest = async (newGuest) => {
        try {
            const inserted: Guest
                = await FacilityClient.guestsInsert(facility.id, newGuest);
            console.info("GuestsView.handleInsert("
                + JSON.stringify(inserted, Replacers.GUEST)
                + ")");
            setGuest(null);
            setRefresh(true);
        } catch (error) {
            ReportError("GuestsView.handleInsert", error);
        }
    }

    const handleRemove: HandleGuest = async (newGuest) => {
        try {
            const removed: Guest
                = await FacilityClient.guestsRemove(facility.id, newGuest.id);
            console.info("GuestsView.handleRemove("
                + JSON.stringify(removed, Replacers.GUEST)
                + ")");
            setGuest(null);
            setRefresh(true);
        } catch (error) {
            ReportError("GuestsView.handleRemove", error);
        }
    }

    const handleSelect: HandleGuestOptional = (newGuest) => {
        if (newGuest) {
            if (canEdit) {
                console.info("GuestsView.handleSelect(CAN EDIT, "
                    + JSON.stringify(newGuest, Replacers.GUEST)
                    + ")");
                setGuest(newGuest);
            } else {
                console.info("GuestsView.handleSelect(CANNOT EDIT, "
                    + JSON.stringify(newGuest, Replacers.GUEST)
                    + ")");
            }
        } else {
            console.info("GuestsView.handleSelect(UNSET)");
            setGuest(null);
        }
    }

    const handleUpdate: HandleGuest = async (newGuest) => {
        try {
            const updated: Guest = await FacilityClient.guestsUpdate
                (facility.id, newGuest.id, newGuest);
            console.info("GuestsView.handleUpdate("
                + JSON.stringify(updated, Replacers.GUEST)
                + ")");
            setGuest(null);
            setRefresh(true);
        } catch (error) {
            ReportError("GuestsView.handleUpdate", error);
        }
    }

    const onAdd = () => {
        console.info("GuestsView.onAdd()");
        const newGuest: Guest = new Guest({
            facilityId: facility.id,
            id: -1
        });
        setGuest(newGuest);
    }

    const onBack = () => {
        console.info("GuestsView.onBack()");
        setGuest(null);
    }

    return (

        <Container fluid id="GuestView">

            {/* List View */}
            {(!guest) ? (

                <>

                    <Row className="mb-3">
                        <GuestsSubview
                            handleSelect={handleSelect}
                        />
                    </Row>

                    <Row className="ml-4">
                        <Button
                            disabled={!canAdd}
                            onClick={onAdd}
                            size="sm"
                            variant="primary"
                        >
                            Add
                        </Button>
                    </Row>

                </>

            ) : null }

            {/* Detail View */}
            {(guest) ? (

                <>

                    <Row className="ml-1 mr-1 mb-3">
                        <Col className="text-left">
                            <strong>
                                <>
                                    {(guest.id < 0) ? (
                                        <span>Adding New</span>
                                    ) : (
                                        <span>Editing Existing</span>
                                    )}
                                    &nbsp;Guest
                                </>
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
                            canRemove={canRemove}
                            guest={guest}
                            handleInsert={handleInsert}
                            handleRemove={handleRemove}
                            handleUpdate={handleUpdate}
                        />
                    </Row>

                </>

            ) : null }

        </Container>

    )

}

export default GuestsView;
