// DevModeRouter -------------------------------------------------------------

// Router for development mode operations.

// External Modules ----------------------------------------------------------

import csv from "csvtojson";
import { Request, Response, Router } from "express";

// Internal Modules ----------------------------------------------------------

import logger from "../util/logger";

import CSVError from "csvtojson/v2/CSVError";
import Checkin from "../models/Checkin";
import Facility from "../models/Facility";
import {
    requireNotProduction,
    requireSuperuser
} from "../oauth/OAuthMiddleware";
import DevModeServices from "../services/DevModeServices";
import ImportServices from "../services/ImportServices";

// Public Objects ------------------------------------------------------------

export class Problem extends Error {
    constructor(issue: string, resolution: string, row: any, fatal: boolean = false) {
        super(issue);
        this.issue = issue;
        this.resolution = resolution;
        this.row = row;
        this.fatal = fatal ? fatal : false;
    }
    fatal: boolean;
    issue: string;
    resolution: string;
    row: any;
}

export const DevModeRouter = Router({
    strict: true
});

// Import a CSV from the Portland "shelter log" spreadsheet
DevModeRouter.post("/import",
    requireNotProduction,
    requireSuperuser,
    async (req: Request, res: Response) => {

        // Find the Facility for which to process imports
        let facility: Facility = new Facility();
        try {
            facility = await ImportServices.findFacility("Portland");
        } catch (error) {
            res.status(500).send(error);
        }

        // Set up state information for processing CSV rows
        let previousCheckinDate = "12/31/19";
        let avoiding = false;
        let ignoring = false;
        let skipping = false;
        let avoids = 0;
        let fails = 0;
        let ignores = 0;
        let processes = 0;
        let skips = 0;
        const allCheckins: Checkin[] = [];
        const allProblems: Problem[] = [];
        let results: any = {};

        // Overall processing of the CSV request body
        await csv({
            noheader: false,
            headers: [
                "checkinDate",
                "matNumber",
                "firstName",
                "lastName",
                "paymentType",
                "bac",
                "comments",
                "exclude",
                "fm30days"
            ]
        })
            .fromString(req.body)
            .subscribe(

                // Handle the next row from the CSV file
                async (row: any, index: number) => {

/*
                    // Development Only - limit the number of rows we deal with
                    if (index >= 10) {
                        avoiding = true;
                    }
*/

                    // Ignore cruft at the end of the CSV file
                    ignoring = !row.checkinDate ||
                        (row.checkinDate.length === 0);

                    // Turn off skipping when checkinDate changes
                    if (skipping && (row.checkinDate !== previousCheckinDate)) {
                        skipping = false;
                    }

                    // Turn on skipping when we see the end-of-data marker
                    if (row.firstName.startsWith("***") || row.lastName.startsWith("***")) {
                        skipping = true;
                    }

                    // Process this row based on state flags
                    if (avoiding) {
                        avoids++;
                    } else if (ignoring) {
                        ignores++;
                    } else if (skipping) {
                        skips++;
                    } else {
                        const checkin: Checkin | null
                            = await ImportServices.importCheckin(
                                facility,
                                row,
                                allProblems
                        );
                        if (checkin) {
                            allCheckins.push(checkin);
                            processes++;
                        } else {
                            fails++;
                        }
                    }

                },

                // Handle a CSV parsing error
                (error: CSVError) => {
                    logger.error({
                        context: "DevModeRouter.import",
                        msg: error.message,
                        error: error
                    });
                    res.status(400).send({
                            problem: "CSV parsing error has occurred",
                            error: error,
                        });
                },

                // Handle the end of CSV parsing
                () => {
                    results = {
                        counts: {
                            avoids: avoids,
                            fails: fails,
                            ignores: ignores,
                            processes: processes,
                            skips: skips,
                        },
                        problems: allProblems,
//                        checkins: allCheckins,
                    }
                    res.status(200).send(results);
                }

            )
/*
            .on("close", () => {
                logger.info("ONCLOSE: ");
            })
            .on("data", (data: any) => {
                "ONDATA: " + JSON.stringify(data);
            })
            .on("end", () => {
                logger.info("ONEND: ");
            })
            .on("error", (error) => {
                logger.info("ONERROR (CSV): ", error);
            })
            .on("pause", () => {
                logger.info("ONPAUSE: ");
            })
            .on("readable", () => {
                logger.info("ONREADABLE: ");
            })
            .on("resume", () => {
                logger.info("ONRESUME: ");
            })
*/

        });

// Resync database and reload data
DevModeRouter.post("/reload",
    requireNotProduction,
    requireSuperuser,
    async (req: Request, res: Response) => {
        res.send(await DevModeServices.reload());
    });

export default DevModeRouter;
