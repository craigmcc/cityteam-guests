// FacilityForm --------------------------------------------------------------

// Detail editing form for Facility objects.

// External Modules -----------------------------------------------------------

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
import Facility from "../models/Facility";
import {
    validateFacilityNameUnique,
    validateFacilityScopeUnique,
} from "../util/async-validators";
import { toEmptyStrings, toNullValues } from "../util/transformations";
import {
    validateEmail, validatePhone, validateState, validateZipCode
} from "../util/validators";

export type HandleFacility = (facility : Facility) => void;

// Property Details ----------------------------------------------------------

export interface Props {
    autoFocus?: boolean;            // Should the first element receive autofocus? [false]
    facility: Facility;             // Initial values (id<0 for adding)
    handleInsert: HandleFacility;   // Handle (facility) insert request
    handleRemove: HandleFacility;   // Handle (facility) remove request
    handleUpdate: HandleFacility;   // Handle (facility) update request
}

// Component Details ---------------------------------------------------------

const FacilityForm = (props: Props) => {

    const loginContext = useContext(LoginContext);

    const [adding] = useState<boolean>(props.facility.id < 0);
    const [initialValues] = useState(toEmptyStrings(props.facility));
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [superuser] = useState<boolean>(loginContext.validateScope("superuser"));

    const handleSubmit = (values: FormikValues, actions: FormikHelpers<FormikValues>): void => {
        if (adding) {
            props.handleInsert(toFacility(values));
        } else {
            props.handleUpdate(toFacility(values));
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
        props.handleRemove(props.facility);
    }

    const toFacility = (values: FormikValues): Facility => {
        const results = toNullValues(values);
        return new Facility({
            active: results.active,
            address1: results.address1,
            address2: results.address2,
            city: results.city,
            email: results.email,
            id: props.facility.id,
            name: results.name,
            phone: results.phone,
            scope: results.scope,
            state: results.state,
            zipCode: results.zipCode,
        });
    }

    const validationSchema = () => {
        return Yup.object().shape({
            active: Yup.boolean(),
            address1: Yup.string(),
            address2: Yup.string(),
            city: Yup.string(),
            email: Yup.string()
                .test("valid-email",
                    "Invalid email format",
                    function (value) {
                        return validateEmail(value ? value : "");
                    }),
            name: Yup.string()
                .required("Name is required")
                .test("unique-name",
                    "That name is already in use",
                    async function (this) {
                        return await validateFacilityNameUnique(toFacility(this.parent));
                    }
                ),
            phone: Yup.string()
                .test("valid-phone",
                    "Invalid phone number format",
                    function (value) {
                        return validatePhone(value ? value : "");
                    }),
            scope: Yup.string()
                .required("Scope is required")
                .test("unique-scope",
                    "That scope is already in use",
                     async function (this) {
                        return await validateFacilityScopeUnique(toFacility(this.parent));
                    }
                ),
            state: Yup.string()
                .test("valid-state",
                    "Invalid state abbreviation",
                    function(value) {
                        return validateState(value ? value : "");
                    }),
            zipCode: Yup.string()
                .test("valid-zip-code",
                    "Invalid zip code format",
                    function(value) {
                        return validateZipCode(value ? value : "");
                    }),
        });
    }

    return (

        <>

            {/* Details Form */}
            <Container id="FacilityForm">

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
                            className="mx-auto"
                            noValidate
                            onSubmit={handleSubmit}
                        >

                            <Form.Row id="nameActiveScopeRow">
                                <Form.Group as={Row} className="mr-4"
                                            controlId="name" id="nameGroup">
                                    <Form.Label>Name:</Form.Label>
                                    <Form.Control
                                        autoFocus={props.autoFocus ? props.autoFocus : undefined}
                                        htmlSize={25}
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
                                <Form.Group as={Row}
                                            controlId="scope" id="scopeGroup">
                                    <Form.Label>Scope:</Form.Label>
                                    <Form.Control
                                        htmlSize={10}
                                        isInvalid={touched.scope && !!errors.scope}
                                        isValid={!errors.scope}
                                        name="scope"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.scope}
                                    />
                                    <Form.Control.Feedback type="valid">
                                        Scope is required and must be unique.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.scope}
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

                            <Form.Row id="addressRow">
                                <Form.Group as={Row} className="mr-4"
                                            controlId="address1" id="address1Group">
                                    <Form.Label>Address 1:</Form.Label>
                                    <Form.Control
                                        htmlSize={25}
                                        isInvalid={touched.address1 && !!errors.address1}
                                        isValid={!errors.address1}
                                        name="address1"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.address1}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.address1}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Row} controlId="address2" id="address2Group">
                                    <Form.Label>Address 2:</Form.Label>
                                    <Form.Control
                                        htmlSize={25}
                                        isInvalid={touched.address2 && !!errors.address2}
                                        isValid={!errors.address2}
                                        name="address2"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.address2}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.address2}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row id="cityStateZipRow">
                                <Form.Group as={Row} className="mr-4"
                                            controlId="city" id="cityGroup">
                                    <Form.Label>City:</Form.Label>
                                    <Form.Control
                                        htmlSize={25}
                                        isInvalid={touched.city && !!errors.city}
                                        isValid={!errors.city}
                                        name="city"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.city}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.city}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Row} className="mr-4"
                                            controlId="state" id="stateGroup">
                                    <Form.Label>State:</Form.Label>
                                    <Form.Control
                                        htmlSize={2}
                                        isInvalid={touched.state && !!errors.state}
                                        isValid={!errors.state}
                                        name="state"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.state}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.state}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Row} controlId="zipCode" id="zipCodeGroup">
                                    <Form.Label>Zip Code:</Form.Label>
                                    <Form.Control
                                        htmlSize={10}
                                        isInvalid={touched.zipCode && !!errors.zipCode}
                                        isValid={!errors.zipCode}
                                        name="zipCode"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.zipCode}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.zipCode}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row id="emailPhoneRow">
                                <Form.Group as={Row} className="mr-4"
                                            controlId="email" id="emailGroup">
                                    <Form.Label>Email:</Form.Label>
                                    <Form.Control
                                        htmlSize={30}
                                        isInvalid={touched.email && !!errors.email}
                                        isValid={!errors.email}
                                        name="email"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Row} controlId="phone" id="phoneGroup">
                                    <Form.Label>Phone:</Form.Label>
                                    <Form.Control
                                        htmlSize={30}
                                        isInvalid={touched.phone && !!errors.phone}
                                        isValid={!errors.phone}
                                        name="phone"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.phone}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.phone}
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
                        Removing this Facility is not reversible, and
                        <strong>
                            &nbsp;will also remove ALL related information.
                        </strong>.
                    </p>
                    <p>Consider marking this Facility as inactive instead.</p>
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

export default FacilityForm;
