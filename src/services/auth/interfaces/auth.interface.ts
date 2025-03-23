export interface AuthStratergyInterface {
    initialize(): any;
    authenticate(): any;
    refreshToken(refreshToken: string): any;
    invalidateRefreshToken(refreshToken: string): any;
}