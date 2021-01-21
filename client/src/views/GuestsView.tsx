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
import * as Abridgers from "../util/abridgers";
import logger from "../util/client-logger";
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
            setFacility(currentFacility);
            logger.debug({
                context: "GuestsView.setFacility",
                facility: Abridgers.FACILITY(currentFacility),
            })

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
            setGuest(null);
            setRefresh(true);
            logger.info({
                context: "GuestsView.handleInsert",
                guest: Abridgers.GUEST(inserted),
            });
        } catch (error) {
            ReportError("GuestsView.handleInsert", error);
        }
    }

    const handleRemove: HandleGuest = async (newGuest) => {
        try {
            const removed: Guest
                = await FacilityClient.guestsRemove(facility.id, newGuest.id);
            setGuest(null);
            setRefresh(true);
            logger.info({
                context: "GuestsView.handleRemove",
                guest: Abridgers.GUEST(removed),
            });
        } catch (error) {
            ReportError("GuestsView.handleRemove", error);
        }
    }

    const handleSelect: HandleGuestOptional = (newGuest) => {
        if (newGuest) {
            if (canEdit) {
                setGuest(newGuest);
            }
            logger.debug({
                context: "GuestsView.handleSelect",
                canEdit: canEdit,
                canRemove: canRemove,
            });
        } else {
            setGuest(null);
            logger.trace({ context: "GuestsView.handleSelect", msg: "UNSET" });
        }
    }

    const handleUpdate: HandleGuest = async (newGuest) => {
        try {
            const updated: Guest = await FacilityClient.guestsUpdate
                (facility.id, newGuest.id, newGuest);
            setGuest(null);
            setRefresh(true);
            logger.info({
                context: "GuestsView.handleUpdate",
                guest: Abridgers.GUEST(updated),
            })
        } catch (error) {
            ReportError("GuestsView.handleUpdate", error);
        }
    }

    const onAdd = () => {
        const newGuest: Guest = new Guest({
            facilityId: facility.id,
            id: -1
        });
        setGuest(newGuest);
        logger.trace({ context: "GuestsView.onAdd", guest: newGuest });
    }

    const onBack = () => {
        setGuest(null);
        logger.trace({ context: "GuestsView.onBack" });
    }

    return (

        <Container fluid id="GuestsView">

            {/* List View */}
            {(!guest) ? (

                <>

                    <Row className="ml-1 mr-1 mb-3">
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
