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
import Credentials from "../models/Credentials";
import PasswordTokenRequest from "../models/PasswordTokenRequest";
import TokenResponse from "../models/TokenResponse";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const HomeView = () => {

    const loginContext = useContext(LoginContext);

    const handleLogin = async (credentials: Credentials) => {
        console.info(`HomeView.handleLogin: Sending login for user '${credentials.username}'`);;
        const tokenRequest: PasswordTokenRequest = {
            grant_type: "password",
            password: credentials.password,
            username: credentials.username,
        }
        try {
            const tokenResponse: TokenResponse = await OAuthClient.password(tokenRequest);
            console.info("HomeView.handleLogin:  Success");
            loginContext.handleLogin(credentials.username, tokenResponse);
            console.info("HomeView.handleLogin: Completed");
        } catch (error) {
            ReportError("HomeView.handleLogin()", error);
        }
    }

    const handleLogout = async () => {
        console.info(`HomeView.handleLogout: Sending logout for user '${loginContext.username}'`);
        try {
            await OAuthClient.revoke(loginContext.accessToken
                ? loginContext.accessToken : "");
            console.info("HomeView.handleLogout: Success");
            loginContext.handleLogout();
            console.info("HomeView.handleLogout: Completed");
        } catch (error) {
            ReportError("HomeView.handleLogout()", error);
        }
    }

    return (
        <>
            <Container fluid id="HomeView">

                <p>
                    This is HomeView for NODE_ENV {process.env.NODE_ENV}.
                </p>

                {(loginContext.loggedIn) ? (
                    <Button
                        onClick={handleLogout}
                        size="sm"
                        type="button"
                        variant="info"
                    >
                        Log Out
                    </Button>
                ) : (
                    <LoginForm handleLogin={handleLogin}/>
                )}

            </Container>
        </>
    )

}

export default HomeView;
