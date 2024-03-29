// TemplatesSubview ----------------------------------------------------------

// Render a list of Templates for the current Facility, with a callback to
// handleSelect(template) when a particular Template is selected, or
// handleSelect(null) if a previously selected Template is unselected.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import { HandleIndex, HandleTemplateOptional } from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Facility from "../models/Facility";
import Template from "../models/Template";
import * as Abridgers from "../util/abridgers";
import logger from "../util/client-logger";
import ReportError from "../util/ReportError";

// Incoming Properties -------------------------------------------------------

export interface Props {
    handleSelect: HandleTemplateOptional;
                                    // Return selected (Template) for processing,
                                    // or null if previous selection was unselected
    title?: string;                 // Table title [Templates for {facility.name}]
}

// Component Details ---------------------------------------------------------

const TemplatesSubview = (props: Props) => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [facility, setFacility] = useState<Facility>(new Facility());
    const [index, setIndex] = useState<number>(-1);
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {

        const fetchTemplates = async () => {

            // Establish the currently selected Facility
            let currentFacility: Facility;
            if (facilityContext.facility) {
                currentFacility = facilityContext.facility;
            } else {
                currentFacility = new Facility({ id: -1, name: "(Select Facility)"});
            }
            setFacility(currentFacility);
            logger.debug({
                context: "TemplatesSubview.setFacility",
                facility: Abridgers.FACILITY(currentFacility),
            });

            // Fetch Templates for this Facility (if any)
            if ((currentFacility.id >= 0) && loginContext.loggedIn) {
                try {
                    const newTemplates: Template[] =
                        await FacilityClient.templatesAll(currentFacility.id);
                    setIndex(-1);
                    setTemplates(newTemplates);
                    logger.debug({
                        context: "TemplatesSubview.fetchTemplates",
                        count: newTemplates.length,
                    });
                } catch (error) {
                    setIndex(-1);
                    setTemplates([]);
                    // @ts-ignore
                    if (error.response && (error.response.status === 403)) {
                        logger.debug({
                            context: "TemplatesSubview.fetchTemplates",
                            msg: "FORBIDDEN",
                        });
                    } else {
                        ReportError("TemplatesSubview.fetchTemplates", error);
                    }
                }
            } else {
                setIndex(-1);
                setTemplates([]);
                logger.debug({
                    context: "TemplatesSubview.fetchTemplates",
                    msg: "SKIPPED",
                });
            }

        }

        fetchTemplates();

    }, [facilityContext, loginContext.loggedIn]);

    const handleIndex: HandleIndex = (newIndex) => {
        if (newIndex === index) {
            setIndex(-1);
            logger.trace({ context: "TemplatesSubview.handleIndex", msg: "UNSET" });
            if (props.handleSelect) {
                props.handleSelect(null);
            }
        } else {
            const newTemplate = templates[newIndex];
            setIndex(newIndex);
            logger.debug({
                context: "TemplatesSubview.handleIndex",
                index: newIndex,
                template: Abridgers.TEMPLATE(newTemplate),
            });
            if (props.handleSelect) {
                props.handleSelect(newTemplate);
            }
        }
    }

    const listFields = [
        "name",
        "active",
        "comments",
        "allMats",
        "handicapMats",
        "socketMats",
        "workMats",
    ]

    const listHeaders = [
        "Name",
        "Active",
        "Comments",
        "All Mats",
        "Handicap Mats",
        "Socket Mats",
        "Work Mats"
    ]

    return (

        <Container fluid id="TemplatesSubview">
            <Row>
                <SimpleList
                    handleIndex={handleIndex}
                    items={templates}
                    listFields={listFields}
                    listHeaders={listHeaders}
                    title={props.title ? props.title : `Templates for ${facility.name}`}
                />
            </Row>
        </Container>

    )

}

export default TemplatesSubview;
