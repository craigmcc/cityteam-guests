// TemplateView --------------------------------------------------------------

// Administrator view for editing Template objects.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import TemplateForm, { HandleTemplate } from "../forms/TemplateForm";
import Facility from "../models/Facility";
import Template from "../models/Template";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const TemplateView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [facility, setFacility] = useState<Facility>(new Facility());
    const [index, setIndex] = useState<number>(-1);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [template, setTemplate] = useState<Template | null>(null);
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {

        const fetchTemplates = async () => {

            const newFacility = facilityContext.index >= 0
                ? facilityContext.facilities[facilityContext.index]
                : new Facility({ name: "(Select)" });
            console.info("TemplateView.setFacility("
                + JSON.stringify(newFacility, Replacers.FACILITY)
                + ")");
            setFacility(newFacility);

            try {
                if (newFacility.id > 0) {
                    const newTemplates: Template[]
                        = await FacilityClient.templatesAll(newFacility.id);
                    console.info("TemplateView.fetchTemplates("
                        + JSON.stringify(newTemplates, Replacers.TEMPLATE)
                        + ")");
                    setTemplates(newTemplates);
                } else {
                    setTemplates([]);
                }
                setRefresh(false);
            } catch (error) {
                setTemplates([]);
                ReportError("TemplateView.fetchTemplates", error);
            }

        }

        fetchTemplates();

    }, [facilityContext, refresh]);

    const addEnabled = (): boolean => {
        return loginContext.validateScope("admin");
    }

    const handleIndex = (newIndex: number): void => {
        if (newIndex === index) {
            console.info("TemplateView.handleIndex(-1)");
            setIndex(-1);
            setTemplate(null);
        } else {
            console.info("TemplateView.handleIndex("
                + newIndex + ", "
                + JSON.stringify(templates[newIndex], Replacers.TEMPLATE)
                + ")");
            if (loginContext.validateScope("admin")) {
                setTemplate(templates[newIndex]);
            }
            setIndex(newIndex)
        }
    }

    const handleInsert: HandleTemplate
        = async (newTemplate) =>
    {
        try {
            const inserted: Template
                = await FacilityClient.templatesInsert(facility.id, newTemplate);
            console.info("TemplateView.handleInsert("
                + JSON.stringify(inserted, Replacers.TEMPLATE)
                + ")");
            setIndex(-1);
            setRefresh(true);
            setTemplate(null);
        } catch (error) {
            ReportError("TemplateView.handleInsert", error);
        }
    }

    const handleRemove: HandleTemplate
        = async (newTemplate) => {
        try {
            const removed: Template
                = await FacilityClient.templatesRemove(facility.id, newTemplate.id);
            console.info("TemplateView.handleRemove("
                + JSON.stringify(removed, Replacers.TEMPLATE)
                + ")");
            setIndex(-1);
            setRefresh(true);
            setTemplate(null);
        } catch (error) {
            ReportError("TemplateView.handleRemove", error);
        }
    }

    const handleUpdate: HandleTemplate
        = async (newTemplate) => {
        try {
            const removed: Template = await FacilityClient.templatesUpdate
                (facility.id, newTemplate.id, newTemplate);
            console.info("TemplateView.handleUpdate("
                + JSON.stringify(removed, Replacers.TEMPLATE)
                + ")");
            setIndex(-1);
            setRefresh(true);
            setTemplate(null);
        } catch (error) {
            ReportError("TemplateView.handleUpdate", error);
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

    const onAdd = () => {
        console.info("TemplateView.onAdd()");
        setIndex(-2);
        const newTemplate: Template = new Template({
            facilityId: facility.id,
            id: -2
        });
        setTemplate(newTemplate);
    }

    const onBack = () => {
        console.info("TemplateView.onBack()");
        setIndex(-1);
        setTemplate(null);
    }

    return (
        <>
            <Container fluid id="TemplateView">

                {(!template) ? (
                    <>

                        {/* List View */}

                        <Row className="mb-3 ml-1 mr-1">
                            <SimpleList
                                handleIndex={handleIndex}
                                items={templates}
                                listFields={listFields}
                                listHeaders={listHeaders}
                                title={"Templates for " +
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

                {(template) ? (

                    <>

                        <Row className="ml-1 mr-1 mb-3">
                            <Col className="text-left">
                                <strong>
                                    <>
                                        {(template.id < 0) ? (
                                            <span>Adding New</span>
                                        ) : (
                                            <span>Editing Existing</span>
                                        )}
                                        &nbsp;Template
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
                            <TemplateForm
                                autoFocus
                                handleInsert={handleInsert}
                                handleRemove={handleRemove}
                                handleUpdate={handleUpdate}
                                template={template}
                            />
                        </Row>

                    </>

                ) : null }

            </Container>
        </>
    )

}

export default TemplateView;
