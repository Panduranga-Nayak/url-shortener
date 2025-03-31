export interface CreateShortUrlRequest {
    userId: string;
    originalUrl: string;
    shortUrl: string;
}

export interface GetUserUrlRequest {
    userId: string
    pagination: {
        pageNo: number, 
        itemsPerPage: number
    }
}

export interface DeleteUserUrlRequest {
    userId: string, 
    shortUrlId: string
}