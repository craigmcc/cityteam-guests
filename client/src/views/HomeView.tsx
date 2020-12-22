// HomeView ------------------------------------------------------------------

// This will eventually become a login/logout page or something.

// External Modules ----------------------------------------------------------

import React, { useContext } from "react";
import Container from "react-bootstrap/Container";

// Internal Modules ----------------------------------------------------------

import LoginContext from "../contexts/LoginContext";
import LoginForm from "../forms/LoginForm";

// Component Details ---------------------------------------------------------

const HomeView = () => {

    const loginContext = useContext(LoginContext);

    return (
        <>
            <Container fluid id="HomeView">
                <p>
                    This is HomeView for NODE_ENV {process.env.NODE_ENV}.
                </p>
                <p>
                    Entire Environment:
                    {JSON.stringify(process.env, null, 2)}
                </p>

                {(loginContext.loggedIn) ? (
                    <p>Log Out button goes here</p>
                ) : (
                    <LoginForm/>
                )}

            </Container>
        </>
    )

}

export default HomeView;
