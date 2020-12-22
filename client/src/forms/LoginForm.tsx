// LoginForm -----------------------------------------------------------------

// Form for logging in to this application.

// External Modules ----------------------------------------------------------

import React, { useContext, useState } from "react";
import { Formik, FormikValues } from "formik";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import * as Yup from "yup";

// Internal Modules ----------------------------------------------------------

import OAuthClient from "../clients/OAuthClient";
import LoginContext from "../contexts/LoginContext";
import PasswordTokenRequest from "../models/PasswordTokenRequest";
import TokenResponse from "../models/TokenResponse";
import ReportError from "../util/ReportError";

// Property Details ----------------------------------------------------------

// Component Details ---------------------------------------------------------

export const LoginForm = () => {

    const loginContext = useContext(LoginContext);

    const [initialValues] = useState({
        password: "",
        username: ""
    });

    const validationSchema = () => {
        return Yup.object().shape({
            password: Yup.string()
                .required("Password is required"),
            username: Yup.string()
                .required("Username is required")
        })
    }

    const handleSubmit = async (values: FormikValues) => {
        console.info("LoginForm.handleSubmit: Trying to log in with " + values.username);
        const tokenRequest: PasswordTokenRequest = {
            grant_type: "password",
            password: values.password,
            username: values.username,
        }
        try {
            const tokenResponse: TokenResponse = await OAuthClient.password(tokenRequest);
            console.info("LoginForm.handleSubmit:  Success");
            loginContext.handleLogin(values.username, tokenResponse);
            console.info("LoginForm.handleSubmit: Completed");
        } catch (error) {
            ReportError("LoginForm.handleSubmit()", error);
        }
    }

    return (

        <Container id="LoginForm">

            <Formik
                initialValues={initialValues}
                onSubmit={(values) => {
                    handleSubmit(values);
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

                    <>

                        <Form
                            noValidate
                            onSubmit={handleSubmit}
                        >

                            <Form.Row id="usernameRow">
                                <Form.Group controlId="username">
                                    <Form.Label>Username:</Form.Label>
                                    <Form.Control
                                        htmlSize={16}
                                        isInvalid={touched.username && !!errors.username}
                                        isValid={!errors.username}
                                        name="username"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        type="text"
                                        value={values.username}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.username}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Form.Row id="passwordRow">
                                <Form.Group controlId="password">
                                    <Form.Label>Password:</Form.Label>
                                    <Form.Control
                                        htmlSize={16}
                                        isInvalid={touched.password && !!errors.password}
                                        isValid={!errors.password}
                                        name="password"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        type="password"
                                        value={values.password}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Form.Row>

                            <Row className="mb-3">
                                <Col>
                                    <Button
                                        size="sm"
                                        type="submit"
                                        variant="primary"
                                    >
                                        Log In
                                    </Button>
                                </Col>
                            </Row>

                        </Form>

                    </>

                )}

            </Formik>

        </Container>

    )

}

export default LoginForm;
