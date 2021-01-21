// FacilitiesView ------------------------------------------------------------

// Administrator view for listing and editing Facilities

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import
    { HandleFacility, HandleFacilityOptional, Scopes }
from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import FacilityForm from "../forms/FacilityForm";
import Facility from "../models/Facility";
import FacilitiesSubview from "../subviews/FacilitiesSubview";
import * as Abridgers from "../util/abridgers";
import logger from "../util/client-logger";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const FacilitiesView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canAdd, setCanAdd] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [facility, setFacility] = useState<Facility | null>(null);

    useEffect(() => {

        const fetchFacilities = async () => {

            // Facilities will actually be fetched in FacilitiesSubview

            // Record current permissions
            const isAdmin = loginContext.validateScope(Scopes.ADMIN)
            const isSuperuser = loginContext.validateScope(Scopes.SUPERUSER);
            setCanAdd(isSuperuser);
            setCanEdit(isAdmin);
            setCanRemove(isSuperuser);

        }

        fetchFacilities();

    }, [facilityContext, loginContext ]);

    const handleInsert: HandleFacility = async (newFacility) => {
        try {
            const inserted: Facility
                = await FacilityClient.insert(newFacility);
            setFacility(null);
            facilityContext.setRefresh(true);
            logger.info({
                context: "FacilitiesView.handleInsert",
                facility: Abridgers.FACILITY(inserted),
            });
        } catch (error) {
            ReportError("FacilitiesView.handleInsert", error);
        }
    }

    const handleRemove: HandleFacility = async (newFacility) => {
        try {
            const removed: Facility
                = await FacilityClient.remove(newFacility.id);
            setFacility(null);
            facilityContext.setRefresh(true);
            logger.info({
                context: "FacilitiesView.handleRemove",
                facility: Abridgers.FACILITY(removed),
            });
        } catch (error) {
            ReportError("FacilitiesView.handleRemove", error);
        }
    }

    const handleSelect: HandleFacilityOptional = (newFacility) => {
        if (newFacility) {
            if (canEdit) {
                setFacility(newFacility);
            }
            logger.debug({
                context: "FacilitiesView.handleSelect",
                canEdit: canEdit,
                canRemove: canRemove,
                facility: Abridgers.FACILITY(newFacility),
            });
        } else {
            setFacility(null);
            logger.trace({ context: "FacilitiesView.handleSelect", msg: "UNSET" });
        }
    }

    const handleUpdate: HandleFacility = async (newFacility) => {
        try {
            const updated: Facility
                = await FacilityClient.update(newFacility.id, newFacility);
            setFacility(null);
            facilityContext.setRefresh(true);
            logger.info({
                context: "FacilitiesView.handleUpdate",
                facility: Abridgers.FACILITY(updated),
            });
        } catch (error) {
            ReportError("FacilitiesView.handleUpdate", error);
        }
    }

    const onAdd = () => {
        const newFacility: Facility = new Facility({
            id: -1
        });
        setFacility(newFacility);
        logger.trace({ context: "FacilitiesView.onAdd", facility: newFacility });
    }

    const onBack = () => {
        setFacility(null);
        logger.trace({ context: "FacilitiesView.onBack" });
    }

    return (
        <>
            <Container fluid id="FacilitiesView">

                {/* List View */}
                {(!facility) ? (

                    <>

                        <Row className="ml-1 mr-1 mb-3">
                            <FacilitiesSubview
                                handleSelect={handleSelect}
                            />
                        </Row>

                        <Row className="ml-4">
                            <Button
                                disabled={!canAdd}
                                onClick={onAdd}
                                size="sm"
                                variant="primary"
                            >
                                Add
                            </Button>
                        </Row>

                    </>

                ) : null }

                {/* Detail View */}
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
                                autoFocus
                                canRemove={canRemove}
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

export default FacilitiesView;
