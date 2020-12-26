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
import CheckinView from "./views/CheckinView";
import HomeView from "./views/HomeView";
import FacilityView from "./views/FacilityView";
import GuestView from "./views/GuestView";
import TemplateView from "./views/TemplateView";
import UserView from "./views/UserView";

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
                  <LinkContainer to="/checkins">
                    <NavItem className="nav-link">Checkins</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/facilities">
                    <NavItem className="nav-link">Facilities</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/guests">
                    <NavItem className="nav-link">Guests</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/templates">
                    <NavItem className="nav-link">Templates</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/users">
                    <NavItem className="nav-link">Users</NavItem>
                  </LinkContainer>
                </Nav>
              </Navbar.Collapse>
              {/* NavDropdown things can go here */}
              {/* Right-justified non-nav stuff can go here */}
                <LoggedInUser/>
                <span className="mr-4"/>
                <FacilitySelector/>

            </Navbar>

            <Switch>
              <Route exact path="/checkins">
                <CheckinView/>
              </Route>
              <Route exact path="/facilities">
                <FacilityView/>
              </Route>
              <Route exact path="/guests">
                <GuestView/>
              </Route>
              <Route exact path="/templates">
                <TemplateView/>
              </Route>
              <Route exact path="/users">
                <UserView/>
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
