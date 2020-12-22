// OAuthClient ---------------------------------------------------------------

// HTTP Client for an OAuth Authorization Server.

// External Modules ----------------------------------------------------------

import qs from "qs";

// Internal Modules ----------------------------------------------------------

import OAuthBase from "./OAuthBase";
import PasswordTokenRequest from "../models/PasswordTokenRequest";
import RefreshTokenRequest from "../models/RefreshTokenRequest";

import { CURRENT_ACCESS_TOKEN } from "../contexts/LoginContext";

// Public Objects ------------------------------------------------------------

class OAuthClient {

    async password<TokenResponse>(passwordTokenRequest: PasswordTokenRequest)
            : Promise<TokenResponse> {
        // Token requests are URL-encoded, not JSON
        const encodedRequest = qs.stringify(passwordTokenRequest);
        return (await OAuthBase.post("/token", encodedRequest, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        })).data;
    }

    async refresh<TokenResponse>(refreshTokenRequest: RefreshTokenRequest)
            : Promise<TokenResponse> {
        // Token requests are URL-encoded, not JSON
        const encodedRequest = qs.stringify(refreshTokenRequest);
        return (await OAuthBase.post("/token", encodedRequest, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            }
        )).data;
    }

    async revoke(): Promise<void> {
        await OAuthBase.delete(`/token`, {
            headers: {
                "Authorization": `Bearer ${CURRENT_ACCESS_TOKEN}`
            }
        });
    }

}

export default new OAuthClient();
