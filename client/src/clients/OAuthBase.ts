// OAuthBase -----------------------------------------------------------------

// Basic infrastructure for Axios interactions with an OAuth Authentication
// Server, rooted at "/oauth".

// External Modules ----------------------------------------------------------

import axios, { AxiosInstance } from "axios";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

const OAuthBase: AxiosInstance = axios.create({
    baseURL: "/oauth",
});

export default OAuthBase;
