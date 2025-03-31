export interface CreateTrackingUrlRequest {
    userId: string, 
    shortUrlId: string, 
    utmSource: string, 
    utmCampaign: string 
}

export interface UpdateTrackingUrlRequest {
    userId: string, 
    trackingUrlId: string, 
    update: {
        newUtmSource: string, 
        newUtmCampaign?: string,
    }
}

export interface DeleteTrackingUrlRequest {
    userId: string,
    trackingUrlId: string,
}
