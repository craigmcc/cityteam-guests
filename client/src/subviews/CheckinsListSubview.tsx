// CheckinsListSubview -------------------------------------------------------

// Render a list of Checkins for the specified Facility and checkinDate,
// followed by summary totals for the listed Checkins.  If there are no
// Checkins yet for the specified Facility and checkinDate, offer to generate
// them from one of the available Templates.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import TemplateSelector from "../components/TemplateSelector";
import {HandleCheckinOptional, HandleTemplate} from "../components/types";
import LoginContext from "../contexts/LoginContext";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Summary from "../models/Summary";
import Template from "../models/Template";
import * as Abridgers from "../util/abridgers";
import logger from "../util/client-logger";
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

    const loginContext = useContext(LoginContext);

    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [summary, setSummary] = useState<Summary>(new Summary());
    const [template, setTemplate] = useState<Template>(new Template({ id: -1 }));

    useEffect(() => {

        const fetchCheckins = async () => {

            // Fetch the Checkins (if any) for this Facility and checkinDate
            if ((props.facility.id >= 0) && loginContext.loggedIn) {
                try {
                    const newCheckins: Checkin[] = await FacilityClient.checkinsAll
                        (props.facility.id, props.checkinDate, {
                            withGuest: ""
                        });
                    setCheckins(flattenedCheckins(newCheckins));
                    setRefresh(false);
                    const newSummary = new Summary(props.facility.id, props.checkinDate);
                    newCheckins.forEach(newCheckin => {
                        newSummary.includeCheckin(newCheckin);
                    });
                    setSummary(newSummary);
                    logger.debug({
                        context: "CheckinsListSubview.fetchCheckins",
                        count: newCheckins.length
                    });
                } catch (error) {
                    ReportError("CheckinsListSubview.fetchCheckins", error);
                    setCheckins([]);
                    setRefresh(false);
                    setSummary(new Summary());
                }
            } else {
                logger.trace({
                    context: "CheckinsListSubview.fetchCheckins",
                    msg: "SKIPPED",
                });
                setCheckins([]);
                setRefresh(false);
                setSummary(new Summary());
            }

        }

        fetchCheckins();

    }, [props.checkinDate, props.facility, loginContext.loggedIn, refresh]);

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

    const handleGenerate = (): void => {
        logger.info({
            context: "CheckinsListSubview.handleGenerate",
            template: Abridgers.TEMPLATE(template),
        });
        FacilityClient.checkinsGenerate(
            props.facility.id,
            props.checkinDate,
            template.id
        )
            .then(newCheckins => {
                logger.info({
                    context: "CheckinsListSubview.handleGenerate",
                    count: newCheckins.length,
                });
                setRefresh(true);
            })
            .catch(error => {
                ReportError("CheckinsListSubview.handleGenerate", error);
            })
    }

    const handleIndex = (newIndex: number): void => {
        if (newIndex === index) {
            logger.trace({
                context: "CheckinsListSubview.handleIndex",
                msg: "UNSELECTED",
            });
            if (props.handleSelected) {
                props.handleSelected(null);
            }
            setIndex(-1);
        } else {
            const newCheckin: Checkin = checkins[newIndex];
            logger.debug({
                context: "CheckinsListSubview.handleIndex",
                index: newIndex,
                checkin: Abridgers.CHECKIN(newCheckin),
            });
            if (props.handleSelected) {
                props.handleSelected(newCheckin);
            }
            setIndex(newIndex);
        }
    }

    const handleTemplate: HandleTemplate = (newTemplate) => {
        logger.debug({
            context: "CheckinsListSubview.handleTemplate",
            template: Abridgers.TEMPLATE(newTemplate),
        });
        setTemplate(newTemplate);
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
        "totalAmountDisplay",
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
            + " on " + (props.checkinDate ? props.checkinDate : "(Select)");
    }

    return (

        <Container fluid id="CheckinsListSubview">

            {/* Generate from Template */}
            {(props.facility.id >= 0) && (checkins.length === 0) ? (
                <Row className="mb-3 col-12">
                    <Col className="mr-2 col-3">
                        <TemplateSelector
                            handleTemplate={handleTemplate}
                            label="Select Template:"
                        />
                    </Col>
                    <Col>
                        <Button
                            disabled={template.id < 0}
                            onClick={handleGenerate}
                            size="sm"
                            variant="primary"
                        >
                            Generate
                        </Button>
                        {(template.id < 0) ? (
                            <span className="ml-2">
                                (Select an active Template to generate mats for checkins.)
                            </span>
                        ) : null }
                    </Col>
                </Row>
            ) : null }

            {/* List and Summaries */}
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

            <Row>
                <SimpleList
                    hover={false}
                    items={[summary]}
                    listFields={summaryFields}
                    listHeaders={summaryHeaders}
                    title={undefined}
                />
            </Row>

        </Container>

    )

}

export default CheckinsListSubview;
