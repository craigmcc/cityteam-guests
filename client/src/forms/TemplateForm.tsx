// TemplateForm --------------------------------------------------------------

// Detail editing form for Template objects.

// External Modules ----------------------------------------------------------

import React, {useContext, useState} from "react";
import { Formik, FormikHelpers, FormikValues } from "formik";
import Button from "react-bootstrap/button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import * as Yup from "yup";

// Internal Modules ----------------------------------------------------------

import LoginContext from "../contexts/LoginContext";
import Template from "../models/Template";
import {
    validateTemplateNameUnique,
} from "../util/async-validators";
import { toEmptyStrings, toNullValues } from "../util/transformations";
import {
    validateMatsList, validateMatsSubset
} from "../util/application-validators";

export type HandleTemplate = (template: Template) => void;

// Property Details ----------------------------------------------------------

export interface Props {
    autoFocus?: boolean;            // Should the first element receive autofocus? [false]
    handleInsert: HandleTemplate;   // Handle (template) insert request
    handleRemove: HandleTemplate;   // Handle (template) remove request
    handleUpdate: HandleTemplate;   // Handle (template) update request
    template: Template;             // Initial values (id<0 for adding)
}

// Component Details ---------------------------------------------------------

const TemplateForm = (props: Props) => {

    const loginContext = useContext(LoginContext);

    const [adding] = useState<boolean>(props.template.id < 0);
    const [initialValues] = useState(toEmptyStrings(props.template));
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [superuser] = useState<boolean>(loginContext.validateScope("superuser"));

    const handleSubmit = (values: FormikValues, actions: FormikHelpers<FormikValues>): void => {
        if (adding) {
            props.handleInsert(toTemplate(values));
        } else {
            props.handleUpdate(toTemplate(values));
        }
    }

    const onConfirm = (): void => {
        setShowConfirm(true);
    }

    const onConfirmNegative = (): void => {
        setShowConfirm(false);
    }

    const onConfirmPositive = (): void => {
        setShowConfirm(false);
        props.handleRemove(props.template)
    }

    const toTemplate = (values: FormikValues): Template => {
        const results = toNullValues(values);
        return new Template({
            active: results.active,
            allMats: results.allMats,
            comments: results.comments,
            facilityId: props.template.facilityId,
            handicapMats: results.handicapMats,
            id: props.template.id,
            name: results.name,
            socketMats: results.socketMats,
            workMats: results.workMats
        });
    }

    const validationSchema = () => {
        return Yup.object().shape({
            active: Yup.boolean(),
            allMats: Yup.string()
                .required("All Mats is required")
                .test("valid-all-mats",
                    "Invalid mats list format",
                    function (value) {
                        return validateMatsList(value ? value : "");
                    }),
            comments: Yup.string(),
            handicapMats: Yup.string()
                .test("valid-handicap-mats",
                    "Invalid mats list format",
                    function (value) {
                        return validateMatsList(value ? value : "");
                    })
                .test("subset-handicap-mats",
                    "Not a subset of all mats",
                    function (this) {
                        return validateMatsSubset
                            (this.parent.allMats, this.parent.handicapMats)
                    }),
            name: Yup.string()
                .required("Name is required")
                .test("unique-name",
                    "That name is already in use within this Facility",
                    async function (this) {
                        return await validateTemplateNameUnique(toTemplate(this.parent));
                    }
                ),
            socketMats: Yup.string()
                .test("valid-socket-mats",
                    "Invalid mats list format",
                    function (value) {
                        return validateMatsList(value ? value : "");
                    })
                .test("subset-socket-mats",
                    "Not a subset of all mats",
                    function (this) {
                        return validateMatsSubset
                            (this.parent.allMats, this.parent.socketMats)
                    }),
            workMats: Yup.string()
                .test("valid-work-mats",
                    "Invalid mats list format",
                    function (value) {
                        return validateMatsList(value ? value : "");
                    })
                .test("subset-work-mats",
                    "Not a subset of all mats",
                    function (this) {
                        return validateMatsSubset
                            (this.parent.allMats, this.parent.workMats)
                    })
        })
    }

    return (

        <>

            {/* Details Form */}
            <Container id="templateForm">

                <Formik
                    initialValues={initialValues}
                    onSubmit={(values, actions) => {
                        handleSubmit(values, actions);
                    }}
                    validateOnBlur={true}
                    validateOnChange={false}
                    validationSchema={validationSchema}
                >

                    {( {
                           errors,
                           handleBlur,
                           handleChange,
                           handleSubmit,
                           isSubmitting,
                           isValid,
                           touched,
                           values,
                       }) => (

                            <Form
                                className={"mx-auto"}
                                noValidate
                                onSubmit={handleSubmit}
                            >

                                <Form.Row id="nameActiveRow">
                                    <Form.Group as={Row} className="mr-4"
                                                controlId="name" id="nameGroup">
                                        <Form.Label>Name:</Form.Label>
                                        <Form.Control
                                            autoFocus={props.autoFocus}
                                            htmlSize={50}
                                            isInvalid={touched.name && !!errors.name}
                                            isValid={!errors.name}
                                            name="name"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            size="sm"
                                            type="text"
                                            value={values.name}
                                        />
                                        <Form.Control.Feedback type="valid">
                                            Name is required and must be unique.
                                        </Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.name}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Row} controlId="active" id="activeGroup">
                                        <Form.Check
                                            feedback={errors.active}
                                            defaultChecked={values.active}
                                            id="active"
                                            label="Active?"
                                            name="active"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                </Form.Row>

                                <Form.Row id="commentsRow">
                                    <Form.Group as={Row} className="mr-4"
                                                controlId="name" id="commentsGroup">
                                        <Form.Label>Comments:</Form.Label>
                                        <Form.Control
                                            htmlSize={50}
                                            isInvalid={touched.comments && !!errors.comments}
                                            isValid={!errors.comments}
                                            name="comments"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            size="sm"
                                            type="text"
                                            value={values.comments}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.comments}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Row>

                                <Form.Row id="allMatsRow">
                                    <Form.Group as={Row} className="mr-4"
                                                controlId="name" id="allMatsGroup">
                                        <Form.Label>All Mats:</Form.Label>
                                        <Form.Control
                                            htmlSize={50}
                                            isInvalid={touched.allMats && !!errors.allMats}
                                            isValid={!errors.allMats}
                                            name="allMats"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            size="sm"
                                            type="text"
                                            value={values.allMats}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.allMats}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Row>

                                <Form.Row id="handicapMatsRow">
                                    <Form.Group as={Row} className="mr-4"
                                                controlId="name" id="handicapMatsGroup">
                                        <Form.Label>Handicap Mats:</Form.Label>
                                        <Form.Control
                                            htmlSize={50}
                                            isInvalid={touched.handicapMats && !!errors.handicapMats}
                                            isValid={!errors.handicapMats}
                                            name="handicapMats"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            size="sm"
                                            type="text"
                                            value={values.handicapMats}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.handicapMats}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Row>

                                <Form.Row id="socketMatsRow">
                                    <Form.Group as={Row} className="mr-4"
                                                controlId="name" id="socketMatsGroup">
                                        <Form.Label>Socket Mats:</Form.Label>
                                        <Form.Control
                                            htmlSize={50}
                                            isInvalid={touched.socketMats && !!errors.socketMats}
                                            isValid={!errors.socketMats}
                                            name="socketMats"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            size="sm"
                                            type="text"
                                            value={values.socketMats}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.socketMats}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Row>

                                <Form.Row id="workMatsRow">
                                    <Form.Group as={Row} className="mr-4"
                                                controlId="name" id="workMatsGroup">
                                        <Form.Label>Work Mats:</Form.Label>
                                        <Form.Control
                                            htmlSize={50}
                                            isInvalid={touched.workMats && !!errors.workMats}
                                            isValid={!errors.workMats}
                                            name="workMats"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            size="sm"
                                            type="text"
                                            value={values.workMats}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.workMats}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Row>

                                <Row className="mb-3">
                                    <Col className="col-10">
                                        <Button
                                            disabled={isSubmitting}
                                            size="sm"
                                            type="submit"
                                            variant="primary"
                                        >
                                            Save
                                        </Button>
                                    </Col>
                                    <Col className="col-2 float-right">
                                        <Button
                                            disabled={adding || !superuser}
                                            onClick={onConfirm}
                                            size="sm"
                                            type="button"
                                            variant="danger"
                                        >
                                            Remove
                                        </Button>
                                    </Col>
                                </Row>

                            </Form>

                       )}

                    </Formik>

            </Container>

            {/* Remove Confirm Modal */}
            <Modal
                animation={false}
                backdrop="static"
                centered
                dialogClassName="bg-danger"
                onHide={onConfirmNegative}
                show={showConfirm}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>WARNING:  Potential Data Loss</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Removing this Template is not reversible, and
                        <strong>
                            &nbsp;will also remove ALL related information.
                        </strong>.
                    </p>
                    <p>Consider marking this Template as inactive instead.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={onConfirmPositive}
                        size="sm"
                        type="button"
                        variant="danger"
                    >
                        Remove
                    </Button>
                    <Button
                        onClick={onConfirmNegative}
                        size="sm"
                        type="button"
                        variant="primary"
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

        </>

    )

}

export default TemplateForm;
