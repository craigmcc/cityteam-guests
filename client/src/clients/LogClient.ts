// LogClient -----------------------------------------------------------------

// Interact with server side logging (and log retrieval, if needed) operations.

// Internal Modules ----------------------------------------------------------

import ApiBase from "./ApiBase";

const LOG_BASE = "/logs";

// Public Objects ------------------------------------------------------------

class LogClient {

// Post a log message to the server
    async log(object: any): Promise<void> {
        await ApiBase.post(LOG_BASE + "/clientLog", object);
    }

}

export default new LogClient();
