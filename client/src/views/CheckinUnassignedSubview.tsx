// CheckinUnassignedSubview --------------------------------------------------

// Provide a two-step process to deal with a Checkin that has not yet been
// assigned a Guest:
// - Select a Guest to assign, or create a new one
// - Assign the Guest, filling in assignment details

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import { Stage } from "./CheckinView";
import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import {OnChangeInput, OnClick} from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import AssignForm from "../forms/AssignForm";
import GuestForm from "../forms/GuestForm";
import Assign from "../models/Assign";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Guest from "../models/Guest";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";
import {
    withFlattenedObjects,
    toEmptyStrings,
    toNullValues
} from "../util/transformations";

// Incoming Properties -------------------------------------------------------

export type HandleGuest = (guest: Guest) => void;
export type HandleStage = (stage: Stage) => void;

export interface Props {
    checkin: Checkin;               // Currently unassigned Checkin
    checkinDate: string;            // Date for which to process checkins
    handleStage: HandleStage;       // Handle (stage) when changing
}

// Component Details ---------------------------------------------------------

const CheckinUnassignedSubview = (props: Props) => {

    // General Support -------------------------------------------------------

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [assign, setAssign] = useState<Assign | null>(null);
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [guest, setGuest] = useState<Guest | null>(null);

    // Fetch the current Facility (if any)
    useEffect(() => {

        const fetchFacility = () => {
            const newFacility = facilityContext.index >= 0
                ? facilityContext.facilities[facilityContext.index]
                : new Facility({ name: "(Select)" });
            console.info("CheckinUnassignedSubview.setFacility("
                + JSON.stringify(newFacility, Replacers.FACILITY)
                + ")");
            setFacility(newFacility);
        }

        fetchFacility();

    }, [facilityContext]);

    const onBack: OnClick = () => {
        props.handleStage(Stage.None);
    }

    // Step 1 - Select or Create Guest ---------------------------------------

    const [adding, setAdding] = useState<boolean>(false);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [pageSize] = useState<number>(10);
    const [refreshGuests, setRefreshGuests] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>("");

    // Fetch all Checkins for this Facility and checkin date
    useEffect(() => {

        const fetchCheckins = async () => {
            if (facility.id > 0) {
                const newCheckins: Checkin[] = await FacilityClient.checkinsAll
                    (facility.id, props.checkinDate, { withGuest: "" });
                console.info("CheckinUnassignedSubview.fetchCheckins("
                    + JSON.stringify(newCheckins, Replacers.CHECKIN)
                    + ")");
                setCheckins(flattenedCheckins(newCheckins));
            } else {
                console.info
                    ("CheckinUnassignedSubview.fetchCheckins(skipped - no facility)");
                setCheckins([]);
            }
        }

        fetchCheckins();

    }, [facility, props.checkinDate]);

    // Fetch Guests that match the search criteria
    useEffect(() => {

        const fetchGuests = async () => {
            if (facility.id > 0) {
                if (searchText.length > 0) {
                    try {
                        const newGuests: Guest[] =
                            await FacilityClient.guestsName(facility.id, searchText, {
                                limit: pageSize,
                                offset: (pageSize * (currentPage - 1))
                            });
                        console.info("GuestView.fetchGuests("
                            + JSON.stringify(newGuests, Replacers.GUEST)
                            + ")");
                        setGuests(newGuests);
                    } catch (error) {
                        setGuests([]);
                        ReportError("CheckinUnassignedSubview.fetchGuests", error);
                    }
                } else {
                    console.info
                        ("CheckinUnassignedSubview.fetchGuests(skipped - no search text");
                    setGuests([]);
                }
            } else {
                console.info
                    ("CheckinUnassignedSubview.fetchGuests(skipped - no facility");
                setGuests([]);
            }
            setRefreshGuests(false);
        }

        fetchGuests();

    }, [facility, props.checkinDate, currentPage, pageSize, refreshGuests, searchText]);

    const flattenedCheckins = (checkins: Checkin[]) => {
        const flattenedCheckins =
            withFlattenedObjects(checkins, "guest");
        flattenedCheckins.forEach(flattenedCheckin => {
            flattenedCheckin.matNumberAndFeatures = "" + flattenedCheckin.matNumber;
            if (flattenedCheckin.features) {
                flattenedCheckin.matNumberAndFeatures += flattenedCheckin.features;
            }
        })
        return flattenedCheckins;
    }

    const addEnabled = (): boolean => {
        return loginContext.validateScope("regular");
    }

    const handleChange = (newSearchText: string): void => {
        setSearchText(newSearchText);
    }

    const handleIndex = (newIndex: number): void => {
        if (newIndex === index) {
            console.info("CheckinUnassignedView.handleIndex(-1)");
            setGuest(null);
            setIndex(-1);
        } else {
            let matNumber: number = -1;
            checkins.forEach(checkin => {
                if (checkin.guestId && (checkin.guestId === guests[newIndex].id)) {
                    matNumber = checkin.matNumber;
                }
            })
            if (matNumber > 0) {
                alert(`This Guest is already assigned to mat ${matNumber} on this date.`);
            } else {
                console.info("CheckinUnassignedView.handleIndex("
                    + newIndex + ", "
                    + JSON.stringify(guests[newIndex], Replacers.GUEST)
                    + ")");
                setIndex(newIndex);
            }
        }
    }

    const handleGuest: HandleGuest = async (newGuest) => {
        try {
            const inserted: Guest =
                await FacilityClient.guestsInsert(facility.id, newGuest);
            console.info("CheckinUnassignedSubview.handleGuest("
                + JSON.stringify(newGuest, Replacers.GUEST)
                + ")");
            setAdding(false);
            setGuest(inserted);
            setIndex(-1);
            setRefreshGuests(true);
            // TODO - reset search text?
            // TODO - configureAssign(inserted)
        } catch (error) {
            ReportError("CheckinUnassignedSubview.handleGuest", error);
        }
    }

    const listFields = [
        "firstName",
        "lastName",
        "active",
        "comments",
        "favorite",
    ];

    const listHeaders = [
        "First Name",
        "Last Name",
        "Active",
        "Comments",
        "Fav. Mat",
    ];

    const onAdd: OnClick = () => {
        console.info("CheckinUnassignedSubview.onAdd()");
        setAdding(true);
        setCurrentPage(1);
        setGuest(null);
        setIndex(-1);
        // TODO - reset search text?
    }

    const onPageNext = () => {
        const newCurrentPage = currentPage + 1;
        setCurrentPage(newCurrentPage);
        setRefreshGuests(true);
    }

    const onPagePrevious = () => {
        const newCurrentPage = currentPage - 1;
        setCurrentPage(newCurrentPage);
        setRefreshGuests(true);
    }

    const onSearchChange: OnChangeInput = (event) => {
        const newSearchText: string = event.target.value;
        console.info
            (`CheckinUnassignedSubview.onSearchChange(${newSearchText})`);
        setCurrentPage(1);
        setSearchText(newSearchText);
    }

    // Step 2 - Enter Assign Details -----------------------------------------

    // TODO - all of it

    return (

        <>

        </>

    )

}

export default CheckinUnassignedSubview;
