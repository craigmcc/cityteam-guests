// AssignForm ----------------------------------------------------------------

// Form for editing Checkin assignments to Guets.

// External Modules ----------------------------------------------------------

import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Formik, FormikHelpers, FormikValues } from "formik";
import * as Yup from "yup";

// Internal Modules ----------------------------------------------------------

import Assign from "../models/Assign";
import * as Replacers from "../util/replacers";
import { toEmptyStrings, toNullValues } from "../util/transformations";
import { validateTime } from "../util/validators";
import {PaymentTypes} from "../components/types";

// Incoming Properties -------------------------------------------------------

export type HandleAssign = (assign: Assign) => void;

export interface Props {
    assign: Assign;                 // Initial values
    autoFocus?: boolean;            // Should we autoFocus first field? [false]
    handleAssign: HandleAssign;     // Handle (assign) on assignment
}

// Component Details ---------------------------------------------------------

const AssignForm = (props: Props) => {

    const [initialValues] = useState(toEmptyStrings(props.assign));

    const handleSubmit = (values: FormikValues, actions: FormikHelpers<FormikValues>): void => {
        const assign: Assign = toAssign(values);
        console.info("AssignForm.handleSubmit("
            + JSON.stringify(assign, Replacers.ASSIGN)
            + ")");
        props.handleAssign(assign);
    }

    interface PaymentType {
        key: string;
        value: string;
    }

    const paymentTypes = (): PaymentType[] => {
        const results: PaymentType[] = [];
        Object.values(PaymentTypes).forEach(paymentType => {
            const result: PaymentType = {
                key: paymentType.substr(0, 2),
                value: paymentType,
            }
            results.push(result);
        })
        return results;
    }


    const toAssign = (values: FormikValues): Assign => {
        const results = toNullValues(values);
        return new Assign({
            comments: results.comments,
            facilityId: props.assign.facilityId,
            guestId: props.assign.guestId,
            id: props.assign.id,
            paymentAmount: results.paymentAmount,
            paymentType: results.paymentType,
            showerTime: results.showerTime,
            wakeupTime: results.wakeupTime,
        });
    }

    const validationSchema = () => {
        return Yup.object().shape({
            comments: Yup.string(),
            paymentAmount: Yup.number(),
            paymentType: Yup.string(), // Implicitly required via select options
            showerTime: Yup.string()
                .test("valid-shower-time",
                    "Invalid Shower Time format, must be 99:99 or 99:99:99",
                    function (value) {
                        return validateTime(value ? value : "");
                    }),
            wakeupTime: Yup.string()
                .test("valid-wakeup-time",
                    "Invalid Wakeup Time format, must be 99:99 or 99:99:99",
                    function (value) {
                        return validateTime(value ? value : "");
                    }),
        })
    }

    return (

        <>

            {/* Assign Form */}
            <Container id="assignForm">

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

                               <Form.Row id="paymentTypeAmountRow">
                                   <Form.Group as={Row} className="mr-4"
                                               controlId="paymentType" id="paymentTypeGroup">
                                       <Form.Label>Payment Type:</Form.Label>
                                       <Form.Control
                                           as="select"
                                           name="paymentType"
                                           onBlur={handleBlur}
                                           onChange={handleChange}
                                           size="sm"
                                           value={values.paymentType}
                                       >
                                           {paymentTypes().map((paymentType, index) => (
                                               <option key={index} value={paymentType.key}>
                                                   {paymentType.value}
                                               </option>
                                           ))}
                                       </Form.Control>
                                   </Form.Group>
                                   <Form.Group as={Row} className="mr-4"
                                               controlId="paymentAmount" id="paymentAmountGroup">
                                       <Form.Label>Payment Amount:</Form.Label>
                                       <Form.Control
                                           htmlSize={10}
                                           isInvalid={touched.paymentAmount && !!errors.paymentAmount}
                                           isValid={!errors.paymentAmount}
                                           name="paymentAmount"
                                           onBlur={handleBlur}
                                           onChange={handleChange}
                                           size="sm"
                                           type="text"
                                           value={values.paymentAmount}
                                       />
                                       <Form.Control.Feedback type="invalid">
                                           ${errors.paymentAmount}
                                       </Form.Control.Feedback>
                                   </Form.Group>
                               </Form.Row>

                                <Form.Row id="showerWakeupRow">
                                    <Form.Group as={Row} className="mr-4"
                                                controlId="showerTime" id="showerTimeGroup">
                                        <Form.Label>Shower Time:</Form.Label>
                                        <Form.Control
                                            htmlSize={15}
                                            isInvalid={touched.showerTime && !!errors.showerTime}
                                            isValid={!errors.showerTime}
                                            name="showerTime"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            size="sm"
                                            type="text"
                                            value={values.showerTime}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            ${errors.showerTime}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mr-4"
                                                controlId="wakeupTime" id="wakeupTimeGroup">
                                        <Form.Label>Wakeup Time:</Form.Label>
                                        <Form.Control
                                            htmlSize={15}
                                            isInvalid={touched.wakeupTime && !!errors.wakeupTime}
                                            isValid={!errors.wakeupTime}
                                            name="wakeupTime"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            size="sm"
                                            type="text"
                                            value={values.wakeupTime}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            ${errors.showerTime}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form.Row>

                               <Form.Row id="commentsRow">
                                   <Form.Group as={Row} className="mr-4"
                                               controlId="comments" id="commentsGroup">
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

                               <Row className="mb-3">
                                   <Col>
                                       <Button
                                           disabled={isSubmitting}
                                           size="sm"
                                           type="submit"
                                           variant="primary"
                                       >
                                           Save
                                       </Button>
                                   </Col>
                               </Row>

                           </Form>

                        )}

                        </Formik>

            </Container>

        </>

    )

}

export default AssignForm;
