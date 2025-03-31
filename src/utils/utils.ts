import { camelCase, isString, mapKeys } from "lodash";

export function urlSafeCheck(str: string): boolean {
    return isString(str) && /^[a-zA-Z0-9-]+$/.test(str)
}

export function convertKeysToCamelCase(obj: Record<string, any>): Record<string, any> {
    return mapKeys(obj, (_value, key) => camelCase(key));
}