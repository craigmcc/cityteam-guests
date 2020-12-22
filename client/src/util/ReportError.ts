// ReportError ---------------------------------------------------------------

// Log the specified error to the console.error log, and pop up an alert with
// the appropriate message string.  In the error log, prepend the specified prefix
// to describe context where the error came from.

// If the error was a non-2xx HTTP status response, the error will contain a
// "response" field with the server's (Axios) response content embedded inside.
// In that case, dump the server response to the log, and extract the server's
// "message" field to display to the user.

// Public Objects ------------------------------------------------------------

export const ReportError = (prefix: string, error: any) => {
    let message: string = error.message;
    console.error(`${prefix}: ReportError: ${message}`);
    if (error.response) {
        const errorResponse: any = error.response;
//        console.error(`${prefix}: ErrorResponse: `, errorResponse);
        if (errorResponse["data"]) {
            const responseData: any = errorResponse["data"];
            console.error(`${prefix}: ResponseData: `, responseData);
            if (responseData["message"]) {
//                console.error(`${prefix}: responseData.message: `, responseData["message"]);
                message = responseData["message"];
            }
        }
    }
    alert(`Error: '${message}'`);
}

export default ReportError;
