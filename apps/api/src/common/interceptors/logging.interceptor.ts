import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request } from "express";
import { createStructuredLogger } from "../utils/logger.util";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = createStructuredLogger("Request");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const start = Date.now();

    this.logger.info("Incoming request", {
      requestId: req.requestId,
      method: req.method,
      path: req.url ?? req.path,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const res = ctx.getResponse();
          const durationMs = Date.now() - start;
          this.logger.info("Request completed", {
            requestId: req.requestId,
            method: req.method,
            path: req.url ?? req.path,
            statusCode: res.statusCode,
            durationMs,
          });
        },
        error: () => {
          const durationMs = Date.now() - start;
          this.logger.warn("Request failed", {
            requestId: req.requestId,
            method: req.method,
            path: req.url ?? req.path,
            durationMs,
          });
        },
      }),
    );
  }
}
