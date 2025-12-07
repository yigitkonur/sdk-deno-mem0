/**
 * Custom error class for Mem0 API-related errors.
 *
 * This error is thrown when the Mem0 API returns a non-OK HTTP response.
 * It captures the HTTP status code and error message for debugging.
 *
 * @example
 * ```ts
 * import { MemoryClient, APIError } from "mem0-deno-sdk";
 *
 * const client = new MemoryClient({ apiKey: "your-key" });
 *
 * try {
 *   await client.get("non-existent-id");
 * } catch (error) {
 *   if (error instanceof APIError) {
 *     console.log(`Status: ${error.status}`);
 *     console.log(`Message: ${error.message}`);
 *   }
 * }
 * ```
 */
export class APIError extends Error {
  /** HTTP status code from the API response */
  readonly status: number;

  /**
   * Creates a new APIError instance.
   *
   * @param status - HTTP status code (e.g., 401, 404, 500)
   * @param message - Error message from API or generated description
   */
  constructor(status: number, message: string) {
    super(`API request failed with status ${status}: ${message}`);
    this.name = "APIError";
    this.status = status;
  }
}
