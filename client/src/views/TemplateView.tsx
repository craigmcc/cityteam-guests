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
import { HandleIndex, HandleTemplate, Scopes } from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import TemplateForm from "../forms/TemplateForm";
import Facility from "../models/Facility";
import Template from "../models/Template";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const TemplateView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canAdd, setCanAdd] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [index, setIndex] = useState<number>(-1);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [template, setTemplate] = useState<Template | null>(null);
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
            console.info("TemplateView.setFacility("
                + JSON.stringify(currentFacility, Replacers.FACILITY)
                + ")");
            setFacility(currentFacility);

            // Select the relevant Templates for this Facility
            if (currentFacility.id >= 0) {
                try {
                    const newTemplates: Template[]
                        = await FacilityClient.templatesAll(currentFacility.id);
                    console.info("TemplateView.fetchTemplates("
                        + JSON.stringify(newTemplates, Replacers.TEMPLATE)
                        + ")");
                    setTemplates(newTemplates);
                } catch (error) {
                    setTemplates([]);
                    ReportError("TemplateView.fetchTemplates", error);
                }
            } else {
                setTemplates([]);
            }

            // Record current permissions
            const isAdmin = loginContext.validateScope(Scopes.ADMIN);
            setCanAdd(isAdmin);
            setCanEdit(isAdmin);
            setCanRemove(loginContext.validateScope(Scopes.SUPERUSER));

            // Reset refresh flag if necessary
            if (refresh) {
                setRefresh(false);
            }

        }

        fetchTemplates();

    }, [facilityContext, loginContext, refresh]);

    const handleIndex: HandleIndex = (newIndex) => {
        if (newIndex === index) {
            console.info("TemplateView.handleIndex(UNSET)");
            setIndex(-1);
            setTemplate(null);
        } else if (canEdit) {
            console.info("TemplateView.handleIndex(CAN EDIT, "
                + newIndex + ", "
                + JSON.stringify(templates[newIndex], Replacers.TEMPLATE)
                + ")");
            setIndex(newIndex)
            setTemplate(templates[newIndex]);
        } else {
            console.info("TemplateView.handleIndex(CANNOT EDIT, "
                + newIndex + ", "
                + JSON.stringify(templates[newIndex], Replacers.TEMPLATE)
                + ")");
        }
    }

    const handleInsert: HandleTemplate = async (newTemplate) => {
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

    const handleRemove: HandleTemplate = async (newTemplate) => {
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

    const handleUpdate: HandleTemplate = async (newTemplate) => {
        try {
            const updated: Template = await FacilityClient.templatesUpdate
                (facility.id, newTemplate.id, newTemplate);
            console.info("TemplateView.handleUpdate("
                + JSON.stringify(updated, Replacers.TEMPLATE)
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
        setIndex(-1);
        const newTemplate: Template = new Template({
            facilityId: facility.id,
            id: -1
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
                                title={`Templates for ${facility.name}`}
                            />
                        </Row>

                        <Row className="ml-1 mr-1">
                            <Button
                                disabled={!canAdd}
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
                                canRemove={canRemove}
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
