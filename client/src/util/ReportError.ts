// ReportError ---------------------------------------------------------------

// Log the specified error to the client logger, and pop up an alert with
// the appropriate message string.  In the error log, prepend the specified prefix
// to describe context where the error came from.

// If the error was a non-2xx HTTP status response, the error will contain a
// "response" field with the server's (Axios) response content embedded inside.
// In that case, dump the server response to the log, and extract the server's
// "message" field to display to the user.

// Internal Modules ----------------------------------------------------------

import logger from "./client-logger";

// Public Objects ------------------------------------------------------------

export const ReportError = (prefix: string, error: any) => {
    let outMessage: string = error.message;
    let outData: any | undefined = undefined;
    if (error.response) {
        const errorResponse: any = error.response;
        if (errorResponse["data"]) {
            outData = errorResponse["data"];
            if (outData["message"]) {
                outMessage = outData["message"];
            }
        }
    }
    logger.error({
        context: prefix,
        msg: outMessage,
        error: outData ? outData : null,
    });
    alert(`Error: '${outMessage}'`);
}

export default ReportError;
