// GuestHistoryReport --------------------------------------------------------

// Top-level view for the Guest History Report

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import { HandleGuestOptional, OnClick } from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import GuestsSubview from "../subviews/GuestsSubview";
import * as Abridgers from "../util/abridgers";
import logger from "../util/client-logger";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const GuestHistoryReport = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [guest, setGuest] = useState<Guest | null>(null);

    useEffect(() => {

        const fetchCheckins = async () => {

            // Establish the currently selected Facility
            let currentFacility: Facility;
            if (facilityContext.facility) {
                currentFacility = facilityContext.facility;
            } else {
                currentFacility = new Facility({ id: -1, name: "(Select Facility)"});
            }
            setFacility(currentFacility);
            logger.debug({
                context: "GuestHistoryReport.setFacility",
                facility: Abridgers.FACILITY(currentFacility),
            });

            // Select Checkins for the specified Guest (if any)
            if (guest && loginContext.loggedIn) {
                try {
                    const newCheckins: Checkin[] =
                        await FacilityClient.checkinsGuest(facility.id, guest.id);
                    setCheckins(newCheckins);
                    logger.debug({
                        context: "GuestHistoryReport.fetchCheckins",
                        count: newCheckins.length,
                    });
                } catch (error) {
                    setCheckins([]);
                    if (error.response && (error.response.status === 403)) {
                        logger.trace({
                            context: "GuestHistoryReport.fetchCheckins",
                            msg: "FORBIDDEN",
                        });
                    } else {
                        ReportError("GuestHistoryReport.fetchCheckins", error);
                    }
                }
            } else {
                setCheckins([]);
                logger.trace({
                    context: "GuestHistoryReport.fetchCheckins",
                    msg: "SKIPPED",
                });
            }

        }

        fetchCheckins();

    }, [facilityContext, loginContext.loggedIn, facility.id, guest]);

    const handleSelect: HandleGuestOptional = (newGuest) => {
        if (newGuest) {
            setGuest(newGuest);
            logger.debug({
                context: "GuestHistoryReport.handleSelect",
                guest: Abridgers.GUEST(newGuest),
            });
        } else {
            setGuest(null);
            logger.trace({
                context: "GuestHistoryReport.handleSelect",
                msg: "UNSET",
            });
        }
    }

    const onBack: OnClick = () => {
        setGuest(null);
        logger.trace({ context: "GuestHistoryReport.onBack" });
    }

    const listFields = [
        "checkinDate",
        "matNumber",
        "paymentType",
        "paymentAmount",
        "showerTime",
        "wakeupTime",
        "comments",
    ];

    const listHeaders = [
        "Checkin Date",
        "Mat",
        "Type",
        "Amount",
        "Shower Time",
        "Wakeup Time",
        "Comments",
    ];

    const title = (): string => {
        return "Checkins for "
            + (guest ? guest.firstName : "(First Name)")
            + " "
            + (guest ? guest.lastName : "(Last Name)")
            + " at " + facility.name;
    }

    return (

        <Container fluid id="GuestHistoryReport">

            {/* Search View */}
            {(!guest) ? (
                <>
                    <Row className="mb-3 ml-1 mr-1">
                        <GuestsSubview
                            handleSelect={handleSelect}
                        />
                    </Row>
                    <Row className="ml-1 mr-1">
                        <span>
                            Click on the Guest for which you wish to report.
                        </span>
                    </Row>
                </>
            ) : null }

            {/* Report View */}
            {(guest) ? (
                <>
                    <Row className="mb-3">
                        <Col className="ml-2 text-left">
                            <span>
                                Report Date: {(new Date()).toLocaleString()}
                            </span>
                        </Col>
                        <Col className="mr-2 text-right">
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
                        <SimpleList
                            items={checkins}
                            listFields={listFields}
                            listHeaders={listHeaders}
                            title={title()}
                        />
                    </Row>
                </>
            ) : null}

        </Container>

    )

}

export default GuestHistoryReport;
