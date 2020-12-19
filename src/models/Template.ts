// Template ------------------------------------------------------------------

// A Template for generating mats for Checkins at a particular Facility, on a
// particular date.

// External Modules ----------------------------------------------------------

const {
    Column,
    DataTypes,
    ForeignKey,
    Op,
    Table
} = require("sequelize-typescript");

// Internal Modules ----------------------------------------------------------

import AbstractModel from "./AbstractModel";
import Facility from "./Facility";

// Public Modules ------------------------------------------------------------

@Table({
    comment: "Templates for future Checkin generation at a Facility",
    tableName: "templates",
    validate: { } // TODO - isNameUniqueWithinFacility(facilityId, name)
})
export class Template extends AbstractModel<Template> {

    @Column({
        allowNull: false,
        comment: "Is this Template active?",
        defaultValue: true,
        type: DataTypes.BOOLEAN,
        validate: {
            notNull: {
                msg: "active: Is required"
            }
        }
    })
    active!: boolean;

    @Column({
        allowNull: false,
        comment: "List of all mats to be generated from this Template",
        field: "all_mats",
        type: DataTypes.STRING,
        validate: { } // TODO - isMatsListValid(allMats)
    })
    allMats!: string;

    @Column({
        allowNull: true,
        comment: "General comments about this Template",
        type: DataTypes.STRING
    })
    comments?: string;

    @ForeignKey(() => Facility)
    @Column({
        allowNull: false,
        comment: "Facility ID of the Facility this Template is for",
        field: "facility_id",
        type: DataTypes.INTEGER,
        unique: "uniqueNameWithinFacility",
        validate: { } // TODO - isValidFacilityId(facilityId)
    })
    facilityId!: number;

    @Column({
        allowNull: true,
        comment: "List of all mats suitable for handicapped Guests",
        field: "handicap_mats",
        type: DataTypes.STRING,
        validate: { }   // TODO - isMatsListValid(handicapMats)
                        // TODO - isMatsListSubset(allMats, handicapMats)
    })
    handicapMats!: string;

    @Column({
        allowNull: false,
        type: DataTypes.STRING,
        unique: "uniqueNameWithinFacility",
        validate: {
            isNull: {
                msg: "name: Is required",
            }
        }
    })
    name!: string;

    @Column({
        allowNull: true,
        comment: "List of all mats near an electric socket",
        field: "socket_mats",
        type: DataTypes.STRING,
        validate: { }   // TODO - isMatsListValid(socketMats)
                        // TODO - isMatsListSubset(allMats, socketMats)
    })
    socketMats!: string;

    @Column({
        allowNull: true,
        comment: "List of all mats suitable for potential recovery Guests",
        type: DataTypes.STRING,
        validate: { }   // TODO - isMatsListValid(name, workMats)
                        // TODO - isMatsListSubset(name, allMats, workMats)
    })
    workMats!: string;

}

export default Template;
