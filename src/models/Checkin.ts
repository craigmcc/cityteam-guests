// Checkin -------------------------------------------------------------------

// Record of a checkin for a particular mat, in a particular Facility,
// on a particular date.  Unassigned mats will be those available to be
// assigned, indicated by a null guestId value.

// External Modules ----------------------------------------------------------

const {
    Column,
    DataType,
    ForeignKey,
    Table
} = require("sequelize-typescript");

// Internal Modules ----------------------------------------------------------

import AbstractModel from "./AbstractModel";
import Facility from "./Facility";
import Guest from "./Guest";

// Public Objects ------------------------------------------------------------

@Table({
    comment: "Checkins and available mats for a particular date at a particular Facility",
    modelName: "checkin",
    tableName: "checkins",
    validate: { }   // TODO - including unique featureId+checkinDate+matNumber
                    // TODO - or this guest has already checked in to a different mat
})
export class Checkin extends AbstractModel<Checkin> {

    @Column({
        allowNull: false,
        comment: "Checkin date for which this mat is available or assigned",
        field: "checkin_date",
        type: DataType.DATEONLY
    })
    checkinDate!: Date;

    @Column({
        allowNull: true,
        comment: "General comments about this Checkin",
        type: DataType.STRING
    })
    comments?: string;

    @ForeignKey(() => Facility)
    @Column({
        allowNull: false,
        comment: "Facility ID of the Facility this Guest has registered at",
        field: "facility_id",
        type: DataType.INTEGER,
        validate: { } // TODO - isValidFacilityId(facilityId)
    })
    facilityId!: number;

    @Column({
        allowNull: true,
        comment: "Feature codes associated with this mat",
        type: DataType.STRING,
        validate: { } // isValidFeatures(features)
    })
    features?: string;

    @ForeignKey(() => Guest)
    @Column({
        allowNull: true,
        comment: "Guest ID of the Guest who has checked in for this mat (if any)",
        field: "guest_id",
        type: DataType.INTEGER,
        validate: { } // TODO - isValidGuestId(facilityId, guestId)
    })
    guestId?: number;

    @Column({
        allowNull: false,
        comment: "Mat number to be checked in to on this checkin date",
        field: "mat_number",
        type: DataType.INTEGER,
        validate: { } // TODO - unique facilityId+checkinDate+matNumber
    })
    matNumber!: number;

    @Column({
        allowNull: true,
        comment: "Amount paid (if any) for this mat, for this checkin date",
        field: "payment_amount",
        type: DataType.DECIMAL(5,2),
        validate: { } // TODO - if present, must be positive
    })
    paymentAmount?: number;

    @Column({
        allowNull: true,
        comment: "Payment type, if this mat was occupied on this checkin date",
        field: "payment_type",
        type: DataType.STRING(2),
        validate: { } // TODO - valid payment type
    })
    paymentType?: string;

    @Column({
        allowNull: true,
        comment: "Time this Guest wishes to shower",
        field: "shower_time",
        type: DataType.TIME
    })
    showerTime?: Date;

    @Column({
        allowNull: true,
        comment: "Time this Guest wishes to be woken",
        field: "wakeup_time",
        type: DataType.TIME
    })
    wakeupTime?: Date;

}

export default Checkin;
