// FacilityView --------------------------------------------------------------

// Administrator view for editing Facility objects.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import FacilityForm, { HandleFacility } from "../forms/FacilityForm";
import Facility from "../models/Facility";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const FacilityView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [facility, setFacility] = useState<Facility | null>(null);
    const [index, setIndex] = useState<number>(-1);

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

    }, [facilityContext.facilities]);

    const addEnabled = (): boolean => {
        return loginContext.validateScope("superuser");
    }

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
            if (loginContext.validateScope("admin")) {
                setFacility(facilities[newIndex]);
            }
            setIndex(newIndex)
        }
    }

    const handleInsert: HandleFacility
        = async (newFacility) =>
    {
        try {
            const inserted: Facility = await FacilityClient.insert(newFacility);
            console.info("FacilityView.handleInsert("
                + JSON.stringify(inserted, Replacers.FACILITY)
                + ")");
            setIndex(-1);
            setFacility(null);
            facilityContext.setRefresh(true);
        } catch (error) {
            ReportError("FacilityView.handleInsert", error);
        }
    }

    const handleRemove: HandleFacility
        = async (newFacility: Facility) =>
    {
        try {
            const removed: Facility = await FacilityClient.remove(newFacility.id);
            console.info("FacilityView.handleRemove("
                + JSON.stringify(removed, Replacers.FACILITY)
                + ")");
            setIndex(-1);
            setFacility(null);
            facilityContext.setRefresh(true);
        } catch (error) {
            ReportError("FacilityView.handleRemove", error);
        }
    }

    const handleUpdate: HandleFacility
        = async (newFacility) =>
    {
        try {
            const updated: Facility = await FacilityClient.update(newFacility.id, newFacility);
            console.info("FacilityView.handleUpdate("
                + JSON.stringify(updated, Replacers.FACILITY)
                + ")");
            setIndex(-1);
            setFacility(null);
            facilityContext.setRefresh(true);
        } catch (error) {
            ReportError("FacilityView.handleInsert", error);
        }
    }

    const listFields = [
        "name",
        "active",
        "city",
        "state",
        "zipCode",
        "email",
        "phone",
        "scope",
    ]

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
        const newFacility: Facility = new Facility({
            id: -2
        });
        setFacility(newFacility);
    }

    const onBack = () => {
        console.info("FacilityView.onBack()");
        setIndex(-1);
        setFacility(null);
    }

    return (
        <>
            <Container fluid id="FacilityView">

                {(!facility) ? (

                    <>

                        <SimpleList
                            handleIndex={handleIndex}
                            items={facilities}
                            listFields={listFields}
                            listHeaders={listHeaders}
                            title="Facilities"
                        />

                        <Row className="ml-1 mr-1">
                            <Button
                                disabled={!addEnabled()}
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
                            <FacilityForm
                                autoFocus={true}
                                facility={facility}
                                handleInsert={handleInsert}
                                handleRemove={handleRemove}
                                handleUpdate={handleUpdate}
                            />
                        </Row>

                    </>

                ) : null }

            </Container>

        </>
    )

}

export default FacilityView;
