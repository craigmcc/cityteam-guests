// LoginContext --------------------------------------------------------------

// React Context containing information about the currently logged in user
// (if there is one).  If there is no logged in user, all values (except
// for the handler functions) will be null.

// TODO - propagate to something outside the component tree for HTTP clients?

// External Modules ----------------------------------------------------------

import React, { createContext, useEffect, useState } from "react";
import TokenResponse from "../models/TokenResponse";

// Internal Modules ----------------------------------------------------------

// Context Properties --------------------------------------------------------

export interface Props {
    children: React.ReactNode;      // Child components [React deals with this]
}

export interface LoginContextData {
    accessToken: string | null;
    expires: Date | null;
    refreshToken: string | null;
    scope: string | null;
    username: string | null;
    handleLogin: (username: string, tokenResponse: TokenResponse) => void;
    handleLogout: () => void;
}

export const LoginContext = createContext<LoginContextData>({
    accessToken: null,
    expires: null,
    refreshToken: null,
    scope: null,
    username: null,
    handleLogin: (username, tokenResponse): void => {},
    handleLogout: (): void => {}
});

// Context Provider ----------------------------------------------------------

export const LoginContextProvider = (props: Props) => {

    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [expires, setExpires] = useState<Date | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [scope, setScope] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    const handleLogin = (username: string, tokenResponse: TokenResponse): void => {
        console.info("LoginContext.handleLogin("
            + username + ", "
            + JSON.stringify(tokenResponse)
            + ")");
        setAccessToken(tokenResponse.access_token);
        const newExpires: Date = new Date
            ((new Date()).getTime() + (tokenResponse.expires_in * 1000));
        setExpires(newExpires);
        if (tokenResponse.refresh_token) {
            setRefreshToken(tokenResponse.refresh_token);
        } else {
            setRefreshToken(null);
        }
        setScope(tokenResponse.scope);
        setUsername(username);
    }

    const handleLogout = (): void => {
        console.info("LoginContext.handleLogout()");
        setAccessToken(null);
        setExpires(null);
        setRefreshToken(null);
        setScope(null);
        setUsername(null);
    }

    // Create the context object
    const loginContext: LoginContextData = {
        accessToken: accessToken,
        expires: expires,
        refreshToken: refreshToken,
        scope: scope,
        username: username,
        handleLogin: handleLogin,
        handleLogout: (): void => {}
    }

    // Return the context, rendering children inside
    return (
        <LoginContext.Provider value={loginContext}>
            {props.children}
        </LoginContext.Provider>
    )

}

export default LoginContext;
