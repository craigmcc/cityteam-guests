// TemplateSelector ----------------------------------------------------------

// Selector drop-down to choose which Template the user wants to interact with.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";

// Internal Modules ----------------------------------------------------------

import { OnChangeSelect } from "./types";
import FacilityClient from "../clients/FacilityClient";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Facility from "../models/Facility";
import Template from "../models/Template";
import * as Abridgers from "../util/abridgers";
import logger from "../util/client-logger";
import ReportError from "../util/ReportError";

// Incoming Properties -------------------------------------------------------

export type HandleTemplate = (template: Template) => void;

export interface Props {
    all?: boolean;                  // Select all (vs. active) templates? [false]
    autoFocus?: boolean;            // Should element receive autoFocus? [false]
    disabled?: boolean;             // Should element be disabled? [false]
    handleTemplate?: HandleTemplate;// Handle (template) selection [no handler]
    label?: string;                 // Element label [Template:]
}

// Component Details ---------------------------------------------------------

const TemplateSelector = (props: Props) => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [index, setIndex] = useState<number>(-1);
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {

        const fetchTemplates = async () => {

            const newFacility = facilityContext.index >= 0
                ? facilityContext.facilities[facilityContext.index]
                : new Facility({ name: "(Select)" });
            logger.debug({
                context: "TemplateSelector.fetchTemplates",
                facility: Abridgers.FACILITY(newFacility),
            });

            try {
                if ((newFacility.id > 0) && loginContext.loggedIn) {
                    const newTemplates: Template[] = props.all
                        ? await FacilityClient.templatesAll(newFacility.id)
                        : await FacilityClient.templatesActive(newFacility.id);
                    logger.debug({
                        context: "TemplateSelector.fetchTemplates",
                        count: newTemplates.length,
                    });
                    setTemplates(newTemplates);
                } else {
                    logger.debug({
                        context: "TemplateSelector.fetchTemplates",
                        msg: "SKIPPED",
                    });
                    setTemplates([]);
                }
            } catch (error) {
                if (error.response && (error.response.status === 403)) {
                    logger.debug({
                        context: "TemplateSelector.fetchTemplates",
                        msg: "FORBIDDEN",
                    });
                } else {
                    setTemplates([]);
                    ReportError("TemplateSelector.fetchTemplates", error);
                }
            }

        }

        fetchTemplates();

    }, [facilityContext, props.all, loginContext.loggedIn]);

    const onChange: OnChangeSelect = (event) => {
        const newIndex: number = parseInt(event.target.value);
        const newTemplate: Template = (newIndex >= 0)
            ? templates[newIndex]
            : new Template({ active: false, id: -1, name: "Unselected" });
        logger.debug({
            context: "TemplateSelector.onChange",
            index: newIndex,
            template: {
                id: newTemplate.id,
                name: newTemplate.name,
            },
        });
        setIndex(newIndex);
        if ((newIndex >= 0) && props.handleTemplate) {
            props.handleTemplate(newTemplate);
        }
    }

    return (

        <>
            <Form inline>
                <Form.Group>
                    <Form.Label  className="mr-2" htmlFor="templateSelector">
                        {props.label ? props.label : "Template:"}
                    </Form.Label>
                    <Form.Control
                        as="select"
                        autoFocus={props.autoFocus ? props.autoFocus : undefined}
                        disabled={props.disabled ? props.disabled : undefined}
                        id="templateSelector"
                        onChange={onChange}
                        size="sm"
                        value={index}
                    >
                        <option key="-1" value="-1">(Select)</option>
                        {templates.map((template, index) => (
                            <option key={index} value={index}>
                                {template.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
            </Form>
        </>

    )

}

export default TemplateSelector;
