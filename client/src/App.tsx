// App -----------------------------------------------------------------------

// Overall implementation of the entire application.

// External Modules -----------------------------------------------------------

import React from 'react';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/cjs/NavDropdown";
import NavItem from "react-bootstrap/NavItem";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Internal Modules ----------------------------------------------------------

import FacilitySelector from "./components/FacilitySelector";
import LoggedInUser from "./components/LoggedInUser";
import { FacilityContextProvider } from "./contexts/FacilityContext";
import { LoginContextProvider } from "./contexts/LoginContext";
import GuestHistoryReport from "./reports/GuestHistoryReport";
import MonthlySummaryReport from "./reports/MonthlySummaryReport";
import CheckinsView from "./views/CheckinsView";
import FacilitiesView from "./views/FacilitiesView";
import GuestsView from "./views/GuestsView";
import HomeView from "./views/HomeView";
import TemplatesView from "./views/TemplatesView";
import UsersView from "./views/UsersView";

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
                  <NavDropdown id="reports" title="Reports">
                    <LinkContainer to="/guestHistoryReport">
                      <NavDropdown.Item>Guest History</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/monthlySummaryReport">
                      <NavDropdown.Item>Monthly Summary</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                </Nav>
              </Navbar.Collapse>

              <LoggedInUser/>
              <span className="mr-4"/>
              <FacilitySelector/>

            </Navbar>

            <Switch>
              <Route exact path="/checkins">
                <CheckinsView/>
              </Route>
              <Route exact path="/facilities">
                <FacilitiesView/>
              </Route>
              <Route exact path="/guestHistoryReport">
                <GuestHistoryReport/>
              </Route>
              <Route exact path="/guests">
                <GuestsView/>
              </Route>
              <Route exact path="/monthlySummaryReport">
                <MonthlySummaryReport/>
              </Route>
              <Route exact path="/templates">
                <TemplatesView/>
              </Route>
              <Route exact path="/users">
                <UsersView/>
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
