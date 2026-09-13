import { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../utils/errors";

// Maps malformed-input errors from body-parser, Mongoose and csv-parse to a 400 message.
function toClientError(error: any): string | undefined {
  if (error?.type === "entity.parse.failed") return "Malformed JSON request body";
  if (error?.name === "ValidationError" || error?.name === "CastError") return error.message;
  if (typeof error?.code === "string" && error.code.startsWith("CSV_")) return `Invalid CSV: ${error.message}`;
  return undefined;
}

export const notFoundMiddleware: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "Route not found"));
};

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  const clientError = toClientError(error);
  const statusCode =
    error instanceof AppError ? error.statusCode : clientError ? 400 : 500;
  const message =
    error instanceof AppError
      ? error.message
      : clientError ?? "Internal server error";

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(error instanceof AppError && error.details
        ? { details: error.details }
        : {})
    }
  });
};
