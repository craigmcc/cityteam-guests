// TemplateView --------------------------------------------------------------

// Administrator view for editing Template objects.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import TemplateForm, { HandleTemplate } from "../forms/TemplateForm";
import Facility from "../models/Facility";
import Template from "../models/Template";
import * as Replacers from "../util/Replacers";
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
                    console.info("TemplateView.fetchData("
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

    const value = (value: any): string => {
        if (typeof(value) === "boolean") {
            return value ? "Yes" : "No"
        } else if (!value) {
            return "";
        } else {
            return value;
        }
    }

    const values = (template: Template): string[] => {
        let results: string[] = [];
        results.push(value(template.name));
        results.push(value(template.active));
        results.push(value(template.comments));
        results.push(value(template.allMats));
        results.push(value(template.handicapMats));
        results.push(value(template.socketMats));
        results.push(value(template.workMats));
        return results;
    }

    return (
        <>
            <Container fluid id="TemplateView">

                {(!template) ? (
                    <>

                        {/* List View */}
                        <Row className="mb-3 ml-1 mr-1">
                            <Table
                                bordered
                                hover
                                size="sm"
                                striped
                            >

                                <thead>
                                    <tr className="table-dark" key={100}>
                                        <th
                                            className="text-center"
                                            colSpan={7}
                                            key={101}
                                        >
                                            Templates for {facility ? facility.name : "(Select)"}
                                        </th>
                                    </tr>
                                    <tr className="table-secondary" key={102}>
                                        {listHeaders.map((header, index) => (
                                            <th key={200 + index + 1} scope="col">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                {templates.map((template, rowIndex) => (
                                    <tr
                                        className={"table-" +
                                        (rowIndex === index ? "primary" : "default")}
                                        key={1000 + (rowIndex * 100)}
                                        onClick={() => (handleIndex(rowIndex))}
                                    >
                                        {values(template).map((value: string, colIndex: number) => (
                                            <td
                                                data-key={1000 + (rowIndex * 100) + colIndex + 1}
                                                key={1000 + (rowIndex * 100) + colIndex + 1}
                                            >
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>

                            </Table>
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
