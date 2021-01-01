// AccessToken ----------------------------------------------------------

// Access token created via @craigmcc/oauth-orchestrator.

// External Modules ----------------------------------------------------------

import {
    Column,
    DataType,
    ForeignKey,
    Table
} from "sequelize-typescript";

// Internal Modules ----------------------------------------------------------

import AbstractModel from "./AbstractModel";
import User from "./User";

// Public Modules ------------------------------------------------------------

@Table({
    comment: "Access tokens created via @craigmcc/oauth-orchestrator.",
    modelName: "accessToken",
    tableName: "access_tokens",
})
export class AccessToken extends AbstractModel<AccessToken> {

    @Column({
        allowNull: false,
        comment: "Date and time this access token expires.",
        field: "expires",
        type: DataType.DATE,
        validate: {
            notNull: {
                msg: "expires: Is required"
            }
        }
    })
    expires!: Date;

    @Column({
        allowNull: false,
        comment: "Authorized scopes (space-separated if multiple) for this access token.",
        field: "scope",
        type: DataType.STRING,
        validate: {
            notNull: {
                msg: "scope: Is required"
            }
        }
    })
    scope!: string;

    @Column({
        allowNull: false,
        comment: "Access token value for this access token",
        field: "token",
        type: DataType.STRING,
        unique: true,
        validate: {
            notNull: {
                msg: "token: Is required"
            }
        }
    })
    token!: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
        comment: "Primary key of the owning User",
        field: "user_id",
        type: DataType.INTEGER,
        validate: {
            notNull: {
                msg: "userId: Is required"
            }
        }
    })
    userId!: number;

}

export default AccessToken;
