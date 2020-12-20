// RefreshTokenRequest -------------------------------------------------------

// Request for an OAuth access token (and optional refresh token) in exchange
// for an existing refresh token.

// Public Objects ------------------------------------------------------------

class RefreshTokenRequest {

    constructor(data: any = {}) {
        this.grant_type = "refresh_token";
        this.refresh_token = data.refresh_token;
        this.scope = data.scope || null;
    }

    grant_type!: string;
    refresh_token!: string;
    scope?: string;

}

export default RefreshTokenRequest;
