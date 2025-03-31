export const MAX_URL_COLLISION_RETRIES = 5;
export const URL_PROTOCOL_PATTERN = /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}([/?#].*)?$/i;
export const INVALID_URL_ERROR="Invalid URL! Must start with 'http://' or 'https://' and be a valid domain.";