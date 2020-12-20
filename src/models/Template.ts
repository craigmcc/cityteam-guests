// Template ------------------------------------------------------------------

// A Template for generating mats for Checkins at a particular Facility, on a
// particular date.

// External Modules ----------------------------------------------------------

import MatsList from "../util/MatsList";

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
    validateMatsList,
    validateMatsSubset,
} from "../util/application-validators";
import {
    validateFacilityId,
    validateTemplateNameUnique,
} from "../util/async-validators";

import { BadRequest } from "../util/http-errors";

// Public Modules ------------------------------------------------------------

@Table({
    comment: "Templates for future Checkin generation at a Facility",
    modelName: "template",
    tableName: "templates",
    validate: {
        isFacilityIdValid: async function(this: Template): Promise<void> {
            if (!(await validateFacilityId(this.facilityId))) {
                throw new BadRequest
                    (`facilityId: Invalid facilityId ${this.facilityId}`);
            }
        },
        isHandicapMatsValidSubset: function(this: Template): void {
            if (this.allMats && this.handicapMats) {
                if (!validateMatsSubset(this.allMats, this.handicapMats)) {
                    throw new BadRequest
                        ("handicapMats:  Is not a subset of allMats");
                }
            }
        },
        isNameUniqueWithinFacility: async function(this: Template): Promise<void> {
            if (!(await validateTemplateNameUnique(this))) {
                throw new BadRequest
                    (`name: Name '${this.name}' is already in use within this Facility`);
            }
        },
        isSocketMatsValidSubset: function(this: Template): void {
            if (this.allMats && this.socketMats) {
                if (this.allMats && this.socketMats) {
                    if (!validateMatsSubset(this.allMats, this.socketMats)) {
                        throw new BadRequest
                            ("socketMats:  Is not a subset of allMats");
                    }
                }
            }
        },
        isWorkMatsValidSubset: function(this: Template): void {
            if (this.allMats && this.workMats) {
                if (this.allMats && this.workMats) {
                    if (!validateMatsSubset(this.allMats, this.workMats)) {
                        throw new BadRequest
                            ("workMats:  Is not a subset of allMats");
                    }
                }
            }
        },
    }
})
export class Template extends AbstractModel<Template> {

    @Column({
        allowNull: false,
        comment: "Is this Template active?",
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
        allowNull: false,
        comment: "List of all mats to be generated from this Template",
        field: "all_mats",
        type: DataType.STRING,
        validate: {
            isAllMatsValid: function(value: string): void {
                if (value) {
                    if (!validateMatsList(value)) {
                        throw new BadRequest
                            (`allMats: Invalid mats list '${value}'`);
                    }
                }
            },
            notNull: {
                msg: "allMats: Is required"
            }
        }
    })
    allMats!: string;

    @Column({
        allowNull: true,
        comment: "General comments about this Template",
        type: DataType.STRING
    })
    comments?: string;

    @ForeignKey(() => Facility)
    @Column({
        allowNull: false,
        comment: "Facility ID of the Facility this Template is for",
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
        comment: "List of all mats suitable for handicapped Guests",
        field: "handicap_mats",
        type: DataType.STRING,
        validate: {
            isHandicapMatsValid: function(value: string): void {
                if (value) {
                    if (!validateMatsList(value)) {
                        throw new BadRequest
                            (`handicapMats: Invalid mats list '${value}'`);
                    }
                }
            },
        }
    })
    handicapMats!: string;

    @Column({
        allowNull: false,
        type: DataType.STRING,
        unique: "uniqueNameWithinFacility",
        validate: {
            notNull: {
                msg: "name: Is required",
            }
        }
    })
    name!: string;

    @Column({
        allowNull: true,
        comment: "List of all mats near an electric socket",
        field: "socket_mats",
        type: DataType.STRING,
        validate: {
            isSocketMatsValid: function(value: string): void {
                if (value) {
                    if (!validateMatsList(value)) {
                        throw new BadRequest
                        (`socketMats: Invalid mats list '${value}'`);
                    }
                }
            },
        }
    })
    socketMats!: string;

    @Column({
        allowNull: true,
        comment: "List of all mats suitable for potential recovery Guests",
        field: "work_mats",
        type: DataType.STRING,
        validate: {
            isWorkMatsValid: function(value: string): void {
                if (value) {
                    if (!validateMatsList(value)) {
                        throw new BadRequest
                            (`workMats: Invalid mats list '${value}'`);
                    }
                }
            },
        }
    })
    workMats!: string;

}

export default Template;
