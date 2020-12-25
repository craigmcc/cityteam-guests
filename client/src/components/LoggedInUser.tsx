// LoggedInUser ---------------------------------------------------------------

// Display information about the logged in user (if any)

// External Modules ----------------------------------------------------------

import React, {useContext, useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

// Internal Modules ----------------------------------------------------------

import LoginContext from "../contexts/LoginContext";
import LoginForm from "../forms/LoginForm";
import Credentials from "../models/Credentials";
import PasswordTokenRequest from "../models/PasswordTokenRequest";
import TokenResponse from "../models/TokenResponse";
import OAuthClient from "../clients/OAuthClient";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

export const LoggedInUser = () => {

    const loginContext = useContext(LoginContext);

    const [showCredentials, setShowCredentials] = useState<boolean>(false);

    useEffect(() => {
        // Just trigger rerender when login or logout occurs
    }, [loginContext.loggedIn])

    const handleLogin = async (credentials: Credentials) => {
        console.info(`LoggedInUser.handleLogin: Logging in user '${credentials.username}'`);
        const tokenRequest: PasswordTokenRequest = {
            grant_type: "password",
            password: credentials.password,
            username: credentials.username,
        }
        try {
            const tokenResponse: TokenResponse = await OAuthClient.password(tokenRequest);
            loginContext.handleLogin(credentials.username, tokenResponse);
            setShowCredentials(false);
        } catch (error) {
            ReportError("LoggedInUser.handleLogin", error);
        }
    }

    const handleLogout = async () => {
        console.info(`LoggedInUser.handleLogout: Logging out user '${loginContext.username}'`);
        try {
            await OAuthClient.revoke();
            loginContext.handleLogout();
        } catch (error) {
            ReportError("LoggedInUser.handleLogout", error);
        }
    }

    const onHide = () => {
        setShowCredentials(false);
    }

    const onShow = () => {
        setShowCredentials(true);
    }

    return (
        <>

            {/* Logged In Display and Controls */}
            <Form>

                    <Form.Label htmlFor="loggedInUsername">
                        <span>User </span>
                        {(loginContext.loggedIn) ? (
                            <Button
                                onClick={handleLogout}
                                size="sm"
                                type="button"
                                variant="outline-dark"
                            >
                                Log Out
                            </Button>
                        ) : (
                            <Button
                                onClick={onShow}
                                size="sm"
                                type="button"
                                variant="outline-dark"
                            >
                                Log In
                            </Button>
                        )}
                    </Form.Label>

                    <Form.Control
                        className="mb-1"
                        htmlSize={12}
                        id="loggedInUsername"
                        readOnly={true}
                        size="sm"
                        value={loginContext.username ? loginContext.username : "-----"}
                    />

            </Form>

            {/* Login Credentials Modal */}
            <Modal
                animation={false}
                backdrop="static"
                centered
                onHide={onHide}
                show={showCredentials}
                size="sm"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Enter Credentials</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LoginForm handleLogin={handleLogin}/>
                </Modal.Body>
            </Modal>

        </>
    )

}

export default LoggedInUser;