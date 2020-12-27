// UserView ------------------------------------------------------------------

// Administrator view for editing User objects.

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
import UserForm, { HandleUser } from "../forms/UserForm";
import Facility from "../models/Facility";
import User from "../models/User";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";

// Component Details ---------------------------------------------------------

const UserView = () => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [facility, setFacility] = useState<Facility>(new Facility());
    const [index, setIndex] = useState<number>(-1);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {

        const fetchUsers = async () => {

            const newFacility = facilityContext.index >= 0
                ? facilityContext.facilities[facilityContext.index]
                : new Facility({ name: "(Select)" });
            console.info("UserView.setFacility("
                + JSON.stringify(newFacility, Replacers.FACILITY)
                + ")");
            setFacility(newFacility);

            try {
                if (newFacility.id > 0) {
                    const newUsers: User[]
                        = await FacilityClient.usersAll(newFacility.id);
                    newUsers.forEach(newUser => {
                        newUser.password = "";
                    })
                    console.info("UserView.fetchUsers("
                        + JSON.stringify(newUsers, Replacers.USER)
                        + ")");
                    setUsers(newUsers);
                } else {
                    setUsers([]);
                }
                setRefresh(false);
            } catch (error) {
                setUsers([]);
                ReportError("UserView.fetchUsers", error);
            }

        }

        fetchUsers();

    }, [facilityContext, refresh]);

    const addEnabled = (): boolean => {
        return loginContext.validateScope("admin");
    }

    const handleIndex = (newIndex: number): void => {
        if (newIndex === index) {
            console.info("UserView.handleIndex(-1)");
            setIndex(-1);
            setUser(null);
        } else {
            console.info("UserView.handleIndex("
                + newIndex + ", "
                + JSON.stringify(users[newIndex], Replacers.TEMPLATE)
                + ")");
            if (loginContext.validateScope("admin")) {
                setUser(users[newIndex]);
            }
            setIndex(newIndex)
        }
    }

    const handleInsert: HandleUser
        = async (newUser) =>
    {
        try {
            const inserted: User
                = await FacilityClient.usersInsert(facility.id, newUser);
            console.info("UserView.handleInsert("
                + JSON.stringify(inserted, Replacers.USER)
                + ")");
            setIndex(-1);
            setRefresh(true);
            setUser(null);
        } catch (error) {
            ReportError("UserView.handleInsert", error);
        }
    }

    const handleRemove: HandleUser
        = async (newUser) => {
        try {
            const removed: User
                = await FacilityClient.usersRemove(facility.id, newUser.id);
            console.info("UserView.handleRemove("
                + JSON.stringify(removed, Replacers.USER)
                + ")");
            setIndex(-1);
            setRefresh(true);
            setUser(null);
        } catch (error) {
            ReportError("UserView.handleRemove", error);
        }
    }

    const handleUpdate: HandleUser
        = async (newUser) => {
        try {
            const removed: User = await FacilityClient.usersUpdate
            (facility.id, newUser.id, newUser);
            console.info("UserView.handleUpdate("
                + JSON.stringify(removed, Replacers.USER)
                + ")");
            setIndex(-1);
            setRefresh(true);
            setUser(null);
        } catch (error) {
            ReportError("UserView.handleUpdate", error);
        }
    }

    const listFields = [
        "name",
        "active",
        "username",
        "scope",
    ]

    const listHeaders = [
        "Name",
        "Active",
        "Username",
        "Scope",
    ]

    const onAdd = () => {
        console.info("UserView.onAdd()");
        setIndex(-2);
        const newUser: User = new User({
            facilityId: facility.id,
            id: -2
        });
        setUser(newUser);
    }

    const onBack = () => {
        console.info("UserView.onBack()");
        setIndex(-1);
        setUser(null);
    }

    return (
        <>
            <Container fluid id="UserView">

                {(!user) ? (

                    <>

                        {/* List View */}

                        <Row className="mb-3 ml-1 mr-1">

                            <SimpleList
                                handleIndex={handleIndex}
                                items={users}
                                listFields={listFields}
                                listHeaders={listHeaders}
                                title={"Users for " +
                                    (facility ? facility.name : "(Select)")}
                            />
                        </Row>

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

export default UserView;
