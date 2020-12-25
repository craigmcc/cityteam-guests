// query-parameters ----------------------------------------------------------

// Utilities to deal with appending query parameters to a client URI.

// Public Objects ------------------------------------------------------------

// Parse the params passed and assemble them into the query string portion
// of an outbound URI.  If a key has a "" value, it will be listed by itself.
// If no params are passed, a zero-length string is returned.

export const queryParameters = (params?: any): string => {
    let result: string = "";
    if (!params) {
        return result;
    }
    for (let [key, value] of Object.entries(params)) {
        if (result.length === 0) {
            result += "?";
        } else {
            result += "&";
        }
        if (value === "") {
            result += key;
        } else {
            result += key + "=" + value;
        }
    }
    return result;

}
