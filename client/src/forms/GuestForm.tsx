// GuestForm --------------------------------------------------------------

// Detail editing form for Guest objects.

// External Modules ----------------------------------------------------------

import React, { useState } from "react";
import { Formik, FormikHelpers, FormikValues } from "formik";
import Button from "react-bootstrap/button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import * as Yup from "yup";

// Internal Modules ----------------------------------------------------------

import { HandleGuest } from "../components/types";
import Guest from "../models/Guest";
import { validateGuestNameUnique } from "../util/async-validators";
import { toEmptyStrings, toNullValues } from "../util/transformations";

// Property Details ----------------------------------------------------------

export interface Props {
    autoFocus?: boolean;         // Should the first element receive autofocus? [false]
    canRemove?: boolean;        // Can Remove be performed? [false]
    guest: Guest;                // Initial values (id<0 for adding)
    handleInsert?: HandleGuest;  // Handle (guest) insert request
    handleRemove?: HandleGuest;  // Handle (guest) remove request
    handleUpdate?: HandleGuest;  // Handle (guest) update request
}

// Component Details ---------------------------------------------------------

const GuestForm = (props: Props) => {

    const [adding] = useState<boolean>(props.guest.id < 0);
    const [canRemove] = useState<boolean>
        (props.canRemove !== undefined ? props.canRemove : false);
    const [initialValues] = useState(toEmptyStrings(props.guest));
    const [showConfirm, setShowConfirm] = useState<boolean>(false);

    const handleSubmit = (values: FormikValues, actions: FormikHelpers<FormikValues>): void => {
        if (adding) {
            if (props.handleInsert) {
                props.handleInsert(toGuest(values));
            }
        } else {
            if (props.handleUpdate) {
                props.handleUpdate(toGuest(values));
            }
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
        if (props.handleRemove) {
            props.handleRemove(props.guest)
        }
    }

    const toGuest = (values: FormikValues): Guest => {
        const nulled = toNullValues(values);
        const result = new Guest({
            active: nulled.active,
            comments: nulled.comments,
            facilityId: props.guest.facilityId,
            favorite: nulled.favorite,
            firstName: nulled.firstName,
            id: props.guest.id,
            lastName: nulled.lastName,
        });
        if (nulled.active !== undefined) {
            result.active = nulled.active;
        }
        return result;
    }

    const validationSchema = () => {
        return Yup.object().shape({
            active: Yup.boolean(),
            comments: Yup.string(),
            favorite: Yup.number(),
            firstName: Yup.string()
                .required("First Name is required"),
            lastName: Yup.string()
                .required("Last Name is required")
                .test("unique-name",
                    "That name is already in use within this Facility",
                    async function (this) {
                        return await validateGuestNameUnique(toGuest(this.parent));
                    }
                ),
        })
    }

    return (

        <>

            {/* Details Form */}
            <Container id="GuestForm">

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

                            <Form.Row id="nameRow">
                                <Form.Group as={Col} controlId="firstName" id="firstNameGroup">
                                    <Form.Label>First Name:</Form.Label>
                                    <Form.Control
                                        autoFocus={props.autoFocus}
                                        isInvalid={touched.firstName && !!errors.firstName}
                                        isValid={!errors.firstName}
                                        name="firstName"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.firstName}
                                    />
                                    <Form.Control.Feedback type="valid">
                                        Name is required and must be unique.
                                    </Form.Control.Feedback>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.firstName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} controlId="lastName" id="lastNameGroup">
                                    <Form.Label>Last Name:</Form.Label>
                                    <Form.Control
                                        isInvalid={touched.lastName && !!errors.lastName}
                                        isValid={!errors.lastName}
                                        name="lastName"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.lastName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.lastName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row id="commentsFavoriteRow">
                                <Form.Group as={Col} controlId="comments" id="commentsGroup">
                                    <Form.Label>Comments:</Form.Label>
                                    <Form.Control
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
                                <Form.Group as={Col} controlId="favorite" id="favoriteGroup">
                                    <Form.Label>Favorite Mat:</Form.Label>
                                    <Form.Control
                                        htmlSize={3}
                                        isInvalid={touched.favorite && !!errors.favorite}
                                        isValid={!errors.favorite}
                                        name="favorite"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        size="sm"
                                        type="text"
                                        value={values.favorite}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.favorite}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row id="activeRow">
                                <Form.Group as={Col} controlId="active" id="activeGroup">
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
                                        disabled={adding || !canRemove}
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
                        Removing this Guest is not reversible, and
                        <strong>
                            &nbsp;will also remove ALL related information.
                        </strong>.
                    </p>
                    <p>Consider marking this Guest as inactive instead.</p>
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

export default GuestForm;
