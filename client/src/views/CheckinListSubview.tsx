// CheckinListSubview --------------------------------------------------------

// Second-level view for Checkins, listing all current Checkins for the
// selected date, and offering to generate Checkins if none exist yet.

// External Modules -----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Row from "react-bootstrap/Row";

// Internal Modules -----------------------------------------------------------

import { Stage } from "./CheckinView";
import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import { OnClick } from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Template from "../models/Template";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";
import TemplateSelector, { HandleTemplate } from "../components/TemplateSelector";
import {withFlattenedObjects} from "../util/transformations";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

// Incoming Properties --------------------------------------------------------

export type HandleCheckin = (checkin: Checkin) => void;
export type HandleStage = (stage: Stage) => void;

export interface Props {
    checkinDate: string;            // Date for which to process checkins
    handleCheckin: HandleCheckin;   // Handle (checkin) when one is selected
    handleStage: HandleStage;       // Handle (stage) when changing
}

// Component Details ----------------------------------------------------------

const CheckinListSubview = (props: Props) => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [index, setIndex] = useState<number>(-1);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [template, setTemplate] = useState<Template>(new Template());

    useEffect(() => {

        const fetchCheckins = async () => {

            const newFacility = facilityContext.index >= 0
                ? facilityContext.facilities[facilityContext.index]
                : new Facility({ name: "(Select)" });
            console.info("CheckinListSubview.setFacility("
                + JSON.stringify(newFacility, Replacers.FACILITY)
                + ")");
            setFacility(newFacility);

            try {
                if (newFacility.id > 0) {
                    const newCheckins: Checkin[] = await FacilityClient.checkinsAll
                        (newFacility.id, props.checkinDate);
                    console.info("CheckinListSubview.fetchCheckins("
                        + JSON.stringify(newCheckins, Replacers.CHECKIN)
                        + ")");
                    setCheckins(flattenedCheckins(newCheckins));
                } else {
                    setCheckins([]);
                }
                setRefresh(false);
            } catch (error) {
                setCheckins([]);
                ReportError("CheckinListSubview.fetchCheckins", error);
            }

        }

        fetchCheckins();

    }, [facilityContext, facility.id, refresh, props.checkinDate])

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
        console.info("CheckListSubview.handleGenerate("
            + JSON.stringify(template, Replacers.TEMPLATE)
            + ")");
        if (template.id < 0) {
            return;
        }
        FacilityClient.checkinsGenerate(
            facility.id,
            props.checkinDate,
            template.id
        )
            .then(newCheckins => {
                console.info("CheckinListSubview.handleGenerate("
                    + JSON.stringify(newCheckins, Replacers.CHECKIN)
                    + ")");
                setIndex(-1);
                setRefresh(true);
            })
            .catch(error => {
                ReportError("CheckinListSubview.handleGenerate", error);
            })
    }

    const handleIndex = (newIndex: number): void => {
        if (newIndex === index) {
            console.info("CheckinListSubview.handleIndex(-1)");
            setIndex(-1);
        } else {
            const newCheckin: Checkin = checkins[index];
            console.info("CheckinListSubview.handleIndex("
                + newIndex + ", "
                + JSON.stringify(newCheckin, Replacers.CHECKIN)
                + ")");
            setIndex(newIndex);
            if (loginContext.validateScope("regular")) {
                if (props.handleCheckin) {
                    props.handleCheckin(newCheckin);
                }
            }
        }
    }

    const handleTemplate: HandleTemplate = (newTemplate) => {
        console.info("CheckinListSubview.handleTemplate("
            + JSON.stringify(newTemplate, Replacers.TEMPLATE)
            + ")");
        setTemplate(newTemplate);
    }

    const listFields = [
//        "matNumberAndFeatures",
        "matNumber",
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

    const onBack: OnClick = () => {
        props.handleStage(Stage.None);
    }

    return (

        <Container fluid id="CheckinListSubview">

            <>

                {/* Back Link */}
                <Row className="ml-1 mr-1 mb-3">
                    <Col className="text-right">
                        <Button
                            onClick={onBack}
                            size="sm"
                            type="button"
                            variant="primary"
                        >
                            Back
                        </Button>
                    </Col>
                </Row>

                {/* Generate From Template */}
                { (facility.id >= 0) && (checkins.length === 0) ? (
                    <Row className="mb-3 ml-2 col-12">
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
                        </Col>
                    </Row>
                ) : (
                    <span/>
                )}

                {/* Checkin List View */}
                <Row className="ml-2 mr-2">
                    <SimpleList
                        handleIndex={handleIndex}
                        items={checkins}
                        listFields={listFields}
                        listHeaders={listHeaders}
                        title={"Checkins for " +
                        (facility ? facility.name : "(Select)") +
                        " on " + props.checkinDate}
                    />
                </Row>

            </>

        </Container>

    )

}

export default CheckinListSubview;
