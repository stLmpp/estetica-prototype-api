export enum HealthStatus {
  OK = 'OK',
  NOK = 'NOK',
}

export class HealthResponse {
  readonly status!: HealthStatus;
}
