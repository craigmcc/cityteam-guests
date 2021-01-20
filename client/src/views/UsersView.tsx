// UsersView ------------------------------------------------------------------

// Administrator view for editing User objects.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import { HandleUser, HandleUserOptional, Scopes } from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import UserForm from "../forms/UserForm";
import Facility from "../models/Facility";
import User from "../models/User";
import UsersSubview from "../subviews/UsersSubview";
import * as Abridgers from "../util/abridgers";
import logger from "../util/client-logger";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const UsersView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [canAdd, setCanAdd] = useState<boolean>(false);
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const [canRemove, setCanRemove] = useState<boolean>(false);
    const [facility, setFacility] = useState<Facility>(new Facility());
    const [refresh, setRefresh] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {

        const fetchUsers = async () => {

            // Establish the currently selected Facility
            let currentFacility: Facility;
            if (facilityContext.facility) {
                currentFacility = facilityContext.facility;
            } else {
                currentFacility = new Facility({ id: -1, name: "(Select Facility)"});
            }
            setFacility(currentFacility);
            logger.debug({
                context: "UsersView.setFacility",
                facility: Abridgers.FACILITY(currentFacility),
            });

            // Record current permissions
            const isAdmin = loginContext.validateScope(Scopes.ADMIN);
            setCanAdd(isAdmin);
            setCanEdit(isAdmin);
            setCanRemove(loginContext.validateScope(Scopes.SUPERUSER));

            // Reset refresh flag if necessary
            if (refresh) {
                setRefresh(false);
            }

        }

        fetchUsers();

    }, [facilityContext, loginContext, facility.id, refresh]);

    const handleInsert: HandleUser = async (newUser) => {
        try {
            const inserted: User
                = await FacilityClient.usersInsert(facility.id, newUser);
            setRefresh(true);
            setUser(null);
            logger.info({
                context: "UsersView.handleInsert",
                user: Abridgers.USER(inserted),
            });
        } catch (error) {
            ReportError("UsersView.handleInsert", error);
        }
    }

    const handleRemove: HandleUser = async (newUser) => {
        try {
            const removed: User
                = await FacilityClient.usersRemove(facility.id, newUser.id);
            setRefresh(true);
            setUser(null);
            logger.info({
                context: "UsersView.handleRemove",
                user: Abridgers.USER(removed),
            });
        } catch (error) {
            ReportError("UsersView.handleRemove", error);
        }
    }

    const handleSelect: HandleUserOptional = (newUser) => {
        if (newUser) {
            setUser(newUser);
            logger.debug({
                context: "UsersView.handleSelect",
                canEdit: canEdit,
                canRemove: canRemove,
                user: Abridgers.USER(newUser),
            });
        } else {
            setUser(null);
            logger.debug({ context: "UsersView.handleSelect", msg: "UNSET" });
        }
    }

    const handleUpdate: HandleUser = async (newUser) => {
        try {
            const updated: User = await FacilityClient.usersUpdate
                (facility.id, newUser.id, newUser);
            setRefresh(true);
            setUser(null);
            logger.info({
                context: "UsersView.handleUpdate",
                user: Abridgers.USER(updated),
            });
        } catch (error) {
            ReportError("UsersView.handleUpdate", error);
        }
    }

    const onAdd = () => {
        const newUser: User = new User({
            facilityId: facility.id,
            id: -1,
            level: "info",
        });
        setUser(newUser);
        logger.trace({ context: "UsersView.onAdd", user: newUser });
    }

    const onBack = () => {
        setUser(null);
        logger.trace({ context: "UsersView.onBack" });
    }

    return (
        <>
            <Container fluid id="UserView">

                {/* List View */}
                {(!user) ? (

                    <>

                        <Row className="ml-1 mr-1 mb-3">
                            <UsersSubview
                                handleSelect={handleSelect}
                            />
                        </Row>

                        <Row className="ml-1 mr-1">
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

                {(user) ? (

                    <>

                        <Row className="ml-1 mr-1 mb-3">
                            <Col className="text-left">
                                <strong>
                                    <>
                                        {(user.id < 0) ? (
                                            <span>Adding New</span>
                                        ) : (
                                            <span>Editing Existing</span>
                                        )}
                                        &nbsp;User
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

                        <Row className="ml-1 mr-1">
                            <UserForm
                                autoFocus
                                canRemove={canRemove}
                                handleInsert={handleInsert}
                                handleRemove={handleRemove}
                                handleUpdate={handleUpdate}
                                user={user}
                            />
                        </Row>

                    </>

                ) : null }

            </Container>
        </>
    )

}

export default UsersView;
