// GuestView -----------------------------------------------------------------

// Administrator view for editing Guest objects.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import GuestForm, { HandleGuest } from "../forms/GuestForm";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import * as Replacers from "../util/Replacers";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const GuestView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [facility, setFacility] = useState<Facility>(new Facility());
    const [index, setIndex] = useState<number>(-1);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [guest, setGuest] = useState<Guest | null>(null);
    const [guests, setGuests] = useState<Guest[]>([]);

    useEffect(() => {

        const fetchGuests = async () => {

            const newFacility = facilityContext.index >= 0
                ? facilityContext.facilities[facilityContext.index]
                : new Facility({ name: "(Select)" });
            console.info("GuestView.setFacility("
                + JSON.stringify(newFacility, Replacers.FACILITY)
                + ")");
            setFacility(newFacility);

            try {
                if (newFacility.id > 0) {
                    const newGuests: Guest[]
                        = await FacilityClient.guestsAll(newFacility.id);
                    console.info("GuestView.fetchData("
                        + JSON.stringify(newGuests, Replacers.TEMPLATE)
                        + ")");
                    setGuests(newGuests);
                } else {
                    setGuests([]);
                }
                setRefresh(false);
            } catch (error) {
                setGuests([]);
                ReportError("GuestView.fetchGuests", error);
            }

        }

        fetchGuests();

    }, [facilityContext, refresh]);

    const addEnabled = (): boolean => {
        return loginContext.validateScope("regular");
    }

    const handleIndex = (newIndex: number): void => {
        if (newIndex === index) {
            console.info("GuestView.handleIndex(-1)");
            setIndex(-1);
            setGuest(null);
        } else {
            console.info("GuestView.handleIndex("
                + newIndex + ", "
                + JSON.stringify(guests[newIndex], Replacers.TEMPLATE)
                + ")");
            if (loginContext.validateScope("regular")) {
                setGuest(guests[newIndex]);
            }
            setIndex(newIndex)
        }
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
            setIndex(-1);
            setRefresh(true);
            setGuest(null);
        } catch (error) {
            ReportError("GuestView.handleInsert", error);
        }
    }

    const handleRemove: HandleGuest
        = async (newGuest) => {
        try {
            const removed: Guest
                = await FacilityClient.guestsRemove(facility.id, newGuest.id);
            console.info("GuestView.handleRemove("
                + JSON.stringify(removed, Replacers.TEMPLATE)
                + ")");
            setIndex(-1);
            setRefresh(true);
            setGuest(null);
        } catch (error) {
            ReportError("GuestView.handleRemove", error);
        }
    }

    const handleUpdate: HandleGuest
        = async (newGuest) => {
        try {
            const removed: Guest = await FacilityClient.guestsUpdate
            (facility.id, newGuest.id, newGuest);
            console.info("GuestView.handleUpdate("
                + JSON.stringify(removed, Replacers.TEMPLATE)
                + ")");
            setIndex(-1);
            setRefresh(true);
            setGuest(null);
        } catch (error) {
            ReportError("GuestView.handleUpdate", error);
        }
    }

    const listHeaders = [
        "First Name",
        "Last Name",
        "Active",
        "Comments",
        "Fav. Mat",
    ]

    const onAdd = () => {
        console.info("GuestView.onAdd()");
        setIndex(-2);
        const newGuest: Guest = new Guest({
            facilityId: facility.id,
            id: -2
        });
        setGuest(newGuest);
    }

    const onBack = () => {
        console.info("GuestView.onBack()");
        setIndex(-1);
        setGuest(null);
    }

    const value = (value: any): string => {
        if (typeof(value) === "boolean") {
            return value ? "Yes" : "No"
        } else if (!value) {
            return "";
        } else {
            return value;
        }
    }

    const values = (guest: Guest): string[] => {
        let results: string[] = [];
        results.push(value(guest.firstName));
        results.push(value(guest.lastName));
        results.push(value(guest.active));
        results.push(value(guest.comments));
        results.push(value(guest.favorite));
        return results;
    }

    return (
        <>
            <Container fluid id="GuestView">

                {(!guest) ? (
                    <>

                        {/* List View */}
                        <Row className="mb-3 ml-1 mr-1">
                            <Table
                                bordered
                                hover
                                size="sm"
                                striped
                            >

                                <thead>
                                <tr className="table-dark" key={100}>
                                    <th
                                        className="text-center"
                                        colSpan={7}
                                        key={101}
                                    >
                                        Guests for {facility ? facility.name : "(Select)"}
                                    </th>
                                </tr>
                                <tr className="table-secondary" key={102}>
                                    {listHeaders.map((header, index) => (
                                        <th key={200 + index + 1} scope="col">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                {guests.map((guest, rowIndex) => (
                                    <tr
                                        className={"table-" +
                                        (rowIndex === index ? "primary" : "default")}
                                        key={1000 + (rowIndex * 100)}
                                        onClick={() => (handleIndex(rowIndex))}
                                    >
                                        {values(guest).map((value: string, colIndex: number) => (
                                            <td
                                                data-key={1000 + (rowIndex * 100) + colIndex + 1}
                                                key={1000 + (rowIndex * 100) + colIndex + 1}
                                            >
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>

                            </Table>
                        </Row>

                        <Row className="ml-1 mr-1">
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
        </>
    )

}

export default GuestView;
