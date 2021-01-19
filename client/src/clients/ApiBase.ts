// ApiBase -------------------------------------------------------------------

// Basic infrastructure for Axios interactions with the API routes
// of an application server, rooted at "/api".

// External Modules ----------------------------------------------------------

import axios, { AxiosInstance } from "axios";

// Internal Modules ----------------------------------------------------------

import {CURRENT_ACCESS_TOKEN, CURRENT_USERNAME} from "../contexts/LoginContext";

// Private Objects -----------------------------------------------------------

// Public Objects ------------------------------------------------------------

const ApiBase: AxiosInstance = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

ApiBase.interceptors.request.use(function (config) {
    if (CURRENT_ACCESS_TOKEN) {
        config.headers["Authorization"] = `Bearer ${CURRENT_ACCESS_TOKEN}`;
    }
    if (CURRENT_USERNAME) {
        config.headers["X-CTG-Username"] = CURRENT_USERNAME;
    }
    return config;
})

export default ApiBase;
