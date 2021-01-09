// HomeView ------------------------------------------------------------------

// This will eventually become a login/logout page or something.

// External Modules ----------------------------------------------------------

import React from "react";
import Container from "react-bootstrap/Container";

// Internal Modules ----------------------------------------------------------


// Component Details ---------------------------------------------------------

const HomeView = () => {

    return (
        <>
            <Container fluid id="HomeView">

                <p>Welcome to the CityTeam Guest Checkin App!</p>

                <p>
                    Please log in before proceeding to select
                    the menu option you wish to use.
                </p>

            </Container>
        </>
    )

}

export default HomeView;
