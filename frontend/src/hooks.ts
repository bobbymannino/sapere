import {
  ApiError,
  BadRequestApiError,
  ConflictApiError,
  InternalServerErrorApiError,
  NotFoundApiError,
  UnauthorizedApiError,
  UnknownApiError,
  UnprocessableEntityApiError,
} from "$lib/api/errors";
import type { Reroute, Transport } from "@sveltejs/kit";

export const transport: Transport = {
  ApiError: {
    encode: (value) =>
      value instanceof ApiError && [
        value.name,
        value.message,
        value.status,
        value instanceof UnprocessableEntityApiError ? value.errors : undefined,
        value instanceof UnprocessableEntityApiError ? value.rootErrors : undefined,
      ],
    decode: ([name, message, status, errors, rootErrors]) => {
      switch (name) {
        case "BadRequestApiError":
          return new BadRequestApiError(message);
        case "UnauthorizedApiError":
          return new UnauthorizedApiError(message);
        case "NotFoundApiError":
          return new NotFoundApiError(message);
        case "ConflictApiError":
          return new ConflictApiError(message);
        case "UnprocessableEntityApiError":
          return new UnprocessableEntityApiError(message, {
            errors,
            rootErrors,
          });
        case "InternalServerErrorApiError":
          return new InternalServerErrorApiError(message);
        case "UnknownApiError":
          return new UnknownApiError(message);
        default:
          return new ApiError(message, status);
      }
    },
  },
};

export const reroute: Reroute = ({ url }) => {
  if (/^\/workspaces\/?$/.test(url.pathname)) return "/";
};
