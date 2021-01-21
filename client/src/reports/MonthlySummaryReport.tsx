// MonthlySummaryReport ------------------------------------------------------

// Top-level view for the Monthly Summary Report

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import MonthDropdown from "../components/MonthDropdown";
import SimpleList from "../components/SimpleList";
import {HandleMonth} from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Facility from "../models/Facility";
import Summary from "../models/Summary";
import * as Abridgers from "../util/abridgers";
import logger from "../util/client-logger";
import {endDate, startDate, todayMonth} from "../util/months";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const MonthlySummaryReport = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [facility, setFacility] = useState<Facility>(new Facility());
    const [selectedMonth, setSelectedMonth] = useState<string>(todayMonth());
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [totals, setTotals] = useState<Summary>(new Summary());

    useEffect(() => {

        const fetchSummaries = async () => {

            // Establish the currently selected Facility
            let currentFacility: Facility;
            if (facilityContext.facility) {
                currentFacility = facilityContext.facility;
            } else {
                currentFacility = new Facility({ id: -1, name: "(Select Facility)"});
            }
            setFacility(currentFacility);
            logger.debug({
                context: "MonthlySummaryReport.setFacility",
                facility: Abridgers.FACILITY(currentFacility),
            });

            // Select Summaries for the selected month (if any)
            if ((currentFacility.id > 0) && loginContext.loggedIn) {
                try {
                    const newSummaries = await FacilityClient.checkinsSummaries(
                        currentFacility.id,
                        startDate(selectedMonth),
                        endDate(selectedMonth)
                    );
                    setSummaries(newSummaries);
                    const newTotals: Summary = new Summary();
                    newSummaries.forEach(newSummary => {
                        newTotals.includeSummary(newSummary);
                    })
                    setTotals(newTotals);
                    logger.debug({
                        context: "MonthlySummaryReport.fetchSummaries",
                        count: newSummaries.length,
                    });
                } catch (error) {
                    setSummaries([]);
                    setTotals(new Summary());
                    if (error.response && (error.response.status === 403)) {
                        logger.trace({
                            context: "MonthlySummaryReport.fetchSumamries",
                            msg: "FORBIDDEN",
                        });
                    } else {
                        ReportError("MonthlySummaryReport.fetchSummaries", error);
                    }
                }
            } else {
                setSummaries([]);
                setTotals(new Summary());
                logger.trace({
                    context: "MonthlySummaryReport.fetchSummaries",
                    msg: "SKIPPED",
                });
            }

        }

        fetchSummaries();

    }, [facilityContext, selectedMonth, loginContext.loggedIn]);

    const handleSelectedMonth: HandleMonth = (newSelectedMonth) => {
        setSelectedMonth(newSelectedMonth);
        logger.trace({
            context: "MonthlySummaryReport.handleSelectedMonth",
            month: newSelectedMonth,
        });
    }

    const listFields = [
        "checkinDate",
        "total$$",
        "totalAG",
        "totalCT",
        "totalFM",
        "totalMM",
        "totalSW",
        "totalUK",
        "totalWB",
        "totalAssigned",
        "percentAssigned",
        "totalUnassigned",
        "percentUnassigned",
        "totalMats",
        "totalAmountDisplay"
    ];

    const listHeaders = [
        "Date",
        "$$",
        "AG",
        "CT",
        "FM",
        "MM",
        "SW",
        "UK",
        "WB",
        "Used Mats",
        "Used%",
        "Empty Mats",
        "Empty%",
        "Total Mats",
        "Total $$",
    ];

    const title = (): string => {
        return "Monthly Summary for "
            + selectedMonth
            + " at " + facility.name;
    }

    const totalFields = [
        "total$$",
        "totalAG",
        "totalCT",
        "totalFM",
        "totalMM",
        "totalSW",
        "totalUK",
        "totalWB",
        "totalAssigned",
        "percentAssigned",
        "totalUnassigned",
        "percentUnassigned",
        "totalMats",
        "totalAmountDisplay"
    ];

    const totalHeaders = [
        "$$",
        "AG",
        "CT",
        "FM",
        "MM",
        "SW",
        "UK",
        "WB",
        "Used Mats",
        "Used%",
        "Empty Mats",
        "Empty%",
        "Total Mats",
        "Total $$",
    ];

    return (

        <Container fluid id="MonthlySummaryReport">

            <Row className="ml-2 mr-2 mb-3">
                <Col className="col-9 ml-2 text-left">
                    <span>
                        Report Date: {(new Date()).toLocaleString()}
                    </span>
                </Col>
                <Col className="mr-2 text-right">
                    <MonthDropdown
                        autoFocus={true}
                        handleMonth={handleSelectedMonth}
                        label="Report For:"
                        max="2023-12"
                        min="2020-01"
                        value={selectedMonth}
                    />
                </Col>
            </Row>

            <Row className="ml-1 mr-1 mb-3">
                <SimpleList
                    items={summaries}
                    listFields={listFields}
                    listHeaders={listHeaders}
                    title={title()}
                />
            </Row>

            <Row className="ml-1 mr-1">
                <SimpleList
                    items={[totals]}
                    listFields={totalFields}
                    listHeaders={totalHeaders}
                />
            </Row>

        </Container>

    )

}

export default MonthlySummaryReport;
