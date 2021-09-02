// UsersSubview --------------------------------------------------------------

// Render a list of Users for the current Facility, with a callback to
// handleSelect(user) when a particular User is selected, or
// handleSelect(null) if a previously selected User is unselected.

// External Modules ----------------------------------------------------------

import React, { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

// Internal Modules ----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import SimpleList from "../components/SimpleList";
import { HandleUserOptional, HandleIndex } from "../components/types";
import FacilityContext from "../contexts/FacilityContext";
import LoginContext from "../contexts/LoginContext";
import Facility from "../models/Facility";
import User from "../models/User";
import * as Abridgers from "../util/abridgers";
import logger from "../util/client-logger";
import ReportError from "../util/ReportError";

// Incoming Properties -------------------------------------------------------

export interface Props {
    handleSelect: HandleUserOptional;
                                    // Return selected (Template) for processing,
                                    // or null if previous selection was unselected
    title?: string;                 // Table title [Users for {facility.name}]
}

// Component Details ---------------------------------------------------------

const UsersSubview = (props: Props) => {

    const facilityContext = useContext(FacilityContext);
    const loginContext = useContext(LoginContext);

    const [facility, setFacility] = useState<Facility>(new Facility());
    const [index, setIndex] = useState<number>(-1);
    const [users, setUsers] = useState<User[]>([]);

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
                context: "UsersSubview.setFacility",
                facility: Abridgers.FACILITY(currentFacility),
            });

            // Fetch Users for this Facility (if any)
            if ((currentFacility.id >= 0) && loginContext.loggedIn) {
                try {
                    const newUsers: User[] =
                        await FacilityClient.usersAll(currentFacility.id);
                    setIndex(-1);
                    setUsers(newUsers);
                    logger.debug({
                        context: "UsersSubview.fetchUsers",
                        count: newUsers.length,
                    });
                } catch (error) {
                    setIndex(-1);
                    setUsers([]);
                    // @ts-ignore
                    if (error.response && (error.response.status === 403)) {
                        logger.debug({
                            context: "UsersSubview.fetchUsers",
                            msg: "FORBIDDEN",
                        });
                    } else {
                        ReportError("UsersSubview.fetchUsers", error);
                    }
                }
            } else {
                setIndex(-1);
                setUsers([]);
                logger.debug({
                    context: "UsersSubview.fetchUsers",
                    msg: "SKIPPED",
                });
            }

        }

        fetchUsers();

    }, [facilityContext, loginContext.loggedIn]);

    const handleIndex: HandleIndex = (newIndex) => {
        if (newIndex === index) {
            setIndex(-1);
            logger.trace({ context: "UsersSubview.handleIndex", msg: "UNSET" });
            if (props.handleSelect) {
                props.handleSelect(null);
            }
        } else {
            const newUser = users[newIndex];
            setIndex(newIndex);
            logger.debug({
                context: "UsersSubview.handleIndex",
                index: newIndex,
                user: Abridgers.USER(newUser),
            });
            if (props.handleSelect) {
                props.handleSelect(newUser);
            }
        }
    }

    const listFields = [
        "name",
        "active",
        "username",
        "scope",
        "level",
    ]

    const listHeaders = [
        "Name",
        "Active",
        "Username",
        "Scope",
        "Level",
    ]

    return (

        <Container fluid id="UsersSubview">
            <Row>
                <SimpleList
                    handleIndex={handleIndex}
                    items={users}
                    listFields={listFields}
                    listHeaders={listHeaders}
                    title={props.title ? props.title : `Users for ${facility.name}`}
                />
            </Row>
        </Container>
    )

}

export default UsersSubview;
