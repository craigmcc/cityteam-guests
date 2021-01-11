// LogServices ---------------------------------------------------------------

// Service methods to export requested access log and server log files as
// "text/plain" or "application/json" content, respectively.  If server log(s)
// are requested, they will be encapsulated in "[" and "]" to become a well
// formed JSON array.

// External Modules ----------------------------------------------------------

const fs = require("fs/promises");
import * as path from "path";

// Internal Modules ----------------------------------------------------------

import logger from "../util/logger";

const LOG_DIRECTORY
    = process.env.LOG_DIRECTORY ? process.env.LOG_DIRECTORY : "./log";
const LOG_PATH = path.resolve(LOG_DIRECTORY);

// Public Objects ------------------------------------------------------------

export class LogServices {

    // Public Methods --------------------------------------------------------

    // Return today's access log file (only current through now).
    public async accessLog(): Promise<string> {
        return await this.upload("access.log");
    }

    // Return the concatenated access log(s) for the specified date.
    public async accessLogs(date: string): Promise<string> {
        const matches: string[] = await this.filenames(date, "access.log");
        logger.info({
            context: "LogServices.accessLogs",
            matches: matches
        });
        let results: string = "";
        // TODO - need to resort to Promises.all() to gather all of them?
        if (matches.length > 0) {
            results += await this.upload(matches[0]);
        }
        if (matches.length > 1) {
            results += await this.upload(matches[1]);
        }
        if (matches.length > 2) {
            results += await this.upload(matches[2]);
        }
        if (matches.length > 3) {
            results += await this.upload(matches[3]);
        }
        return results;
    }

    // Return today's server log file (only current through now).
    public async serverLog(): Promise<string> {
        return "[" + (await this.upload("server.log")) + "]";
    }

    // Return the concatenated server log(s) for the specified date.
    public async serverLogs(date: string): Promise<string> {
        const matches: string[] = await this.filenames(date, "server.log");
        logger.info({
            context: "LogServices.serverLogs",
            matches: matches
        });
        let results: string = "[";
        // TODO - need to resort to Promises.all() to gather all of them?
        if (matches.length > 0) {
            results += await this.upload(matches[0]);
        }
        if (matches.length > 1) {
            results += await this.upload(matches[1]);
        }
        if (matches.length > 2) {
            results += await this.upload(matches[2]);
        }
        if (matches.length > 3) {
            results += await this.upload(matches[3]);
        }
        results += "]";
        return results;
    }

    // Private Methods -------------------------------------------------------

    // Return an array of filenames that start with the specified prefix
    // and end with the specified suffix in the log directory.
    private async filenames(prefix: string, suffix: string): Promise<string[]> {
        const matches: string[] = [];
        const filenames: string[] = await fs.readdir(LOG_PATH);
        filenames.forEach(filename => {
            if (filename.startsWith(prefix) && filename.endsWith(suffix)) {
                matches.push(filename);
            }
        })
        return matches.sort();
    }

    // Return the text contents of the specified file, or throw an error
    // if the file could not be read
    private async upload(filename: string): Promise<string> {
        const filepath = path.join(LOG_PATH, filename);
        return await fs.readFile(filepath);
    }

}

export default new LogServices();
