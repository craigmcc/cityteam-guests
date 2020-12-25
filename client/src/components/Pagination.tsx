// Pagination ----------------------------------------------------------------

// Simple pagination controls for a multiple page response

// External Modules ----------------------------------------------------------

import React from "react";
import Button from "react-bootstrap/Button";

// Internal Modules ----------------------------------------------------------

// Incoming Properties -------------------------------------------------------

export interface Props {
    currentPage: number;            // One-relative current page number [1]
    lastPage: boolean;              // Is this the last page? [false]
    onNext?: () => void;            // Handle () for next clicked [no handler]
    onPrevious?: () => void;        // Handle () for previous clicked [no handler]
    size?: "lg" | "sm";             // Button size [sm]
    variant?: string;               // Button variant style [outline-secondary]
}

// Component Details ---------------------------------------------------------

const DEFAULT_VARIANT = "outline-secondary";

const Pagination = (props: Props) => {

    return (
        <>
            <Button
                className="mr-1"
                disabled={props.currentPage === 1}
                onClick={props.onPrevious ? props.onPrevious : undefined}
                size={props.size ? props.size : "sm"}
                variant={props.variant ? props.variant : DEFAULT_VARIANT}
            >
                &lt;
            </Button>
            <Button
                className="mr-1"
                disabled
                size={props.size ? props.size : "sm"}
                variant={props.variant ? props.variant : DEFAULT_VARIANT}
            >
                {props.currentPage}
            </Button>
            <Button
                disabled={props.lastPage}
                onClick={props.onNext ? props.onNext : undefined}
                size={props.size ? props.size : "sm"}
                variant={props.variant ? props.variant : DEFAULT_VARIANT}
            >
                &gt;
            </Button>
        </>
    )

}

export default Pagination;
