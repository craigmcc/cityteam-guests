// CheckinsSubview -----------------------------------------------------------

// Render a list of Checkins for the specified Facility and checkin date,
// optionally followed by summary totals for the listed Checkins.

// IMPLEMENTATION NOTE:  Be cognizant that props.facility and props.checkinDate
// might be null if a user has logged off but remains on this subview.

// External Modules ----------------------------------------------------------

import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Summary from "../models/Summary";
import CheckinsSummary from "../util/CheckinsSummary";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";
import {withFlattenedObjects} from "../util/transformations";

// Incoming Properties -------------------------------------------------------

export type HandleSelectedCheckin = (checkin: Checkin| null) => void;

export interface Props {
    checkinDate?: string;           // Checkin date for which we are listing
                                    // Checkins, or null if no date is current
    facility?: Facility;            // Facility for which we are listing Checkins,
                                    // or null if no Facility is current
    handleSelectedCheckin?: HandleSelectedCheckin;
                                    // Optionally return selected (Checkin)
                                    // for processing, or null for unselected
                                    // If not present, no row click is supported
    title?: string;                 // Table Title [Checkins for {facility.name}
                                    // on {checkinDate}]
}

// Component Details ---------------------------------------------------------

const CheckinsSubview = (props: Props) => {

    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [summary, setSummary] = useState<Summary | null>(null);

    useEffect(() => {

        const fetchCheckins = async () => {
            if (props.checkinDate && props.facility && props.facility.id > 0) {
                try {
                    const newCheckins: Checkin[] = await FacilityClient.checkinsAll
                        (props.facility.id, props.checkinDate, {
                            withGuest: ""
                        });
                    console.info("CheckinsSubview.fetchCheckins("
                        + JSON.stringify(newCheckins, Replacers.CHECKIN)
                        + ")");
                    setCheckins(flattenedCheckins(newCheckins));
                    setSummary(CheckinsSummary(newCheckins));
                } catch (error) {
                    ReportError("CheckinsSubview.fetchCheckins", error);
                    setCheckins([]);
                    setSummary(null);
                }
            } else {
                console.info("CheckinsSubview.fetchCheckins(skipped)");
                setCheckins([]);
                setSummary(null);
            }
        }

        fetchCheckins();

    }, [props.checkinDate, props.facility]);

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
            console.info("CheckinsSubview.index(-1)");
            if (props.handleSelectedCheckin) {
                props.handleSelectedCheckin(null);
            }
            setIndex(-1);
        } else {
            const newCheckin: Checkin = checkins[newIndex];
            console.info("CheckinsSubview.index("
                + newIndex + ", "
                + JSON.stringify(newCheckin, Replacers.CHECKIN)
                + ")");
            if (props.handleSelectedCheckin) {
                props.handleSelectedCheckin(newCheckin);
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

        <Container fluid id="CheckinsSubview">

            <Row className="mb-3">
                <SimpleList
                    handleIndex={props.handleSelectedCheckin? handleIndex : undefined}
                    hover={props.handleSelectedCheckin ? true : false}
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

export default CheckinsSubview;
