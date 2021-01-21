// LoginContext --------------------------------------------------------------

// React Context containing information about the currently logged in user
// (if there is one).  If there is no logged in user, the loggedIn flag
// will be false.

// Separately, key context state values are copied to exported
// static variables that are accessible outside the component hierarchy.

// External Modules ----------------------------------------------------------

import React, { createContext, useState } from "react";

// Internal Modules ----------------------------------------------------------

import OAuthClient from "../clients/OAuthClient";
import TokenResponse from "../models/TokenResponse";
import User from "../models/User";
import logger, { setLevel } from "../util/client-logger";

// Context Properties --------------------------------------------------------

export type LoginContextData = {
    accessToken: string | null;
    expires: Date | null;
    loggedIn: boolean;
    refreshToken: string | null;
    scope: string | null;
    username: string | null;
    handleLogin: (username: string, tokenResponse: TokenResponse) => void;
    handleLogout: () => void;
    validateScope: (scope: string) => boolean;
}

export const LoginContext = createContext<LoginContextData>({
    accessToken: null,
    expires: null,
    loggedIn: false,
    refreshToken: null,
    scope: null,
    username: null,
    handleLogin: (username, tokenResponse): void => {},
    handleLogout: (): void => {},
    validateScope: (scope: string): boolean => { return false }
});

export default LoginContext;

// Context Provider ----------------------------------------------------------

// For use by HTTP clients to include in their requests
export let CURRENT_ACCESS_TOKEN: string | null = null;
export let CURRENT_REFRESH_TOKEN: string | null = null;
export let CURRENT_SCOPE: string | null = null;
export let CURRENT_USER: User | null = null;
export let CURRENT_USERNAME: string | null = null;

export const LoginContextProvider = (props: any) => {

    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [expires, setExpires] = useState<Date | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [scope, setScope] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    const handleLogin = async (newUsername: string, tokenResponse: TokenResponse): Promise<void> => {

        setAccessToken(tokenResponse.access_token);
        const newExpires: Date = new Date
            ((new Date()).getTime() + (tokenResponse.expires_in * 1000));
        setExpires(newExpires);
        setLoggedIn(true);
        if (tokenResponse.refresh_token) {
            setRefreshToken(tokenResponse.refresh_token);
        } else {
            setRefreshToken(null);
        }
        setScope(tokenResponse.scope);
        setUsername(newUsername);

        logger.info({
            context: "LoginContext.handleLogin",
            username: newUsername,
        });

        CURRENT_ACCESS_TOKEN = tokenResponse.access_token;
        CURRENT_REFRESH_TOKEN =
            tokenResponse.refresh_token ? tokenResponse.refresh_token : null;
        CURRENT_SCOPE = tokenResponse.scope;
        CURRENT_USERNAME = newUsername;

        CURRENT_USER = await OAuthClient.me();
        if (CURRENT_USER && CURRENT_USER.level) {
            setLevel(CURRENT_USER.level);
            logger.debug({
                context: "LoginContext.setLevel",
                username: CURRENT_USER.username,
                level: CURRENT_USER.level,
            });
        }

    }

    const handleLogout = (): void => {

        logger.info({
            context: "LoginContext.handleLogout",
            username: username,
        });

        setAccessToken(null);
        setExpires(null);
        setLoggedIn(false);
        setRefreshToken(null);
        setScope(null);
        setUsername(null);

        CURRENT_ACCESS_TOKEN = null;
        CURRENT_REFRESH_TOKEN = null;
        CURRENT_SCOPE = null;
        CURRENT_USERNAME = null;

        CURRENT_USER = null;
        setLevel("info");

    }

    // Return true if there is a logged in user that has the required
    // scope being requested
    const validateScope = (required: string): boolean => {
        if (loggedIn && CURRENT_SCOPE) {
            // Handle superuser scope
            if (CURRENT_SCOPE.includes("superuser")) {
                return true;
            }
            // Handle request for logged in user with any scope
            if (required === "") {
                return true;
            }
            // Otherwise, check required scope versus allowed scope
            let requiredScopes: string[]
                = required ? required.split(" ") : [];
            if (requiredScopes.length === 0) {
                return true;
            }
            let allowedScopes: string[]
                = CURRENT_SCOPE ? CURRENT_SCOPE.split(" ") : [];
            if (allowedScopes.length === 0) {
                return false;
            }
            let result = true;
            requiredScopes.forEach(requiredScope => {
                let match: boolean = false;
                allowedScopes.forEach(allowedScope => {
                    if (requiredScope === allowedScope) {
                        match = true;
                    }
                });
                if (!match) {
                    result = false;
                }
            });
            return result;
        } else {
            return false;
        }
    }

    // Create the context object
    const loginContext: LoginContextData = {
        accessToken: accessToken,
        expires: expires,
        loggedIn: loggedIn,
        refreshToken: refreshToken,
        scope: scope,
        username: username,
        handleLogin: handleLogin,
        handleLogout: handleLogout,
        validateScope: validateScope,
    }

    // Return the context, rendering children inside
    return (
        <LoginContext.Provider value={loginContext}>
            {props.children}
        </LoginContext.Provider>
    )

}
