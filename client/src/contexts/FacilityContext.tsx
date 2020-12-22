// FacilityContext -----------------------------------------------------------

// React Context containing the currently available (or all) Facilities
// that are visible to the logged in user (TODO - latter part needs to be done).

// External Modules -----------------------------------------------------------

import React, {createContext, /*useContext,*/ useEffect, useState} from "react";

// Internal Modules -----------------------------------------------------------

//import LoginContext from "./LoginContext";
import FacilityClient from "../clients/FacilityClient";
import Facility from "../models/Facility";
import * as Replacers from "../util/Replacers";
import ReportError from "../util/ReportError";

// Context Properties ---------------------------------------------------------

export type FacilityContextData = {
    facilities: Facility[];         // Facilities visible to this user
    index: number;                  // Index of currently selected facility
                                    // (< 0 means none)
    setFacilities: (facilities: Facility[]) => void;
    setIndex: (newIndex: number) => void;
    setRefresh: (newRefresh: boolean) => void;
}

export const FacilityContext = createContext<FacilityContextData>({
    facilities: [],
    index: -1,
    setFacilities: (facilities: Facility[]): void => {},
    setIndex: (index: number): void => {},
    setRefresh: (refresh: boolean): void => {},
});

export default FacilityContext;

// Context Provider ----------------------------------------------------------

export const FacilityContextProvider = (props: any) => {

//    const loginContext = useContext(LoginContext);

    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [index, setIndex] = useState<number>(-1);
    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {

        const fetchFacilities = async () => {
            try {
                const newFacilities: Facility[] = await FacilityClient.active();
                console.info("FacilityContext.fetchData("
                    + JSON.stringify(newFacilities, Replacers.FACILITY)
                    + ")");
                setFacilities(newFacilities);
                setIndex(-1);  // TODO - try to save and restore?
                setRefresh(false);
            } catch (error) {
                ReportError("FacilityContext.fetchData", error);
                setFacilities([]);
                setIndex(-1);
            }
        }

        fetchFacilities()

    }, [refresh]);

    // Create the context object
    const facilityContext: FacilityContextData = {
        facilities: facilities,
        index: index,
        setFacilities: setFacilities,
        setIndex: setIndex,
        setRefresh: setRefresh,
    }

    // Return the context, rendering children inside
    return (
        <FacilityContext.Provider value={facilityContext}>
            {props.children}
        </FacilityContext.Provider>
    )

}
