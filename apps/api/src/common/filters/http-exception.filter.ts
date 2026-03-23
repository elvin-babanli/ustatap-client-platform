import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import type { ApiErrorEnvelope, ValidationErrorDetail } from "../types/api-response.types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request.requestId;
    const path = request.url ?? request.path;
    const isProd = process.env.NODE_ENV === "production";

    const { status, message, error, details } = this.getExceptionDetails(exception);

    if (status >= 500) {
      this.logger.error(
        `Unhandled exception [${requestId ?? "no-id"}] ${request.method} ${path} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const envelope: ApiErrorEnvelope = {
      success: false,
      statusCode: status,
      error: error ?? "Error",
      message: isProd && status >= 500 ? "Internal server error" : message,
      path,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
      ...(details && details.length > 0 && { details }),
    };

    response.status(status).json(envelope);
  }

  private getExceptionDetails(exception: unknown): {
    status: number;
    message: string;
    error?: string;
    details?: ValidationErrorDetail[];
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const body =
        typeof exceptionResponse === "object" && exceptionResponse !== null
          ? (exceptionResponse as Record<string, unknown>)
          : { message: exception.message };

      let message: string;
      let details: ValidationErrorDetail[] | undefined;

      if (Array.isArray(body.message)) {
        message = body.message.join(", ");
        details = this.deriveValidationDetails(body.message);
      } else if (typeof body.message === "string") {
        message = body.message;
        details = body.errors
          ? this.normalizeValidationErrors(body.errors as Record<string, unknown> | unknown[])
          : undefined;
      } else {
        message = exception.message;
      }

      return {
        status,
        message,
        error: body.error as string | undefined ?? exception.name,
        details,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      error: "InternalServerError",
    };
  }

  private deriveValidationDetails(messages: string[]): ValidationErrorDetail[] {
    return messages.map((m) => ({ property: "unknown", messages: [m] }));
  }

  private normalizeValidationErrors(
    errors: Record<string, unknown> | unknown[],
  ): ValidationErrorDetail[] {
    if (Array.isArray(errors)) {
      return errors
        .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
        .map((e) => ({
          property: (e.property as string) ?? "unknown",
          constraints: e.constraints as Record<string, string> | undefined,
          messages: e.constraints
            ? Object.values(e.constraints as Record<string, string>)
            : undefined,
        }));
    }
    return Object.entries(errors).map(([property, v]) => {
      const obj = v as Record<string, unknown> | undefined;
      return {
        property,
        constraints: obj?.constraints as Record<string, string> | undefined,
        messages: obj?.constraints ? Object.values(obj.constraints) : undefined,
      };
    });
  }
}
