// OAuthClient ---------------------------------------------------------------

// HTTP Client for an OAuth Authorization Server.

// External Modules ----------------------------------------------------------

import qs from "qs";

// Internal Modules ----------------------------------------------------------

import OAuthBase from "./OAuthBase";
import PasswordTokenRequest from "../models/PasswordTokenRequest";
import RefreshTokenRequest from "../models/RefreshTokenRequest";

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

    async revoke(token: string): Promise<void> {
        await OAuthBase.delete(`/token`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
    }

}

export default new OAuthClient();
