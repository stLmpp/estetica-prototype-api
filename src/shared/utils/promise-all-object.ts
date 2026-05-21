export async function promiseAllObject<
  T extends Record<string, Promise<unknown>>,
>(promises: T): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const entries = await Promise.all(
    Object.entries(promises).map(async ([key, promise]) => [
      key,
      await promise,
    ]),
  );
  return Object.fromEntries(entries) as never;
}
