// TemplatesView --------------------------------------------------------------

// Administrator view for listing and editing Templates.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import { HandleTemplate, HandleTemplateOptional, Scopes } from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import TemplateForm from "../forms/TemplateForm";
import Facility from "../models/Facility";
import Template from "../models/Template";
import TemplatesSubview from "../subviews/TemplatesSubview";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const TemplatesView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canAdd, setCanAdd] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [refresh, setRefresh] = useState<boolean>(false);
    const [template, setTemplate] = useState<Template | null>(null);

    useEffect(() => {

        const fetchTemplates = async () => {

            // Establish the currently selected Facility
            let currentFacility: Facility;
            if (facilityContext.facility) {
                currentFacility = facilityContext.facility;
            } else {
                currentFacility = new Facility({ id: -1, name: "(Select Facility)"});
            }
            console.info("TemplatesView.setFacility("
                + JSON.stringify(currentFacility, Replacers.FACILITY)
                + ")");
            setFacility(currentFacility);

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

    }, [facilityContext, loginContext, facility.id, refresh]);

    const handleInsert: HandleTemplate = async (newTemplate) => {
        try {
            const inserted: Template
                = await FacilityClient.templatesInsert(facility.id, newTemplate);
            console.info("TemplatesView.handleInsert("
                + JSON.stringify(inserted, Replacers.TEMPLATE)
                + ")");
            setRefresh(true);
            setTemplate(null);
        } catch (error) {
            ReportError("TemplatesView.handleInsert", error);
        }
    }

    const handleRemove: HandleTemplate = async (newTemplate) => {
        try {
            const removed: Template
                = await FacilityClient.templatesRemove(facility.id, newTemplate.id);
            console.info("TemplatesView.handleRemove("
                + JSON.stringify(removed, Replacers.TEMPLATE)
                + ")");
            setRefresh(true);
            setTemplate(null);
        } catch (error) {
            ReportError("TemplatesView.handleRemove", error);
        }
    }

    const handleSelect: HandleTemplateOptional = (newTemplate) => {
        if (newTemplate) {
            if (canEdit) {
                console.info("TemplatesView.handleSelect(CAN EDIT, "
                    + JSON.stringify(newTemplate, Replacers.TEMPLATE)
                    + ")");
                setTemplate(newTemplate);
            } else {
                console.info("TemplatesView.handleSelect(CANNOT EDIT, "
                    + JSON.stringify(newTemplate, Replacers.TEMPLATE)
                    + ")");
            }
        } else {
            console.info("TemplatesView.handleSelect(UNSET)");
            setTemplate(null);
        }
    }

    const handleUpdate: HandleTemplate = async (newTemplate) => {
        try {
            const updated: Template = await FacilityClient.templatesUpdate
                (facility.id, newTemplate.id, newTemplate);
            console.info("TemplatesView.handleUpdate("
                + JSON.stringify(updated, Replacers.TEMPLATE)
                + ")");
            setRefresh(true);
            setTemplate(null);
        } catch (error) {
            ReportError("TemplatesView.handleUpdate", error);
        }
    }

    const onAdd = () => {
        console.info("TemplatesView.onAdd()");
        const newTemplate: Template = new Template({
            facilityId: facility.id,
            id: -1
        });
        setTemplate(newTemplate);
    }

    const onBack = () => {
        console.info("TemplatesView.onBack()");
        setTemplate(null);
    }

    return (
        <>
            <Container fluid id="TemplatesView">

                {/* List View */}
                {(!template) ? (

                    <>

                        <Row className="ml-1 mr-1 mb-3">
                            <TemplatesSubview
                                handleSelect={handleSelect}
                            />
                        </Row>

                        <Row className="ml-4">
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

                {/* Detail View */}
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

                        <Row>
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

export default TemplatesView;
