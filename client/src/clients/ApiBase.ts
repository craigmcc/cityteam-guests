// ApiBase -------------------------------------------------------------------

// Basic infrastructure for Axios interactions with the API routes
// of an application server, rooted at "/api".

// External Modules ----------------------------------------------------------

import axios, { AxiosInstance } from "axios";

// Internal Modules ----------------------------------------------------------

import { CURRENT_ACCESS_TOKEN } from "../contexts/LoginContext";

// Private Objects -----------------------------------------------------------

const requestTransform = async (data: any, headers: any): Promise<void> => {
    if (CURRENT_ACCESS_TOKEN) {
        headers["Authorization"] = `Bearer ${CURRENT_ACCESS_TOKEN}`;
    }
}

// Public Objects ------------------------------------------------------------

const ApiBase: AxiosInstance = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
    transformRequest: requestTransform,
});

export default ApiBase;
