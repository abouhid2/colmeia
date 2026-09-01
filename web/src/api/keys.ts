type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function isPlainObject(value: unknown): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function convertKeys(value: Json, convert: (key: string) => string): Json {
  if (Array.isArray(value)) return value.map((item) => convertKeys(item, convert));
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [convert(key), convertKeys(item, convert)]));
}

const camelToSnake = (key: string): string => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const snakeToCamel = (key: string): string => key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

export function toSnakeKeys<T>(value: unknown): T {
  return convertKeys(value as Json, camelToSnake) as T;
}

export function toCamelKeys<T>(value: unknown): T {
  return convertKeys(value as Json, snakeToCamel) as T;
}
