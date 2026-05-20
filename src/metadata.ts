/* eslint-disable */
export default async () => {
    const t = {
        ["./features/health/health.response"]: await import("./features/health/health.response")
    };
    return { "@nestjs/swagger": { "models": [[import("./features/health/health.response"), { "HealthResponse": { status: { required: true, enum: t["./features/health/health.response"].HealthStatus } } }]], "controllers": [[import("./features/health/health.controller"), { "HealthController": { "health": { type: t["./features/health/health.response"].HealthResponse } } }]] } };
};