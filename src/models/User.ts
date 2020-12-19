// User ----------------------------------------------------------------------

// User authenticated via @craigmcc/oauth-orchestrator.

// External Modules ----------------------------------------------------------

import {
    Column,
    DataType,
    HasMany,
    Table
} from "sequelize-typescript";

// Internal Modules ----------------------------------------------------------

import AbstractModel from "./AbstractModel";
import AccessToken from "./AccessToken";
import RefreshToken from "./RefreshToken";

// Public Modules ------------------------------------------------------------

@Table({
    comment: "Users authenticated via @craigmcc/oauth-orchestrator.",
    modelName: "user",
    tableName: "users",
})
export class User extends AbstractModel<User> {

    @HasMany(() => AccessToken)
    accessTokens!: AccessToken[];

    @Column({
        allowNull: false,
        comment: "Is this user active?",
        defaultValue: true,
        field: "active",
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
        comment: "Name of this user.",
        field: "name",
        type: DataType.STRING,
        validate: {
            notNull: {
                msg: "name: Is required"
            }
        }
    })
    name!: string;

    @Column({
        allowNull: false,
        comment: "Hashed password for this user.",
        field: "password",
        type: DataType.STRING,
        validate: {
            notNull: {
                msg: "password: Is required"
            }
        },
    })
    password!: string;

    @HasMany(() => RefreshToken)
    refreshTokens!: RefreshToken[];

    @Column({
        allowNull: false,
        comment: "Authorized scopes (space-separated if multiple) for this user.",
        field: "scope",
        type: DataType.STRING,
    })
    scope!: string;

    @Column({
        allowNull: false,
        comment: "Unique username for this user.",
        field: "username",
        type: DataType.STRING,
        unique: true,
        validate: {
            notNull: {
                msg: "username: Is required"
            }
        }
    })
    username!: string;

}

export default User;
