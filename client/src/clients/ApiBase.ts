// ApiBase -------------------------------------------------------------------

// Basic infrastructure for Axios interactions with the API routes
// of an application server, rooted at "/api".

// External Modules ----------------------------------------------------------

import axios, { AxiosInstance } from "axios";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

const ApiBase: AxiosInstance = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export default ApiBase;
