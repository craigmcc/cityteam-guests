// LoggedInUser ---------------------------------------------------------------

// Display information about the logged in user (if any)

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect } from "react";
import Form from "react-bootstrap/Form"

// Internal Modules ----------------------------------------------------------

import LoginContext from "../contexts/LoginContext";

// Component Details ---------------------------------------------------------

export const LoggedInUser = () => {

    const loginContext = useContext(LoginContext);

    useEffect(() => {
        // Just trigger rerender when login or logout occurs
    }, [loginContext.loggedIn])

    return (
        <>
            <Form>
                <Form.Label htmlFor="loggedInUsername">
                    User:
                </Form.Label>
                <Form.Control
                    htmlSize={12}
                    id="loggedInUsername"
                    readOnly={true}
                    size="sm"
                    value={loginContext.username ? loginContext.username : "-----"}
                />
            </Form>
        </>
    )

}

export default LoggedInUser;
