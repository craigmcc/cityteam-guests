// Guest ---------------------------------------------------------------------

// A Guest who has ever checked in at a CityTeam Facility.

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
    comment: "Guests who have ever checked in at a CityTeam Facility",
    tableName: "guests",
    validate: { }  // TODO - isNameUniqueWithinFacility(facilityId, firstName, lastName)
})
export class Guest extends AbstractModel<Guest> {

    @Column({
        allowNull: false,
        comment: "Is this Guest active?",
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
        allowNull: true,
        comment: "General comments about this Guest",
        type: DataTypes.STRING
    })
    comments?: string;

    @ForeignKey(() => Facility)
    @Column({
        allowNull: false,
        comment: "Facility ID of the Facility this Guest has registered at",
        field: "facility_id",
        type: DataTypes.INTEGER,
        unique: "uniqueNameWithinFacility",
        validate: { } // TODO - isValidFacilityId(facilityId)
    })
    facilityId!: number;

    @Column({
        allowNull: true,
        type: DataTypes.INTEGER,
    })
    favorite!: number;

    @Column({
        allowNull: false,
        field: "first_name",
        type: DataTypes.STRING,
        unique: "uniqueNameWithinFacility",
        validate: {
            isNull: {
                msg: "firstName: Is required",
            }
        }
    })
    firstName!: string;

    @Column({
        allowNull: false,
        field: "last_name",
        type: DataTypes.STRING,
        unique: "uniqueNameWithinFacility",
        validate: {
            isNull: {
                msg: "lastName: Is required",
            }
        }
    })
    lastName!: string;

}

export default Guest;
