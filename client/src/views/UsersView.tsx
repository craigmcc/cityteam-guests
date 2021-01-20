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
import * as Replacers from "../util/replacers";
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
            console.info("UsersView.setFacility("
                + JSON.stringify(currentFacility, Replacers.FACILITY)
                + ")");
            setFacility(currentFacility);

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
            console.info("UsersView.handleInsert("
                + JSON.stringify(inserted, Replacers.USER)
                + ")");
            setRefresh(true);
            setUser(null);
        } catch (error) {
            ReportError("UsersView.handleInsert", error);
        }
    }

    const handleRemove: HandleUser = async (newUser) => {
        try {
            const removed: User
                = await FacilityClient.usersRemove(facility.id, newUser.id);
            console.info("UsersView.handleRemove("
                + JSON.stringify(removed, Replacers.USER)
                + ")");
            setRefresh(true);
            setUser(null);
        } catch (error) {
            ReportError("UsersView.handleRemove", error);
        }
    }

    const handleSelect: HandleUserOptional = (newUser) => {
        if (newUser) {
            if (canEdit) {
                console.info("UsersView.handleSelect(CAN EDIT, "
                    + JSON.stringify(newUser, Replacers.USER)
                    + ")");
                setUser(newUser);
            } else {
                console.info("UsersView.handleSelect(CANNOT EDIT, "
                    + JSON.stringify(newUser, Replacers.USER)
                    + ")");
            }
        } else {
            console.info("UsersView.handleSelect(UNSET)");
            setUser(null);
        }
    }

    const handleUpdate: HandleUser = async (newUser) => {
        try {
            const updated: User = await FacilityClient.usersUpdate
                (facility.id, newUser.id, newUser);
            console.info("UsersView.handleUpdate("
                + JSON.stringify(updated, Replacers.USER)
                + ")");
            setRefresh(true);
            setUser(null);
        } catch (error) {
            ReportError("UsersView.handleUpdate", error);
        }
    }

    const onAdd = () => {
        console.info("UsersView.onAdd()");
        const newUser: User = new User({
            facilityId: facility.id,
            id: -1,
            level: "info",
        });
        setUser(newUser);
    }

    const onBack = () => {
        console.info("UsersView.onBack()");
        setUser(null);
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
