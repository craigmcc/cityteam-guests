// GuestView -----------------------------------------------------------------

// Administrator view for editing Guest objects.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import SimpleList from "../components/SimpleList";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import GuestForm, { HandleGuest } from "../forms/GuestForm";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const GuestView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [guest, setGuest] = useState<Guest | null>(null);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [pageSize] = useState<number>(10);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [searchText, setSearchText] = useState("");

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
                if ((newFacility.id > 0) && (searchText.length === 0)) {
                    console.info("GuestView.fetchGuests(reset)");
                    setGuests([]);
                } else if ((newFacility.id > 0) && (searchText.length > 0)) {
                    console.info("GuestView.fetchGuests("
                        + searchText + ", "
                        + pageSize + ", "
                        + (pageSize * (currentPage - 1))
                        + ")");
                    const newGuests: Guest[] =
                        await FacilityClient.guestsName(newFacility.id, searchText, {
                            limit: pageSize,
                            offset: (pageSize * (currentPage - 1))
                        });
                    console.info("GuestView.fetchGuests("
                        + JSON.stringify(newGuests, Replacers.GUEST)
                        + ")");
                    setGuests(newGuests);
                } else {
                    console.info("GuestView.searchGuests(skipped)");
//                    setGuests([]);
                }
            } catch (error) {
                setGuests([]);
                ReportError("GuestView.fetchGuests", error);
            }

            setIndex(-1);
            setRefresh(false);

        }

        fetchGuests();

    }, [facilityContext, currentPage, pageSize, refresh, searchText]);

    const addEnabled = (): boolean => {
        return loginContext.validateScope("regular");
    }

    const handleChange = (newSearchText: string): void => {
        setSearchText(newSearchText);
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

    const listFields = [
        "firstName",
        "lastName",
        "active",
        "comments",
        "favorite",
    ]

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

    const onNext = () => {
        const newCurrentPage = currentPage + 1;
        setCurrentPage(newCurrentPage);
        setRefresh(true);
    }

    const onPrevious = () => {
        const newCurrentPage = currentPage - 1;
        setCurrentPage(newCurrentPage);
        setRefresh(true);
    }

    return (
        <>
            <Container fluid id="GuestView">

                {(!guest) ? (

                    <>

                        {/* List View */}

                        <Row className="mb-3 ml-1 mr-1">
                            <Col className="col-11">
                                <SearchBar
                                    autoFocus
                                    handleChange={handleChange}
                                    label="Search For:"
                                    placeholder="Search by all or part of either name"
                                />
                            </Col>
                            <Col className="col-`">
                                <Pagination
                                    currentPage={currentPage}
                                    lastPage={(guests.length === 0) ||
                                        (guests.length < pageSize)}
                                    onNext={onNext}
                                    onPrevious={onPrevious}
                                />
                            </Col>
                        </Row>

                        <Row className="mb-3 ml-1 mr-1">
                            <SimpleList
                                handleIndex={handleIndex}
                                items={guests}
                                listFields={listFields}
                                listHeaders={listHeaders}
                                title={"Guests for " +
                                    (facility ? facility.name : "(Select)")}
                            />
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
