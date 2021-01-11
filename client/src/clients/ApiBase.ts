// ApiBase -------------------------------------------------------------------

// Basic infrastructure for Axios interactions with the API routes
// of an application server, rooted at "/api".

// External Modules ----------------------------------------------------------

import axios, { AxiosInstance } from "axios";

// Internal Modules ----------------------------------------------------------

import {CURRENT_ACCESS_TOKEN, CURRENT_USERNAME} from "../contexts/LoginContext";

// Private Objects -----------------------------------------------------------

// WARNING: This seems to scramble data even though nothing is done to it
/*
const transformRequest = (data: any, headers: any): any => {
    console.info("ApiBase.requestTransform.in("
        + "DATA=" + JSON.stringify(data, null, 2) + ", "
        + "HEAD=" + JSON.stringify(headers, null, 2)
        + ")");
    if (CURRENT_ACCESS_TOKEN) {
        headers["Authorization"] = `Bearer ${CURRENT_ACCESS_TOKEN}`;
    }
    console.info("ApiBase.requestTransform.out("
        + "DATA=" + JSON.stringify(data, null, 2) + ", "
        + "HEAD=" + JSON.stringify(headers, null, 2)
        + ")");
    return data;
}
*/

// Public Objects ------------------------------------------------------------

const ApiBase: AxiosInstance = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
//    transformRequest: transformRequest,
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
