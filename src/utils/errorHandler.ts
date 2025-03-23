import { LoggerRegistry } from '../logger/loggerRegistry'

const log = LoggerRegistry.getLogger();

export function handleErrorResponse(error: any, functionName?: string) {
    let message = "Something went wrong";
    let STATUS_CODE = 500;

    if (error?.isCustomError && error.message) {
        message = error.message;
        STATUS_CODE = 401;
    }

    log.error(functionName || "unknown function", error);

    return { STATUS_CODE, message };
}