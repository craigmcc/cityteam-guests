// FacilityContext -----------------------------------------------------------

// React Context containing the currently available (or all) Facilities
// that are visible to the logged in user (TODO - latter part needs to be done).

// External Modules -----------------------------------------------------------

import React, { createContext, useEffect, useState } from "react";

// Internal Modules -----------------------------------------------------------

import FacilityClient from "../clients/FacilityClient";
import Facility from "../models/Facility";
import * as Replacers from "../util/Replacers";
import ReportError from "../util/ReportError";

// Context Properties ---------------------------------------------------------

export interface Props {
    all?: boolean                   // Show all, not just active? [false]
    children: React.ReactNode;      // Child components [React deals with this]
}

export interface FacilityContextData {
    facilities: Facility[];         // Facilities visible to this user
    index: number;                  // Index of currently selected facility
                                    // (< 0 means none)
    setFacilities: (facilities: Facility[]) => void;
    setIndex: (newIndex: number) => void;
}

export const FacilityContext = createContext<FacilityContextData>({
    facilities: [],
    index: -1,
    setFacilities: (facilities: Facility[]): void => {},
    setIndex: (index: number): void => {}
});

// Context Provider ----------------------------------------------------------

export const FacilityContextProvider = (props: Props) => {

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [index, setIndex] = useState<number>(-1);

    useEffect(() => {

        // TODO - filter by user scope
        const fetchData = async () => {
            try {
                let newFacilities: Facility[] = [];
                if (props.all) {
                    newFacilities = await FacilityClient.all();
                } else {
                    newFacilities = await FacilityClient.active();
                }
                console.info("FacilityContext.fetchData("
                    + JSON.stringify(newFacilities, Replacers.FACILITY)
                    + ")");
                setFacilities(newFacilities);
                // Select first possible Facility by default if present
                // TODO - save previous index and restore reflecting updates???
                setIndex(newFacilities.length > 0 ? 0 : -1);
            } catch (error) {
                ReportError("FacilityContext.fetchData()", error);
                setFacilities([]);
            }
        }

        fetchData();

    }, [ facilities, index ]);

    // Create the context object
    const facilityContext: FacilityContextData = {
        facilities: facilities,
        index: index,
        setFacilities: setFacilities,
        setIndex: setIndex,
    }

    // Return the context, rendering children inside
    return (
        <FacilityContext.Provider value={facilityContext}>
            {props.children}
        </FacilityContext.Provider>
    )

}

export default FacilityContext;
