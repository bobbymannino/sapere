import * as v from "valibot";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnknownApiError extends ApiError {
  constructor(message = "Unknown Error", cause?: unknown) {
    super(message, 0);
    this.name = "UnknownApiError";
    this.cause = cause;
  }
}

export class BadRequestApiError extends ApiError {
  constructor(message = "Bad Request") {
    super(message, 400);
    this.name = "BadRequestApiError";
  }
}

export class UnauthorizedApiError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedApiError";
  }
}

export class NotFoundApiError extends ApiError {
  constructor(message = "Not Found") {
    super(message, 404);
    this.name = "NotFoundApiError";
  }
}

export class ConflictApiError extends ApiError {
  constructor(message = "Conflict") {
    super(message, 409);
    this.name = "ConflictApiError";
  }
}

export class UnprocessableEntityApiError extends ApiError {
  errors: Record<string, string[]> = {};
  constructor(message = "Unprocessable Entity", json?: any) {
    super(message, 422);
    this.name = "InternalServerErrorApiError";
    if (json) {
      const errors = v.safeParse(
        v.object({
          errors: v.record(v.string(), v.array(v.string())),
        }),
        json,
      );
      if (errors.success) this.errors = errors.output.errors;
    }
  }
}

export class InternalServerErrorApiError extends ApiError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
    this.name = "InternalServerErrorApiError";
  }
}

export async function handleHttpError(response: Response) {
  let json: any;
  let message: string | undefined;
  if (response.headers.get("Content-Type") === "application/json") {
    json = await response.json();
    message = json.message;
  }
  switch (response.status) {
    case 400:
      return new BadRequestApiError(message);
    case 401:
      return new UnauthorizedApiError(message);
    case 404:
      return new NotFoundApiError(message);
    case 409:
      return new ConflictApiError(message);
    case 422:
      return new UnprocessableEntityApiError(message, json);
    case 500:
      return new InternalServerErrorApiError(message);
    default:
      return new ApiError("Unknown API error", response.status);
  }
}

export function valibotIssuesToApiError<
  TSchema extends v.GenericSchema,
  TIssue extends v.InferIssue<TSchema>,
>(issues: [TIssue, ...TIssue[]]): UnprocessableEntityApiError {
  return new UnprocessableEntityApiError("Unprocessable Entity", {
    errors: v.flatten<TSchema>(issues).nested,
  });
}
