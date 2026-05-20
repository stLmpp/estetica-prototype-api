import { type IncomingHttpHeaders } from 'node:http';

export function getSingleValueHeader(
  headers: IncomingHttpHeaders,
  key: string,
): string | undefined {
  const header = headers[key];
  return Array.isArray(header) ? header[0] : header;
}
