/**
 * Standard API error helpers.
 *
 * All route handlers MUST use these helpers so the error shape is consistent:
 * ```json
 * { "code": "VALIDATION_ERROR", "message": "...", "fieldErrors": { "email": ["Invalid email"] } }
 * ```
 */

export interface ApiErrorBody {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
}

/**
 * Build a JSON error `Response` with a consistent shape.
 *
 * @param code     Machine-readable error code (SCREAMING_SNAKE_CASE).
 * @param message  Human-readable message (safe to show in a UI).
 * @param status   HTTP status code.
 * @param fieldErrors  Per-field validation errors from Zod.
 */
export function apiError(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
): Response {
  const body: ApiErrorBody = { code, message }
  if (fieldErrors) body.fieldErrors = fieldErrors
  return Response.json(body, { status })
}

/** 400 Bad Request */
export const badRequest = (message = 'Bad request', fieldErrors?: Record<string, string[]>) =>
  apiError('BAD_REQUEST', message, 400, fieldErrors)

/** 401 Unauthorized — no valid session */
export const unauthorized = (message = 'Authentication required') =>
  apiError('UNAUTHORIZED', message, 401)

/** 403 Forbidden — authenticated but insufficient permissions */
export const forbidden = (message = 'You do not have permission to perform this action') =>
  apiError('FORBIDDEN', message, 403)

/** 404 Not Found */
export const notFound = (message = 'Resource not found') =>
  apiError('NOT_FOUND', message, 404)

/** 409 Conflict — e.g. duplicate email */
export const conflict = (message: string) =>
  apiError('CONFLICT', message, 409)

/** 422 Unprocessable Entity — Zod validation failure */
export function validationError(fieldErrors: Record<string, string[]>): Response {
  return apiError('VALIDATION_ERROR', 'Validation failed. Please check the highlighted fields.', 422, fieldErrors)
}

/** 500 Internal Server Error */
export const internalError = (message = 'An unexpected error occurred. Please try again.') =>
  apiError('INTERNAL_ERROR', message, 500)
