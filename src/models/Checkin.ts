// Checkin -------------------------------------------------------------------

// Record of an actual (guestId !== null) or potential (guestId === null)
// checkin for a particular mat, on a particular checkin date, at a particular
// Facility, by a particular Guest.

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
import {BadRequest} from "../util/http-errors";
import {
    validateFeatures,
    validateMatNumber,
    validatePaymentAmount,
    validatePaymentType
} from "../util/application-validators";
import {
    validateCheckinKeyUnique,
    validateFacilityId,
    validateGuestId
} from "../util/async-validators";

// Public Objects ------------------------------------------------------------

@Table({
    comment: "Checkins and available mats for a particular date at a particular Facility",
    modelName: "checkin",
    tableName: "checkins",
    validate: {
        isCheckinKeyUnique: async function(this: Checkin): Promise<void> {
            if (!(await validateCheckinKeyUnique(this))) {
                throw new BadRequest
                    (`matNumber: Mat number ${this.matNumber} `
                        + `is already in use on checkin date ${this.checkinDate} `
                        + "within this Facility");
            }
        },
        isFacilityIdValid: async function(this: Checkin): Promise<void> {
            if (!(await validateFacilityId(this.facilityId))) {
                throw new BadRequest
                    (`facilityId: Invalid facilityId ${this.facilityId}`);
            }
        },
        isGuestIdValid: async function(this: Checkin): Promise<void> {
            if (!(await validateGuestId(this.facilityId, this.guestId))) {
                throw new BadRequest
                    (`facilityId: Invalid facilityId ${this.facilityId}`);
            }
        },
    }
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
        type: DataType.BIGINT,
        validate: {
            notNull: {
                msg: "facilityId: Is required"
            }
        }
    })
    facilityId!: number;

    @Column({
        allowNull: true,
        comment: "Feature codes associated with this mat",
        type: DataType.STRING,
        validate: {
            isFeaturesValid: function(value: string): void {
                if (value) {
                    if (!validateFeatures(value)) {
                        throw new BadRequest
                        (`features:  Invalid features list '${value}'`);
                    }
                }
            }
        }
    })
    features?: string;

    @ForeignKey(() => Guest)
    @Column({
        allowNull: true,
        comment: "Guest ID of the Guest who has checked in for this mat (if any)",
        field: "guest_id",
        type: DataType.BIGINT,
    })
    guestId?: number;

    @Column({
        allowNull: false,
        comment: "Mat number to be checked in to on this checkin date",
        field: "mat_number",
        type: DataType.INTEGER,
        validate: {
            isValidMatNumber: function(value: number): void {
                if (value) {
                    if (!validateMatNumber(value)) {
                        throw new BadRequest
                            (`matNumber:  Invalid mat number ${value}`);
                    }
                }
            }
        }
    })
    matNumber!: number;

    @Column({
        allowNull: true,
        comment: "Amount paid (if any) for this mat, for this checkin date",
        field: "payment_amount",
        type: DataType.DECIMAL(5,2),
        validate: {
            isValidPaymentAmount: function(value: number): void {
                if (value) {
                    if (!validatePaymentAmount(value)) {
                        throw new BadRequest
                            (`paymentAmount:  Invalid payment amount ${value}`);
                    }
                }
            }
        }
    })
    paymentAmount?: number;

    @Column({
        allowNull: true,
        comment: "Payment type, if this mat was occupied on this checkin date",
        field: "payment_type",
        type: DataType.STRING(2),
        validate: {
            isValidPaymentType: function(value: string): void {
                if (value) {
                    if (!validatePaymentType(value)) {
                        throw new BadRequest
                            (`paymentType:  Invalid payment type ${value}`);
                    }
                }
            }
        }
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
