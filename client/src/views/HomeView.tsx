// HomeView ------------------------------------------------------------------

// This will eventually become a login/logout page or something.

// External Modules ----------------------------------------------------------

import React, { useContext } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

// Internal Modules ----------------------------------------------------------

import OAuthClient from "../clients/OAuthClient";
import LoginContext from "../contexts/LoginContext";
import LoginForm from "../forms/LoginForm";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const HomeView = () => {

    const loginContext = useContext(LoginContext);

    const onLogout = async () => {
        console.info("HomeView.onLogout:  Logging out sent");
        try {
            await OAuthClient.revoke(loginContext.accessToken
                ? loginContext.accessToken : "");
        } catch (error) {
            ReportError("HomeView.onLogout()", error);
        }
        loginContext.handleLogout();
        console.info("HomeView.onLogout:  Logging out completed");
    }

    return (
        <>
            <Container fluid id="HomeView">

                <p>
                    This is HomeView for NODE_ENV {process.env.NODE_ENV}.
                </p>

                {(loginContext.loggedIn) ? (
                    <Button
                        onClick={onLogout}
                        size="sm"
                        type="button"
                        variant="info"
                    >
                        Log Out
                    </Button>
                ) : (
                    <LoginForm/>
                )}

            </Container>
        </>
    )

}

export default HomeView;
