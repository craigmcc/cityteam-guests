// Facility ------------------------------------------------------------------

// A CityTeam facility with overnight guests managed with this application.

// External Modules ----------------------------------------------------------

const {
    Column,
    DataTypes,
    HasMany,
    Op,
    Table
} = require("sequelize-typescript");

// Internal Modules ----------------------------------------------------------

import AbstractModel from "./AbstractModel";
//import Checkin from "./Checkin";
//import Guest from "./Guest";
//import Template from "./Template";

// Public Modules ------------------------------------------------------------

@Table({
    comment: "CityTeam facilities with overnight guests.",
    tableName: "facilities",
    validate: { }   // TODO - model level validations
})
export class Facility extends AbstractModel<Facility> {

    @Column({
        allowNull: false,
        comment: "Is this Facility active?",
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
        comment: "First line of Facility address",
        type: DataTypes.STRING,
    })
    address1?: string;

    @Column({
        allowNull: true,
        comment: "Second line of Facility address",
        type: DataTypes.STRING,
    })
    address2?: string;

//    @HasMany(() => Checkin)
//    checkins!: Checkin[];

    @Column({
        allowNull: true,
        comment: "City of Facility address",
        type: DataTypes.STRING,
    })
    city?: string;

    @Column({
        allowNull: true,
        comment: "Facility email address",
        type: DataTypes.STRING,
        validate: { } // TODO - email address format
    })
    email?: string;

//    @HasMany(() => Guest)
//    guests!: Guest[];

    @Column({
        allowNull: false,
        comment: "Facility name",
        type: DataTypes.STRING,
        unique: true,
        validate: { } // TODO - uniqueness validation
    })
    name!: string;

    @Column({
        allowNull: true,
        comment: "Facility phone number",
        field: "phone_number",
        type: DataTypes.STRING(12),
        validate: { } // TODO - phone number format
    })
    phoneNumber?: string;

    @Column({
        allowNull: false,
        comment: "Required OAuth scope to access this Facility information",
        type: DataTypes.STRING(8),
        validate: { } // TODO - all lower case letters?
    })
    scope!: string;

    @Column({
        allowNull: true,
        comment: "State abbreviation of Facility address",
        type: DataTypes.STRING(2),
        validate: { } // TODO - valid state abbreviation
    })
    state?: string;

//    @HasMany(() => Template)
//    templates!: Template[];

    @Column({
        allowNull: true,
        comment: "Zip Code of Facility address",
        type: DataTypes.STRING(10),
        validate: {  } // TODO - valid zip code format
    })
    zipCode?: string;

}

export default Facility;

/*
    const stateAbbreviations =
        [ "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC",
            "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY",
            "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
            "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
            "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT",
            "VT", "VA", "WA", "WV", "WI", "WY" ];
*/

/*
        name: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isUnique: function(value, next) {
                    let conditions = {
                        where: {
                            name: value
                        }
                    };
                    if (this.id !== null) {
                        conditions.where["id"] = { [Op.ne]: this.id };
                    }
                    Facility.count(conditions)
                        .then(found => {
                            return (found !== 0)
                                ? next(`name: Name '${value}' is already in use`)
                                : next();
                        })
                        .catch(next);
                },
                notNull: {
                    msg: "name: Is required"
                }
            }
        },
*/

/*
        phone: {
            type: DataTypes.STRING(12),
            validate: {
                isValidFormat: function(value, next) {
                    if (value && (value.length > 0)) {
                        let pattern = /^\d{3}-\d{3}-\d{4}$/;
                        if (!pattern.test(value)) {
                            next(`phone: Phone '${value}' must match format 999-999-9999`);
                        }
                    }
                    return next();
                }
            }
        },
*/

/*
        state: {
            type: DataTypes.STRING(2),
            validate: {
                isValidValue: function(value, next) {
                    if (value && (value.length > 0)) {
                        if (stateAbbreviations.indexOf(value) < 0) {
                            next(`state: State '${value}' is not a valid abbreviation`);
                        }
                    }
                    return next();
                }
            }
        },
*/

 /*       zipCode: {
            field: "zipcode",
            type: DataTypes.STRING(10),
            validate: {
                isValidFormat: function(value, next) {
                    if (value && (value.length > 0)) {
                        let pattern = /^\d{5}$|^\d{5}-\d{4}$/;
                        if (!pattern.test(value)) {
                            next(`zipCode: Zip Code '${value}' must match format 99999 or 99999-9999`);
                        }
                    }
                    return next();
                }
            }
        }
*/

    // Facility Associations -------------------------------------------------

/*
    Facility.associate = function (models) {

        models.Facility.hasMany(models.Guest);

        models.Facility.hasMany(models.Registration);

        models.Facility.hasMany(models.Template);

    };
*/

