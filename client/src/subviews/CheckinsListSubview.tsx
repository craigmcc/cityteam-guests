// CheckinsListSubview -------------------------------------------------------

// Render a list of Checkins for the specified Facility and checkinDate,
// followed by summary totals for the listed Checkins.  If there are no
// Checkins yet for the specified Facility and checkinDate, offer to generate
// them from one of the available Templates.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import {HandleCheckinOptional, Scopes} from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Summary from "../models/Summary";
import CheckinsSummary from "../util/CheckinsSummary";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";
import { withFlattenedObjects } from "../util/transformations";

// Incoming Properties -------------------------------------------------------

export interface Props {
    checkinDate: string;            // Checkin date we are processing
    facility: Facility;             // Facility we are processing
    handleSelected?: HandleCheckinOptional;
                                    // Handle (Checkin) upon selection,
                                    // or (null) for unselection
    title?: string;                 // Table Title [Checkins for {facility.name}
                                    // on {checkinDate}]
}

// Component Details ---------------------------------------------------------

const CheckinsListSubview = (props: Props) => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canProcess, setCanProcess] = useState<boolean>(false);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [summary, setSummary] = useState<Summary | null>(null);

    useEffect(() => {

        const fetchCheckins = async () => {

            // Record current permissions
            const isRegular = loginContext.validateScope(Scopes.REGULAR);
            setCanProcess(isRegular);

            // Fetch the Checkins (if any) for this Facility and checkinDate
            if ((props.facility.id >= 0) && isRegular) {
                try {
                    const newCheckins: Checkin[] = await FacilityClient.checkinsAll
                        (props.facility.id, props.checkinDate, {
                            withGuest: ""
                        });
                    console.info("CheckinsListSubview.fetchCheckins("
                        + JSON.stringify(newCheckins, Replacers.CHECKIN)
                        + ")");
                    setCheckins(flattenedCheckins(newCheckins));
                    setSummary(CheckinsSummary(newCheckins));
                } catch (error) {
                    ReportError("CheckinsListSubview.fetchCheckins", error);
                    setCheckins([]);
                    setSummary(null);
                }
            } else {
                console.info("CheckinsListSubview.fetchCheckins(SKIPPED)");
                setCheckins([]);
                setSummary(null);
            }

        }

        fetchCheckins();

    }, [props.checkinDate, props.facility, loginContext]);

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

    const handleIndex = (newIndex: number): void => {
        if (newIndex === index) {
            console.info("CheckinsListSubview.handleIndex(UNSELECTED)");
            if (props.handleSelected) {
                props.handleSelected(null);
            }
            setIndex(-1);
        } else {
            const newCheckin: Checkin = checkins[newIndex];
            console.info("CheckinsListSubview.handleIndex("
                + newIndex + ", "
                + JSON.stringify(newCheckin, Replacers.CHECKIN)
                + ")");
            if (props.handleSelected) {
                props.handleSelected(newCheckin);
            }
            setIndex(newIndex);
        }
    }

    const listFields = [
        "matNumberAndFeatures",
        "guest.firstName",
        "guest.lastName",
        "paymentType",
        "paymentAmount",
        "showerTime",
        "wakeupTime",
        "comments",
    ];

    const listHeaders = [
        "Mat",
        "First Name",
        "Last Name",
        "$$",
        "Amount",
        "Shower",
        "Wakeup",
        "Comments",
    ];

    const summaryFields = [
        "total$$",
        "totalAG",
        "totalCT",
        "totalFM",
        "totalMM",
        "totalSW",
        "totalUK",
        "totalWB",
        "totalAssigned",
        "percentAssigned",
        "totalUnassigned",
        "percentUnassigned",
        "totalMats",
        "totalAmount",
    ];

    const summaryHeaders = [
        "$$",
        "AG",
        "CT",
        "FM",
        "MM",
        "SW",
        "UK",
        "WB",
        "Used",
        "%Used",
        "Empty",
        "%Empty",
        "Total Mats",
        "Total $$",
    ];

    const title = (): string => {
        return "Checkins for "
            + (props.facility ? props.facility.name : "(Select)")
            + " on " + (props.checkinDate ? props.checkinDate : "Select");
    }


    return (

        <Container fluid id="CheckinsListSubview">

            <Row className="mb-3">
                <SimpleList
                    handleIndex={handleIndex}
                    hover={props.handleSelected ? true : false}
                    items={checkins}
                    listFields={listFields}
                    listHeaders={listHeaders}
                    title={title()}
                />
            </Row>

            {(summary) ? (
                <Row>
                    <SimpleList
                        hover={false}
                        items={[summary]}
                        listFields={summaryFields}
                        listHeaders={summaryHeaders}
                        title={undefined}
                    />
                </Row>
            ) : null }

        </Container>

    )

}

export default CheckinsListSubview;
