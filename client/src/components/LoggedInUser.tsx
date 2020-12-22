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
            <Form.Label className="mr-1" htmlFor="loggedInUsername">
                User:
            </Form.Label>
            <Form.Control
                className="mr-1"
                htmlSize={16}
                id="loggedInUsername"
                readOnly={true}
                size="sm"
                value={loginContext.username ? loginContext.username : "-----"}
            />
        </>
    )

}

export default LoggedInUser;
