export const APIHost =
    process.env.NODE_ENV === "production"
        ? location.origin
        : `${location.protocol}//${location.hostname}:8080`;
