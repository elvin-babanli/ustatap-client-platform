/**
 * Standard API response envelope types.
 * Use for consistent response structure across endpoints.
 */

export interface ApiSuccessEnvelope<T = unknown> {
  success: true;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  path?: string;
  timestamp: string;
  requestId?: string;
  /** Validation errors when statusCode is 400 */
  details?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  property: string;
  constraints?: Record<string, string>;
  messages?: string[];
}
