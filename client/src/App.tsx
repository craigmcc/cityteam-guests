// App -----------------------------------------------------------------------

// Overall implementation of the entire application.

// External Modules -----------------------------------------------------------

import React from 'react';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
//import NavDropdown from "react-bootstrap/cjs/NavDropdown";
import NavItem from "react-bootstrap/NavItem";
import Row from "react-bootstrap/Row";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Internal Modules

import FacilitySelector from "./components/FacilitySelector";
//import FacilityContext from "./contexts/FacilityContext";
//import LoginContext from "./contexts/LoginContext";
import HomeView from "./views/HomeView";
import FacilityView from "./views/FacilityView";

function App() {
  return (
      <>

        {/*<LoginContext.Provider>*/}
        {/*<FacilityContext.Provider>*/}

          <Router>

            <Navbar
                bg="info"
                className="mb-3"
                expand="lg"
                sticky="top"
                variant="dark"
            >

              <Navbar.Brand>
                CityTeam Guests
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-brand"/>

              <Navbar.Collapse id="basic-navbar-brand">
                <Nav className="mr-auto">
                  <LinkContainer to="/home">
                    <NavItem className="nav-link">Home</NavItem>
                  </LinkContainer>
                </Nav>
                <Nav className="mr-auto">
                  <LinkContainer to="/facility">
                    <NavItem className="nav-link">Facility</NavItem>
                  </LinkContainer>
                </Nav>
                {/* NavDropdown things can go here */}
                {/* Right-justified non-nav stuff can go here */}
                <Row className="mr-1">
                  <span className="text-right">
                    <FacilitySelector
                        label="Facility:"
                    />
                  </span>
                </Row>
              </Navbar.Collapse>

            </Navbar>

            <Switch>
              <Route exact path="/facility">
                <FacilityView/>
              </Route>
              <Route path="/">
                <HomeView/>
              </Route>
            </Switch>

          </Router>

        {/*</FacilityContext.Provider>*/}
        {/*</LoginContext.Provider>*/}

      </>

  );

}

export default App;
