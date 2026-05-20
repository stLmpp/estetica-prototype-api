export type SafeSuccess<T> = [error: undefined, data: T];
export type SafeError = [error: Error, data: undefined];
export type Safe<T> = SafeSuccess<T> | SafeError;

export async function safeAsync<T>(
  callback: () => Promise<T>,
): Promise<Safe<T>> {
  try {
    return [undefined, await callback()];
  } catch (error) {
    if (error instanceof Error) {
      return [error, undefined];
    }
    return [new Error(String(error)), undefined];
  }
}

export function safe<T>(callback: () => T): Safe<T> {
  try {
    return [undefined, callback()];
  } catch (error) {
    if (error instanceof Error) {
      return [error, undefined];
    }
    return [new Error(String(error)), undefined];
  }
}
