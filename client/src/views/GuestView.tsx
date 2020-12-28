// GuestView -----------------------------------------------------------------

// Administrator view for listing and editing Guests.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import GuestForm, { HandleGuest } from "../forms/GuestForm";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import GuestsSubview, { HandleSelectedGuest } from "../subviews/GuestsSubview";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const GuestView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [facility, setFacility] = useState<Facility>(new Facility());
    const [guest, setGuest] = useState<Guest | null>(null);
    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {

        const fetchGuests = async () => {

            const newFacility = facilityContext.index >= 0
                ? facilityContext.facilities[facilityContext.index]
                : new Facility({ name: "(Select)" });
            console.info("GuestView.setFacility("
                + JSON.stringify(newFacility, Replacers.FACILITY)
                + ")");
            setFacility(newFacility);

            setRefresh(false);

        }

        fetchGuests();

    }, [facilityContext, refresh]);

    const addEnabled = (): boolean => {
        return loginContext.validateScope("regular");
    }

    const handleInsert: HandleGuest
        = async (newGuest) =>
    {
        try {
            const inserted: Guest
                = await FacilityClient.guestsInsert(facility.id, newGuest);
            console.info("GuestView.handleInsert("
                + JSON.stringify(inserted, Replacers.TEMPLATE)
                + ")");
            setGuest(null);
            setRefresh(true);
        } catch (error) {
            ReportError("GuestView.handleInsert", error);
        }
    }

    const handleRemove: HandleGuest
        = async (newGuest) =>
    {
        try {
            const removed: Guest
                = await FacilityClient.guestsRemove(facility.id, newGuest.id);
            console.info("GuestView.handleRemove("
                + JSON.stringify(removed, Replacers.TEMPLATE)
                + ")");
            setGuest(null);
            setRefresh(true);
        } catch (error) {
            ReportError("GuestView.handleRemove", error);
        }
    }

    const handleSelectedGuest: HandleSelectedGuest
        = (newGuest) =>
    {
        if (newGuest) {
            console.info("GuestView.handleSelectedGuest("
                + JSON.stringify(newGuest, Replacers.GUEST)
                + ")");
            setGuest(newGuest);
        } else {
            console.info("GuestView.handleSelectedGuest(unselected");
            setGuest(null);
        }
    }

    const handleUpdate: HandleGuest
        = async (newGuest) =>
    {
        try {
            const removed: Guest = await FacilityClient.guestsUpdate
            (facility.id, newGuest.id, newGuest);
            console.info("GuestView.handleUpdate("
                + JSON.stringify(removed, Replacers.TEMPLATE)
                + ")");
            setGuest(null);
            setRefresh(true);
        } catch (error) {
            ReportError("GuestView.handleUpdate", error);
        }
    }

    const onAdd = () => {
        console.info("GuestView.onAdd()");
        const newGuest: Guest = new Guest({
            facilityId: facility.id,
            id: -1
        });
        setGuest(newGuest);
    }

    const onBack = () => {
        console.info("GuestView.onBack()");
        setGuest(null);
    }

    return (

        <Container fluid id="GuestView">

            {/* List View */}
            {(!guest) ? (

                <>

                    <Row className="ml-1 mr-1 mb-3">
                        <GuestsSubview
                            facility={facility}
                            handleSelectedGuest={handleSelectedGuest}
                        />
                    </Row>

                    <Row className="ml-4">
                        <Button
                            disabled={!addEnabled()}
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

export default GuestView;
