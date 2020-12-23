// Guest ---------------------------------------------------------------------

// A Guest who has ever checked in at a CityTeam Facility.

// External Modules ----------------------------------------------------------

import {BadRequest} from "../util/http-errors";

const {
    Column,
    DataType,
    ForeignKey,
    Table
} = require("sequelize-typescript");

// Internal Modules ----------------------------------------------------------

import AbstractModel from "./AbstractModel";
import Facility from "./Facility";
import {
    validateFacilityId,
    validateGuestNameUnique,
} from "../util/async-validators";

// Public Modules ------------------------------------------------------------

@Table({
    comment: "Guests who have ever checked in at a CityTeam Facility",
    modelName: "guest",
    tableName: "guests",
    validate: {
        isFacilityIdValid: async function(this: Guest): Promise<void> {
            if (!(await validateFacilityId(this.facilityId))) {
                throw new BadRequest
                    (`facilityId: Invalid facilityId ${this.facilityId}`);
            }
        },
        isNameUniqueWithinFacility: async function(this: Guest): Promise<void> {
            if (!(await validateGuestNameUnique(this))) {
                throw new BadRequest
                    (`name: Name '${this.firstName} ${this.lastName}' "
                     + "is already in use within this Facility`);
            }
        },
    }
})
export class Guest extends AbstractModel<Guest> {

    @Column({
        allowNull: false,
        comment: "Is this Guest active?",
        defaultValue: true,
        type: DataType.BOOLEAN,
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
        type: DataType.STRING
    })
    comments?: string;

    @ForeignKey(() => Facility)
    @Column({
        allowNull: false,
        comment: "Facility ID of the Facility this Guest has registered at",
        field: "facility_id",
        type: DataType.INTEGER,
        unique: "uniqueNameWithinFacility",
        validate: {
            notNull: {
                msg: "facilityId: Is required"
            }
        }
    })
    facilityId!: number;

    @Column({
        allowNull: true,
        type: DataType.INTEGER,
    })
    favorite!: number;

    // Names reversed to get facilityId+lastName+firstName in unique index

    @Column({
        allowNull: false,
        field: "last_name",
        type: DataType.STRING,
        unique: "uniqueNameWithinFacility",
        validate: {
            notNull: {
                msg: "lastName: Is required",
            }
        }
    })
    lastName!: string;

    @Column({
        allowNull: false,
        field: "first_name",
        type: DataType.STRING,
        unique: "uniqueNameWithinFacility",
        validate: {
            notNull: {
                msg: "firstName: Is required",
            }
        }
    })
    firstName!: string;

}

export default Guest;
