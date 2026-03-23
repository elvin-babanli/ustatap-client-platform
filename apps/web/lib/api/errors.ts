/**
 * API error handling foundation.
 * Parses standard error envelope from backend.
 */

export interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  path?: string;
  timestamp: string;
  requestId?: string;
  details?: Array<{ property: string; messages?: string[] }>;
}

/**
 * Parses JSON error response into a consistent shape.
 */
export async function parseApiError(res: Response): Promise<ApiErrorEnvelope> {
  let body: Partial<ApiErrorEnvelope> = {};
  try {
    body = (await res.json()) as Partial<ApiErrorEnvelope>;
  } catch {
    // Non-JSON response
  }
  return {
    success: false,
    statusCode: body.statusCode ?? res.status,
    error: body.error ?? "Error",
    message: body.message ?? "Request failed",
    path: body.path,
    timestamp: body.timestamp ?? new Date().toISOString(),
    requestId: body.requestId,
    details: body.details,
  };
}

/**
 * Builds user-facing error message from envelope.
 */
export function getErrorMessage(envelope: ApiErrorEnvelope): string {
  if (envelope.details?.length) {
    const msgs = envelope.details.flatMap((d) => d.messages ?? []);
    if (msgs.length) return msgs.join(", ");
  }
  return envelope.message;
}
