import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { REQUEST_ID_HEADER } from "../constants/request.constants";

/**
 * Express middleware to attach requestId to each request.
 * Use in main.ts before routes.
 */
export function requestIdMiddleware(
  req: Request & { requestId?: string },
  res: Response,
  next: NextFunction,
): void {
  const existing = req.headers[REQUEST_ID_HEADER] as string | undefined;
  const requestId = existing?.trim() || uuidv4();
  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
