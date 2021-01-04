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
import * as Replacers from "../util/replacers";
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
            console.info("GuestHistoryReport.setFacility("
                + JSON.stringify(currentFacility, Replacers.FACILITY)
                + ")");
            setFacility(currentFacility);

            // Select Checkins for the specified Guest (if any)
            if (guest) {
                try {
                    const newCheckins: Checkin[] =
                        await FacilityClient.checkinsGuest(facility.id, guest.id);
                    console.info("GuestHistoryReport.fetchCheckins("
                        + JSON.stringify(newCheckins, Replacers.CHECKIN)
                        + ")");
                    setCheckins(newCheckins);
                } catch (error) {
                    ReportError("GuestHistoryReport.fetchCheckins", error);
                    setCheckins([]);
                }
            } else {
                console.info("GuestHistoryReport.fetchCheckins(UNSET)");
                setCheckins([]);
            }

        }

        fetchCheckins();

    }, [facilityContext, loginContext, facility.id, guest]);

    const handleSelect: HandleGuestOptional = (newGuest) => {
        if (newGuest) {
            console.info("GuestHistoryReport.handleSelect("
                + JSON.stringify(newGuest, Replacers.GUEST)
                + ")");
        } else {
            console.info("GuestHistoryReport.handleSelect(UNSET)");
        }
        setGuest(newGuest);
    }

    const onBack: OnClick = () => {
        console.info("GuestHistoryReport.onBack()");
        setGuest(null);
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
