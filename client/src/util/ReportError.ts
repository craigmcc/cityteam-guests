// ReportError ---------------------------------------------------------------

// Log the specified error to the console.error log, and pop up an alert with
// the appropriate message string.  In both cases, prepend the specified prefix
// to describe context where the error came from.

// Public Objects ------------------------------------------------------------

export const ReportError = (prefix: string, error: any) => {
    let message: string = error.message;
    if (error.response) {
        message = `[${error.response.status}]: ${error.response.data}`
    }
    console.error(`${prefix} Error: ${message}`);
    console.error(`${prefix} Original: `, error);
    alert(`${prefix} Error: '${message}'`);
}

export default ReportError;
