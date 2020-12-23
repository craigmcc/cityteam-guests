// App -----------------------------------------------------------------------

// Overall implementation of the entire application.

// External Modules -----------------------------------------------------------

import React from 'react';
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
//import NavDropdown from "react-bootstrap/cjs/NavDropdown";
import NavItem from "react-bootstrap/NavItem";
import Row from "react-bootstrap/Row";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Internal Modules ----------------------------------------------------------

import FacilitySelector from "./components/FacilitySelector";
import LoggedInUser from "./components/LoggedInUser";
import { FacilityContextProvider } from "./contexts/FacilityContext";
import { LoginContextProvider } from "./contexts/LoginContext";
import HomeView from "./views/HomeView";
import FacilityView from "./views/FacilityView";

// Component Details ---------------------------------------------------------

function App() {
  return (
      <>

        <LoginContextProvider>
        <FacilityContextProvider>

          <Router>

            <Navbar
                bg="info"
                className="mb-3"
                expand="lg"
                sticky="top"
                variant="dark"
            >

              <Navbar.Brand>
                <img
                  alt="CityTeam Logo"
                  height={66}
                  src="./CityTeamDarkBlue.png"
                  width={160}
                />
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-brand"/>

              <Navbar.Collapse id="basic-navbar-brand">
                <Nav className="mr-auto">
                  <LinkContainer to="/home">
                    <NavItem className="nav-link">Home</NavItem>
                  </LinkContainer>
                </Nav>
                <Nav className="mr-auto">
                  <LinkContainer to="/facilities">
                    <NavItem className="nav-link">Facilities</NavItem>
                  </LinkContainer>
                </Nav>
                {/* NavDropdown things can go here */}
                {/* Right-justified non-nav stuff can go here */}
                <Row className="align-content-end auto">
                  <Col>
                    <LoggedInUser/>
                  </Col>
                  <Col>
                    <FacilitySelector/>
                  </Col>
                </Row>
              </Navbar.Collapse>

            </Navbar>

            <Switch>
              <Route exact path="/facilities">
                <FacilityView/>
              </Route>
              <Route path="/">
                <HomeView/>
              </Route>
            </Switch>

          </Router>

        </FacilityContextProvider>
        </LoginContextProvider>

      </>

  );

}

export default App;
