import { type Class } from 'type-fest';

export type SafeSuccess<T> = [error: undefined, data: T];
export type SafeError<E extends Class<any>> = [
  error: InstanceType<E>,
  data: undefined,
];
export type Safe<T, E extends Class<any>> = SafeSuccess<T> | SafeError<E>;

export async function safeAsync<T, E extends Class<any>>(
  callback: () => Promise<T>,
  errorClass: E,
): Promise<Safe<T, E>>;
export async function safeAsync<T>(
  callback: () => Promise<T>,
): Promise<Safe<T, Class<Error>>>;
export async function safeAsync<T, E extends Class<any>>(
  callback: () => Promise<T>,
  errorClass?: E,
): Promise<Safe<T, E>> {
  const klass = (errorClass ?? Error) as E;
  try {
    return [undefined, await callback()];
  } catch (error) {
    if (error instanceof klass) {
      return [error as InstanceType<E>, undefined];
    }
    return [new klass(String(error)), undefined];
  }
}

export function safe<T, E extends Class<any>>(
  callback: () => T,
  errorClass: E,
): Safe<T, E>;
export function safe<T>(callback: () => T): Safe<T, Class<Error>>;
export function safe<T, E extends Class<any>>(
  callback: () => T,
  errorClass?: E,
): Safe<T, E> {
  const klass = (errorClass ?? Error) as E;
  try {
    return [undefined, callback()];
  } catch (error) {
    if (error instanceof klass) {
      return [error as InstanceType<E>, undefined];
    }
    return [new klass(String(error)), undefined];
  }
}
