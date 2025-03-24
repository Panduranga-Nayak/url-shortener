export interface RefreshTokenRequest {
    authorizationtype: string
    authorization: string
    userId: string
}

export interface LogoutRequest {
    accessToken: string 
    refreshToken: string
    authType: string
}