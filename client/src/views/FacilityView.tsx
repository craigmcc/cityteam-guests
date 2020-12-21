// FacilityView --------------------------------------------------------------

// Administrator view for editing Facility objects.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

//import FacilityClient from "../clients/FacilityClient";
import FacilityContext, { FacilityContextData } from "../contexts/FacilityContext";
import Facility from "../models/Facility";
import * as Replacers from "../util/Replacers";
//import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const FacilityView = () => {

    const facilityContext: FacilityContextData = useContext(FacilityContext);

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [facility, setFacility] = useState<Facility | null>(null);
    const [index, setIndex] = useState<number>(-1);
//    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {

        const fetchData = () => {
            let newFacilities: Facility[] = [];
            facilityContext.facilities.forEach((oldFacility) => {
                newFacilities.push(oldFacility);
            });
            console.info("FacilityView.fetchData("
                + JSON.stringify(newFacilities, Replacers.FACILITY)
                + ")");
            setFacilities(newFacilities);
        }

        fetchData();
//        setRefresh(false); // TODO - needed?

    }, [facilityContext /*, refresh */]); // Updating facilityContext should trigger

    const handleIndex = (newIndex: number): void => {
        if (newIndex === index) {
            console.info("FacilityView.handleIndex(-1)");
            setIndex(-1);
            setFacility(null);
        } else {
            console.info("FacilityView.handleIndex("
                + newIndex + ", "
                + JSON.stringify(facilities[newIndex], Replacers.FACILITY)
                + ")");
            setIndex(newIndex)
            setFacility(facilities[newIndex]);
            facilityContext.setIndex(newIndex); // Trigger refetch
        }
    }

    const listHeaders = [
        "Name",
        "Active",
        "City",
        "State",
        "Zip Code",
        "Email Address",
        "Phone Number",
        "Scope"
    ];

    const onAdd = () => {
        console.info("FacilityView.onAdd()");
        setIndex(-2);
        const blankFacility: Facility = {
            active: true,
            address1: "",
            address2: "",
            city: "",
            email: "",
            id: -2,
            name: "",
            phone: "",
            scope: "",
            state: "",
            zipCode: "",
        };
        setFacility(blankFacility);
    }

    const onBack = () => {
        console.info("FacilityView.onBack()");
        setIndex(-1);
        setFacility(null);
    }

    const value = (value: any): string => {
        if (typeof(value) === "boolean") {
            return value ? "Yes" : "No"
        } else if (!value) {
            return "";
        } else {
            return value;
        }
    }

    const values = (facility: Facility): string[] => {
        let results: string[] = [];
        results.push(value(facility.name));
        results.push(value(facility.active));
        results.push(value(facility.city));
        results.push(value(facility.state));
        results.push(value(facility.zipCode));
        results.push(value(facility.email));
        results.push(value(facility.phone));
        results.push(value(facility.scope));
        return results;
    }

    return (
        <>
            <Container fluid id="FacilityView">

                {(!facility) ? (

                    <>

                    <Row className="mb-3 ml-1 mr-1">
                        <Table
                            bordered
                            hover
                            size="sm"
                            striped
                        >

                            <thead>
                                <tr className="table-dark" key={100}>
                                    <th
                                        className="text-center"
                                        colSpan={8}
                                        key={101}
                                    >
                                        All Facilities
                                    </th>
                                </tr>
                                <tr className="table-secondary" key={102}>
                                    {listHeaders.map((header, index) => (
                                        <th key={200 + index + 1} scope="col">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                            {facilities.map((facility, rowIndex) => (
                                <tr
                                    className={"table-" +
                                        (rowIndex === index ? "primary" : "default")}
                                    key={1000 + (rowIndex * 100)}
                                    onClick={() => (handleIndex(rowIndex))}
                                >
                                    {values(facility).map((value: string, colIndex: number) => (
                                        <td
                                            data-key={1000 + (rowIndex * 100) + colIndex + 1}
                                            key={1000 + (rowIndex * 100) + colIndex + 1}
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>

                        </Table>
                    </Row>

                    <Row className="ml-1 mr-1">
                        <Button
                            onClick={onAdd}
                            size="sm"
                            variant="primary"
                        >
                            Add
                        </Button>
                    </Row>

                    </>

                ) : null }

                {(facility) ? (

                    <>

                        <Row className="ml-1 mr-1 mb-3">
                            <Col className="text-left">
                                <strong>
                                    <>
                                        {(facility.id < 0) ? (
                                            <span>Adding New</span>
                                        ) : (
                                            <span>Editing Existing</span>
                                        )}
                                        &nbsp;Facility
                                    </>
                                </strong>
                            </Col>
                            <Col className="text-right">
                                <Button
                                    onClick={onBack}
                                    size="sm"
                                    type="button"
                                    variant="secondary"
                                >
                                    Back
                                </Button>
                            </Col>
                        </Row>

                        <Row>
                            <pre>{JSON.stringify(facility, null, 2)}</pre>
                        </Row>

                    </>

                ) : null }

            </Container>

        </>
    )

}

export default FacilityView;
