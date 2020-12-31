// GuestsSubview -------------------------------------------------------------

// Render a searchable list of Guests for the current Facility, with a
// callback to handleSelect(guest) when a particular Guest is selected
// or handleSelect(null) if a previously selected Guest is unselected.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import SimpleList from "../components/SimpleList";
import { HandleGuestOptional, HandleIndex } from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Incoming Properties -------------------------------------------------------

export interface Props {
    handleSelect: HandleGuestOptional;
                                    // Return selected (Guest) for processing,
                                    // or null if previous selection was unselected
    title?: string                  // Table title [Guests for {facility.name}]
}

// Component Details ---------------------------------------------------------

const GuestsSubview = (props: Props) => {

    const facilityContext = useContext(FacilityContext);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [guests, setGuests] = useState<Guest[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [pageSize] = useState<number>(10);
    const [searchText, setSearchText] = useState<string>("");

    useEffect(() => {

        const fetchGuests = async () => {

            // Establish the currently selected Facility
            let currentFacility: Facility;
            if (facilityContext.facility) {
                currentFacility = facilityContext.facility;
            } else {
                currentFacility = new Facility({ id: -1, name: "(Select Facility)"});
            }
            console.info("GuestsSubview.setFacility("
                + JSON.stringify(currentFacility, Replacers.FACILITY)
                + ")");
            setFacility(currentFacility);

            // Fetch Guests matching search text (if any) for this Facility (if any)
            if (facility.id >= 0) {
                if (searchText.length > 0) {
                    try {
                        const newGuests: Guest[] =
                            await FacilityClient.guestsName
                                (facility.id, searchText, {
                                    limit: pageSize,
                                    offset: (pageSize * (currentPage - 1))
                                });
                        console.info("GuestsSubview.fetchGuests("
                            + JSON.stringify(newGuests, Replacers.GUEST)
                            + ")");
                        setGuests(newGuests);
                        setIndex(-1);
                    } catch (error) {
                        ReportError("GuestsSubview.fetchGuests", error);
                        setGuests([]);
                        setIndex(-1);
                    }
                }
            }

        }

        fetchGuests();

    }, [facilityContext, currentPage, pageSize, searchText])

    const handleChange = (newSearchText: string): void => {
        setSearchText(newSearchText);
    }

    const handleIndex: HandleIndex = (newIndex) => {
        if (newIndex === index) {
            console.info("GuestsSubview.handleIndex(UNSET)");
            setIndex(-1);
            if (props.handleSelect) {
                props.handleSelect(null);
            }
        } else {
            const newGuest = guests[newIndex];
            console.info("GuestsSubview.handleIndex("
                + newIndex + ", "
                + JSON.stringify(newGuest, Replacers.GUEST)
                + ")");
            setIndex(newIndex);
            if (props.handleSelect) {
                props.handleSelect(newGuest);
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
                <Col className="col-10 mr-2">
                    <SearchBar
                        autoFocus
                        handleChange={handleChange}
                        label="Search For:"
                        placeholder="Search by all or part of either name"
                    />
                </Col>
                <Col>
                    <Pagination
                        currentPage={currentPage}
                        lastPage={(guests.length === 0) ||
                            (guests.length < pageSize)}
                        onNext={onNext}
                        onPrevious={onPrevious}
                    />
                </Col>
            </Row>

            <Row>
                <SimpleList
                    handleIndex={handleIndex}
                    items={guests}
                    listFields={listFields}
                    listHeaders={listHeaders}
                    title={props.title ? props.title : `Guests for ${facility.name}`}
                />
            </Row>

        </Container>

    )

}

export default GuestsSubview;
