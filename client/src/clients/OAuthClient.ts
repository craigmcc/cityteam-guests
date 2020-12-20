// OAuthClient ---------------------------------------------------------------

// HTTP Client for an OAuth Authorization Server.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import OAuthBase from "./OAuthBase";
import PasswordTokenRequest from "../models/PasswordTokenRequest";
import RefreshTokenRequest from "../models/RefreshTokenRequest";
import TokenResponse from "../models/TokenResponse";

// Public Objects ------------------------------------------------------------

class OAuthClient {

    async tokenPassword<TokenResponse>(passwordTokenRequest: PasswordTokenRequest)
            : Promise<TokenResponse> {
        return (await OAuthBase.post("/token", passwordTokenRequest)).data;
    }

    async tokenRefresh<TokenResponse>(refreshTokenRequest: RefreshTokenRequest)
            : Promise<TokenResponse> {
        return (await OAuthBase.post("/token", refreshTokenRequest)).data;
    }

    async tokenRevoke(token: string): Promise<void> {
        await OAuthBase.delete(`/token/${token}`);
    }

}

export default OAuthClient;
