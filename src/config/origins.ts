import { ENV } from "./env.config";

const localDevPorts = [
    ...Array.from({ length: 10 }, (_, index) => 3000 + index),
    ...Array.from({ length: 10 }, (_, index) => 5170 + index),
];

const localDevOrigins = localDevPorts.flatMap((port) => [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
]);

const additionalAllowedOrigins = ENV.ADDITIONAL_ALLOWED_ORIGINS
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const allowedOrigins = Array.from(new Set([
    ENV.FRONTEND_URL,
    ENV.ADMIN_URL,
    ...additionalAllowedOrigins,
    ...localDevOrigins,
]));

export const isAllowedOrigin = (origin?: string) => {
    if (!origin) {
        return true;
    }

    return allowedOrigins.includes(origin);
};
