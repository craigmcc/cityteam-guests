// CheckinViewList -----------------------------------------------------------

// Second-level view for Checkins, listing all current Checkins for the
// selected date, and offering to generate Checkins if none exist yet.

// External Modules -----------------------------------------------------------

import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules -----------------------------------------------------------

import { Stage } from "./CheckinView";
import FacilityClient from "../clients/FacilityClient";
import { OnClick } from "../components/types";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import Template from "../models/Template";
import CheckinsSubview from "../subviews/CheckinsSubview";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";
import TemplateSelector, { HandleTemplate } from "../components/TemplateSelector";

// Incoming Properties --------------------------------------------------------

export type HandleSelectedCheckin = (checkin: Checkin | null) => void;
export type HandleStage = (stage: Stage) => void;

export interface Props {
    checkinDate?: string;           // Checkin date for which to process checkins,
                                    // or null if no checkin date is current
    facility: Facility;             // Facility for which we are processing checkins,
                                    // or (facility.id < 0) if no Facility is current
    handleSelectedCheckin: HandleSelectedCheckin;
                                    // Handle (checkin) when one is selected
                                    // or (null) when one is unselected
    handleStage: HandleStage;       // Handle (stage) when changing
    refresh?: boolean;              // Refresh checkins on first render? [false]
}

// Component Details ----------------------------------------------------------

const CheckinViewList = (props: Props) => {

    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [refresh, setRefresh] = useState<boolean>(true); // Including first time
    const [template, setTemplate] = useState<Template>(new Template());

    useEffect(() => {

        const fetchCheckins = async () => {

            // TODO - only need this to see if generate is necessary
            // TODO - maybe optimize to retrieve count only?
            // TODO - otherwise, fetch is repeated in CheckinsSubview
            try {
                if ((props.facility.id > 0) && props.checkinDate) {
                    const newCheckins: Checkin[] = await FacilityClient.checkinsAll
                        (props.facility.id, props.checkinDate);
                    console.info("CheckinViewList.fetchCheckins("
                        + JSON.stringify(newCheckins, Replacers.CHECKIN)
                        + ")");
                    setCheckins(newCheckins);
                } else {
                    setCheckins([]);
                }
                setRefresh(false);
            } catch (error) {
                setCheckins([]);
                ReportError("CheckinViewList.fetchCheckins", error);
            }

        }

        fetchCheckins();

    }, [props.checkinDate, props.facility, props.refresh, refresh])

    const handleGenerate = (): void => {
        console.info("CheckListSubview.handleGenerate.click("
            + JSON.stringify(template, Replacers.TEMPLATE)
            + ")");
        if ((template.id < 0) || (props.facility.id < 0) || !props.checkinDate) {
            return;
        }
        FacilityClient.checkinsGenerate(
            props.facility.id,
            props.checkinDate,
            template.id
        )
            .then(newCheckins => {
                console.info("CheckinViewList.handleGenerate.results("
                    + JSON.stringify(newCheckins, Replacers.CHECKIN)
                    + ")");
                setRefresh(true);
            })
            .catch(error => {
                ReportError("CheckinViewList.handleGenerate", error);
            })
    }

    const handleSelectedCheckin: HandleSelectedCheckin
        = (newCheckin) =>
    {
        if (newCheckin) {
            console.info("CheckinViewList.handleSelectedCheckin("
                + JSON.stringify(newCheckin, Replacers.CHECKIN)
                + ")");
            if (props.handleSelectedCheckin) {
                props.handleSelectedCheckin(newCheckin);
            }
        } else {
            console.info("CheckinViewList.handleSelectedCheckin(unselected)");
            if (props.handleSelectedCheckin) {
                props.handleSelectedCheckin(null);
            }
        }

    }

    const handleTemplate: HandleTemplate = (newTemplate) => {
        console.info("CheckinViewList.handleTemplate("
            + JSON.stringify(newTemplate, Replacers.TEMPLATE)
            + ")");
        setTemplate(newTemplate);
    }

    const onBack: OnClick = () => {
        props.handleStage(Stage.None);
    }

    return (

        <Container fluid id="CheckinViewList">

                {/* Back Link */}
                <Row className="ml-1 mr-1 mb-3">
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

                {/* Generate From Template */}
                { (props.facility.id >= 0) && (checkins.length === 0) ? (
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

                {/* Checkins Subview */}
                <CheckinsSubview
                    checkinDate={props.checkinDate}
                    facility={props.facility}
                    handleSelectedCheckin={handleSelectedCheckin}
                />

        </Container>

    )

}

export default CheckinViewList;
