// SimpleList ----------------------------------------------------------------

// Render a list of objects in an HTML table, with a customizable set of
// column titles and field names.  Supports optional handler when a
// particular row is clicked.

// External Modules ----------------------------------------------------------

import React, { useState } from "react";
import Table from "react-bootstrap/Table";

// Internal Modules ----------------------------------------------------------

// Incoming Properties -------------------------------------------------------

export interface Props {
    handleIndex?: (index: number) => void;
                                    // Handle selection of a particular row
    items: object[];                // Items to be rendered in rows
    listFields: string[];           // List of fields (from each object) to render
    listHeaders: string[];          // List of header titles for fields
    title?: string;                 // Overall table title [no title]
}

// Component Details ---------------------------------------------------------

const SimpleList = (props: Props) => {

    const [index, setIndex] = useState<number>(-1);

    const handleIndex = (newIndex: number): void => {
//        console.info(`SimpleList.handleIndex(${newIndex})`);
        setIndex(newIndex);
        if (props.handleIndex) {
            props.handleIndex(newIndex);
        }
    }

    const value = (value: any): string => {
        if (typeof(value) === "boolean") {
            return value ? "Yes" : "No"
        } else if (!value) {
            return "";
        } else {
            return value;
        }
    }

    const values = (item: object): string[] => {
        let result: string[] = [];
        props.listFields.forEach(field => {
            // @ts-ignore
            result.push(value(item[field]));
        });
        return result;
    }

    return (

        <Table
            bordered
            hover
            size="sm"
            striped
        >

            <thead>
            {(props.title) ? (
                <tr className="table-dark" key={100}>
                    <th
                        className="text-center"
                        colSpan={props.listHeaders.length}
                        key={101}
                    >
                        {props.title}
                    </th>
                </tr>
            ) : null }
            <tr className="table-secondary" key={102}>
                {props.listHeaders.map((header, index) => (
                    <th key={200 + index + 1} scope="col">
                        {header}
                    </th>
                ))}
            </tr>
            </thead>

            <tbody>
            {props.items.map((item, rowIndex) => (
                <tr
                    className={"table-" +
                    (rowIndex === index ? "primary" : "default")}
                    key={1000 + (rowIndex * 100)}
                    onClick={() => (handleIndex(rowIndex))}
                >
                    {values(item).map((value, colIndex) => (
                        <td key={1000 + (rowIndex * 100) + colIndex + 1}>
                            {value}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>

        </Table>

    )

}

export default SimpleList;
