// FacilityContext -----------------------------------------------------------

// React Context containing the currently available (or all) Facilities
// that are visible to the logged in user (TODO - latter part needs to be done).

// External Modules -----------------------------------------------------------

import React, {createContext, useContext, useEffect, useState} from "react";

// Internal Modules -----------------------------------------------------------

import LoginContext from "./LoginContext";
import FacilityClient from "../clients/FacilityClient";
import Facility from "../models/Facility";
import * as Replacers from "../util/replacers";
import ReportError from "../util/ReportError";
import {HandleIndex} from "../components/types";

// Context Properties ---------------------------------------------------------

export type FacilityContextData = {
    facilities: Facility[];         // Facilities visible to this user
    facility: Facility | null;      // Currently selected facility (or null)
    index: number;                  // Index of currently selected facility
                                    // (< 0 means none)
    setFacilities: (facilities: Facility[]) => void;
    setIndex: (newIndex: number) => void;
    setRefresh: (newRefresh: boolean) => void;
}

export const FacilityContext = createContext<FacilityContextData>({
    facilities: [],
    facility: null,
    index: -1,
    setFacilities: (facilities: Facility[]): void => {},
    setIndex: (index: number): void => {},
    setRefresh: (refresh: boolean): void => {},
});

export default FacilityContext;

// Context Provider ----------------------------------------------------------

export const FacilityContextProvider = (props: any) => {

    const loginContext = useContext(LoginContext);

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [facility, setFacility] = useState<Facility | null>(null);
    const [index, setIndex] = useState<number>(-1);
    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {

        const fetchFacilities = async () => {

            // Fetch the active Facilities this user has access to
            try {
                const newFacilities: Facility[] = [];
                if (loginContext.loggedIn) {
                    const activeFacilities: Facility[] = await FacilityClient.active();
                    activeFacilities.forEach(activeFacility => {
                        if (loginContext.validateScope(activeFacility.scope)) {
                            newFacilities.push(activeFacility);
                        }
                    });
                }
                console.info("FacilityContext.fetchFacilities("
                    + JSON.stringify(newFacilities, Replacers.FACILITY)
                    + ")");
                setFacilities(newFacilities);
                if (newFacilities.length > 0) {
                    setFacility(newFacilities[0]);
                    setIndex(0);
                } else {
                    setFacility(null);
                    setIndex(-1);
                }

                // Reset refresh flag if necessary
                if (refresh) {
                    setRefresh(false);
                }

            } catch (error) {
                ReportError("FacilityContext.fetchData", error);
                setFacilities([]);
                setFacility(null);
                setIndex(-1);
            }
        }

        fetchFacilities()

    }, [loginContext, refresh]);

    const updateIndex: HandleIndex = (newIndex) => {
        if (newIndex < 0) {
            console.info("FacilityContext.updateIndex(UNSET)");
            setFacility(null);
            setIndex(-1);
        } else if (newIndex >= facilities.length) {
            console.info("FacilityContext.updateIndex("
                + newIndex + ", "
                + "RESET TO -1"
                + ")");
            setFacility(null);
            setIndex(-1);
        } else {
            console.info("FacilityContext.updateIndex("
                + newIndex + ", "
                + JSON.stringify(facilities[newIndex], Replacers.FACILITY)
                + ")");
            setFacility(facilities[newIndex]);
            setIndex(newIndex);
        }
    }

    // Create the context object
    const facilityContext: FacilityContextData = {
        facilities: facilities,
        facility: facility,
        index: index,
        setFacilities: setFacilities,
        setIndex: updateIndex,
        setRefresh: setRefresh,
    }

    // Return the context, rendering children inside
    return (
        <FacilityContext.Provider value={facilityContext}>
            {props.children}
        </FacilityContext.Provider>
    )

}
