// GuestsSubview -------------------------------------------------------------

// Render a searchable list of Guests for the specified Facility, with a
// callback to handleGuest(guest) when a particular Guest is selected
// or handleGuest(null) if a previously selected Guest was unselected.

// IMPLEMENTATION NOTE:  Be cognizant that props.facility might be null
// if a user has logged off but remains on this subview.

// External Modules ----------------------------------------------------------

import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import SimpleList from "../components/SimpleList";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Incoming Properties -------------------------------------------------------

export type HandleGuest = (guest: Guest | null) => void;

export interface Props {
    facility: Facility | null;      // Facility for which we are listing Guests,
                                    // or null if no Facility is current
    handleGuest: HandleGuest;       // Return selected (Guest) for processing,
                                    // or null if previous selection was unselected
    title?: string                  // Table title [Guests for {facility.name}]
}

// Component Details ---------------------------------------------------------

const GuestsSubview = (props: Props) => {

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [pageSize] = useState<number>(10);
    const [searchText, setSearchText] = useState<string>("");

    useEffect(() => {

        const fetchGuests = async () => {

            try {
                if (props.facility) {
                    if (searchText.length === 0) {
                        console.info("GuestsSubview.fetchGuests(reset)");
                        setGuests([]);
                        setIndex(-1);
                    } else {
                        const newGuests: Guest[] =
                            await FacilityClient.guestsName
                            (props.facility.id, searchText, {
                                limit: pageSize,
                                offset: (pageSize * (currentPage - 1))
                            });
                        console.info("GuestsSubview.fetchGuests("
                            + JSON.stringify(newGuests, Replacers.GUEST)
                            + ")");
                        setGuests(newGuests);
                        setIndex(-1);
                    }
                } else {
                    console.info("GuestView.fetchGuests(skipped)");
                    setGuests([]);
                    setIndex(-1);
                }
            } catch (error) {
                setGuests([]);
                setIndex(-1);
                ReportError("GuestSubview.fetchGuests", error);
            }

        }

        fetchGuests();

    }, [props.facility, currentPage, searchText])

    const handleChange = (newSearchText: string): void => {
        setSearchText(newSearchText);
    }

    const handleIndex = (newIndex: number): void => {
        if (newIndex === index) {
            console.info("GuestsSubview.handleIndex(-1)");
            setIndex(-1);
        } else {
            const newGuest = guests[newIndex];
            console.info("GuestsSubview.handleIndex("
                + newIndex + ", "
                + JSON.stringify(newGuest, Replacers.GUEST)
                + ")");
            setIndex(newIndex);
            if (props.handleGuest) {
                props.handleGuest(newGuest);
            }
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

    const onNext = () => {
        const newCurrentPage = currentPage + 1;
        setCurrentPage(newCurrentPage);
    }

    const onPrevious = () => {
        const newCurrentPage = currentPage - 1;
        setCurrentPage(newCurrentPage);
    }

    return (

        <Container fluid id="GuestsSubview">

            <Row className="mb-3">
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
                    title={props.title ? props.title : "Guests for " +
                        (props.facility ? props.facility.name : "(Select)")}
                />
            </Row>

        </Container>

    )

}

export default GuestsSubview;
