/**
 * @module
 * MemoryClient implementation for Mem0 Cloud API.
 */

import { APIError } from "./error.ts";
import type {
  AllUsers,
  ClientOptions,
  CreateMemoryExportPayload,
  FeedbackPayload,
  GetMemoryExportPayload,
  Memory,
  MemoryHistory,
  MemoryOptions,
  MemoryUpdateBody,
  Message,
  ProjectOptions,
  ProjectResponse,
  PromptUpdatePayload,
  SearchOptions,
  Webhook,
  WebhookPayload,
} from "./types.ts";

/**
 * Client for interacting with the Mem0 Cloud API.
 *
 * The MemoryClient provides methods to manage memories, users, projects,
 * and webhooks in the Mem0 platform.
 *
 * @example
 * ```ts
 * import { MemoryClient } from "sdk-deno-mem0";
 *
 * const client = new MemoryClient({ apiKey: Deno.env.get("MEM0_API_KEY")! });
 *
 * // Add a memory
 * const memories = await client.add(
 *   [{ role: "user", content: "I prefer dark mode" }],
 *   { user_id: "alice" }
 * );
 *
 * // Search memories
 * const results = await client.search("What are my preferences?", {
 *   user_id: "alice"
 * });
 * ```
 */
export class MemoryClient {
  #apiKey: string;
  #host: string;
  #organizationName: string | null;
  #projectName: string | null;
  #organizationId: string | number | null;
  #projectId: string | number | null;
  #headers: Record<string, string>;
  #timeout: number;

  /**
   * Creates a new MemoryClient instance.
   *
   * @param options - Configuration options for the client
   * @throws {Error} When API key is missing, empty, or not a string
   *
   * @example
   * ```ts
   * // Basic usage
   * const client = new MemoryClient({ apiKey: "your-api-key" });
   *
   * // With custom host and project
   * const client = new MemoryClient({
   *   apiKey: "your-api-key",
   *   host: "https://custom.api.mem0.ai",
   *   organizationId: "org_123",
   *   projectId: "proj_456"
   * });
   * ```
   */
  constructor(options: ClientOptions) {
    this.#apiKey = options.apiKey;
    this.#host = options.host ?? "https://api.mem0.ai";
    this.#organizationName = options.organizationName ?? null;
    this.#projectName = options.projectName ?? null;
    this.#organizationId = options.organizationId ?? null;
    this.#projectId = options.projectId ?? null;
    this.#timeout = 60000;

    this.#headers = {
      Authorization: `Token ${this.#apiKey}`,
      "Content-Type": "application/json",
    };

    this.#validateApiKey();
    this.#validateOrgProject();
  }

  #validateApiKey(): void {
    if (!this.#apiKey) {
      throw new Error("Mem0 API key is required");
    }
    if (typeof this.#apiKey !== "string") {
      throw new Error("Mem0 API key must be a string");
    }
    if (this.#apiKey.trim() === "") {
      throw new Error("Mem0 API key cannot be empty");
    }
  }

  #validateOrgProject(): void {
    if (
      (this.#organizationName === null && this.#projectName !== null) ||
      (this.#organizationName !== null && this.#projectName === null)
    ) {
      // Deprecation warning for API migration - helps developers update their code
      // deno-lint-ignore no-console
      console.warn(
        "Warning: Both organizationName and projectName must be provided together. " +
          "Note: organizationName/projectName are deprecated in favor of organizationId/projectId.",
      );
    }

    if (
      (this.#organizationId === null && this.#projectId !== null) ||
      (this.#organizationId !== null && this.#projectId === null)
    ) {
      // Configuration warning - helps developers fix setup issues
      // deno-lint-ignore no-console
      console.warn(
        "Warning: Both organizationId and projectId must be provided together.",
      );
    }
  }

  async #fetchWithErrorHandling(
    url: string,
    options: RequestInit = {},
  ): Promise<unknown> {
    const signal = AbortSignal.timeout(this.#timeout);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        signal,
        headers: {
          ...this.#headers,
          ...options.headers,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.#timeout}ms for ${url}`);
      }
      throw error;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(response.status, errorText || response.statusText);
    }

    return response.json();
  }

  #preparePayload(
    messages: Array<Message>,
    options: MemoryOptions,
  ): Record<string, unknown> {
    return { messages, ...options };
  }

  #prepareParams(options: MemoryOptions): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(options)) {
      if (value !== null && value !== undefined) {
        params[key] = String(value);
      }
    }
    return params;
  }

  #addOrgProjectToOptions(options: MemoryOptions): MemoryOptions {
    const result = { ...options };

    if (this.#organizationName !== null && this.#projectName !== null) {
      result.org_name = this.#organizationName;
      result.project_name = this.#projectName;
    }

    if (this.#organizationId !== null && this.#projectId !== null) {
      result.org_id = this.#organizationId;
      result.project_id = this.#projectId;
      delete result.org_name;
      delete result.project_name;
    }

    return result;
  }

  /**
   * Checks API connectivity and validates the API key.
   *
   * @throws {APIError} When the API returns an error or key is invalid
   *
   * @example
   * ```ts
   * await client.ping();
   * console.log("API connection successful!");
   * ```
   */
  async ping(): Promise<void> {
    const response = (await this.#fetchWithErrorHandling(
      `${this.#host}/v1/ping/`,
      { method: "GET" },
    )) as { status?: string; message?: string; org_id?: string; project_id?: string };

    if (!response || typeof response !== "object") {
      throw new APIError(500, "Invalid response format from ping endpoint");
    }

    if (response.status !== "ok") {
      throw new APIError(401, response.message ?? "API Key is invalid");
    }

    // Update org/project IDs from response if not already set
    if (response.org_id && !this.#organizationId) {
      this.#organizationId = response.org_id;
    }
    if (response.project_id && !this.#projectId) {
      this.#projectId = response.project_id;
    }
  }

  /**
   * Adds new memories from conversation messages.
   *
   * @param messages - Array of conversation messages with role and content
   * @param options - Optional parameters including user_id, agent_id, metadata
   * @returns Array of created Memory objects with IDs
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const memories = await client.add(
   *   [
   *     { role: "user", content: "I'm planning a trip to Tokyo next month." },
   *     { role: "assistant", content: "Great! I'll remember that." }
   *   ],
   *   { user_id: "alice", version: "v2" }
   * );
   * console.log(memories[0].id);
   * ```
   */
  async add(
    messages: Array<Message>,
    options: MemoryOptions = {},
  ): Promise<Array<Memory>> {
    const opts = this.#addOrgProjectToOptions(options);

    if (opts.api_version) {
      opts.version = String(opts.api_version);
    }

    const payload = this.#preparePayload(messages, opts);

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/memories/`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return response as Array<Memory>;
  }

  /**
   * Updates an existing memory.
   *
   * @param memoryId - The ID of the memory to update
   * @param data - Object containing text and/or metadata to update
   * @returns Updated Memory object
   * @throws {Error} When neither text nor metadata is provided
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const updated = await client.update("mem_123", {
   *   text: "Updated preference: prefers dark mode in all apps"
   * });
   * ```
   */
  async update(
    memoryId: string,
    data: { text?: string; metadata?: Record<string, unknown> },
  ): Promise<Array<Memory>> {
    if (data.text === undefined && data.metadata === undefined) {
      throw new Error("Either text or metadata must be provided for update.");
    }

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/memories/${memoryId}/`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );

    return response as Array<Memory>;
  }

  /**
   * Retrieves a specific memory by ID.
   *
   * @param memoryId - The ID of the memory to retrieve
   * @returns The Memory object
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const memory = await client.get("mem_123");
   * console.log(memory.memory);
   * ```
   */
  async get(memoryId: string): Promise<Memory> {
    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/memories/${memoryId}/`,
      { method: "GET" },
    );

    return response as Memory;
  }

  /**
   * Retrieves all memories matching the given filters.
   *
   * @param options - Filter options including user_id, agent_id, pagination
   * @returns Array of Memory objects
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * // Get all memories for a user
   * const memories = await client.getAll({ user_id: "alice" });
   *
   * // With pagination
   * const page = await client.getAll({
   *   user_id: "alice",
   *   page: 1,
   *   page_size: 10
   * });
   * ```
   */
  async getAll(options: SearchOptions = {}): Promise<Array<Memory>> {
    const { api_version, page, page_size, ...otherOptions } = options;
    const opts = this.#addOrgProjectToOptions(otherOptions);

    let paginationParams = "";
    if (page && page_size) {
      paginationParams = `page=${page}&page_size=${page_size}`;
    }

    if (api_version === "v2") {
      const url = paginationParams
        ? `${this.#host}/v2/memories/?${paginationParams}`
        : `${this.#host}/v2/memories/`;

      const response = await this.#fetchWithErrorHandling(url, {
        method: "POST",
        body: JSON.stringify(opts),
      });

      return response as Array<Memory>;
    }

    const params = new URLSearchParams(this.#prepareParams(opts));
    const url = paginationParams
      ? `${this.#host}/v1/memories/?${params}&${paginationParams}`
      : `${this.#host}/v1/memories/?${params}`;

    const response = await this.#fetchWithErrorHandling(url, {
      method: "GET",
    });

    return response as Array<Memory>;
  }

  /**
   * Searches memories using semantic similarity.
   *
   * @param query - The search query string
   * @param options - Search options including filters and thresholds
   * @returns Array of Memory objects sorted by relevance
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const results = await client.search("What are my travel plans?", {
   *   user_id: "alice",
   *   threshold: 0.7,
   *   limit: 5
   * });
   *
   * for (const memory of results) {
   *   console.log(`${memory.memory} (score: ${memory.score})`);
   * }
   * ```
   */
  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<Array<Memory>> {
    const { api_version, ...otherOptions } = options;
    const opts = this.#addOrgProjectToOptions(otherOptions);
    const payload = { query, ...opts };

    const endpoint = api_version === "v2" ? "/v2/memories/search/" : "/v1/memories/search/";

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}${endpoint}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return response as Array<Memory>;
  }

  /**
   * Deletes a specific memory by ID.
   *
   * @param memoryId - The ID of the memory to delete
   * @returns Confirmation message
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const result = await client.delete("mem_123");
   * console.log(result.message); // "Memory deleted successfully"
   * ```
   */
  async delete(memoryId: string): Promise<{ message: string }> {
    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/memories/${memoryId}/`,
      { method: "DELETE" },
    );

    return response as { message: string };
  }

  /**
   * Deletes all memories matching the given filters.
   *
   * @param options - Filter options to select memories for deletion
   * @returns Confirmation message
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * // Delete all memories for a user
   * const result = await client.deleteAll({ user_id: "alice" });
   * console.log(result.message);
   * ```
   */
  async deleteAll(options: MemoryOptions = {}): Promise<{ message: string }> {
    const opts = this.#addOrgProjectToOptions(options);
    const params = new URLSearchParams(this.#prepareParams(opts));

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/memories/?${params}`,
      { method: "DELETE" },
    );

    return response as { message: string };
  }

  /**
   * Retrieves the history of changes for a specific memory.
   *
   * @param memoryId - The ID of the memory
   * @returns Array of MemoryHistory entries showing changes over time
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const history = await client.history("mem_123");
   * for (const entry of history) {
   *   console.log(`${entry.event}: ${entry.old_memory} -> ${entry.new_memory}`);
   * }
   * ```
   */
  async history(memoryId: string): Promise<Array<MemoryHistory>> {
    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/memories/${memoryId}/history/`,
      { method: "GET" },
    );

    return response as Array<MemoryHistory>;
  }

  /**
   * Lists all users/entities that have memories.
   *
   * @returns Paginated list of users with memory counts
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const users = await client.users();
   * console.log(`Total entities: ${users.count}`);
   * for (const user of users.results) {
   *   console.log(`${user.name}: ${user.total_memories} memories`);
   * }
   * ```
   */
  async users(): Promise<AllUsers> {
    const opts = this.#addOrgProjectToOptions({});
    const params = new URLSearchParams(this.#prepareParams(opts));

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/entities/?${params}`,
      { method: "GET" },
    );

    return response as AllUsers;
  }

  /**
   * Deletes a user/entity by ID.
   *
   * @deprecated Use deleteUsers() instead. Will be removed in version 2.2.0.
   * @param data - Object containing entity_id and entity_type
   * @returns Confirmation message
   * @throws {APIError} When the API returns a non-OK response
   */
  async deleteUser(data: {
    entity_id: number;
    entity_type?: string;
  }): Promise<{ message: string }> {
    const entityType = data.entity_type ?? "user";

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/entities/${entityType}/${data.entity_id}/`,
      { method: "DELETE" },
    );

    return response as { message: string };
  }

  /**
   * Deletes users/entities by various identifiers.
   *
   * @param params - Object with user_id, agent_id, app_id, or run_id to delete
   * @returns Confirmation message
   * @throws {APIError} When the API returns a non-OK response
   * @throws {Error} When no entities are found to delete
   *
   * @example
   * ```ts
   * // Delete a specific user
   * await client.deleteUsers({ user_id: "alice" });
   *
   * // Delete an agent
   * await client.deleteUsers({ agent_id: "shopping-assistant" });
   * ```
   */
  async deleteUsers(params: {
    user_id?: string;
    agent_id?: string;
    app_id?: string;
    run_id?: string;
  } = {}): Promise<{ message: string }> {
    const { user_id, agent_id, app_id, run_id } = params;

    let toDelete: Array<{ type: string; name: string }> = [];

    if (user_id) {
      toDelete = [{ type: "user", name: user_id }];
    } else if (agent_id) {
      toDelete = [{ type: "agent", name: agent_id }];
    } else if (app_id) {
      toDelete = [{ type: "app", name: app_id }];
    } else if (run_id) {
      toDelete = [{ type: "run", name: run_id }];
    } else {
      const entities = await this.users();
      toDelete = entities.results.map((entity) => ({
        type: entity.type,
        name: entity.name,
      }));
    }

    if (toDelete.length === 0) {
      throw new Error("No entities to delete");
    }

    const requestOpts = this.#addOrgProjectToOptions({});
    const queryParams = new URLSearchParams(this.#prepareParams(requestOpts));

    for (const entity of toDelete) {
      const url = `${this.#host}/v2/entities/${entity.type}/${entity.name}/?${queryParams}`;
      await this.#fetchWithErrorHandling(url, { method: "DELETE" });
    }

    return {
      message: user_id || agent_id || app_id || run_id
        ? "Entity deleted successfully."
        : "All users, agents, apps and runs deleted.",
    };
  }

  /**
   * Updates multiple memories in a single batch operation.
   *
   * @param memories - Array of memory update objects with memoryId and text
   * @returns Confirmation message
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * await client.batchUpdate([
   *   { memoryId: "mem_1", text: "Updated text 1" },
   *   { memoryId: "mem_2", text: "Updated text 2" }
   * ]);
   * ```
   */
  async batchUpdate(memories: Array<MemoryUpdateBody>): Promise<{ message: string }> {
    const memoriesBody = memories.map((memory) => ({
      memory_id: memory.memoryId,
      text: memory.text,
    }));

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/batch/`,
      {
        method: "PUT",
        body: JSON.stringify({ memories: memoriesBody }),
      },
    );

    return response as { message: string };
  }

  /**
   * Deletes multiple memories in a single batch operation.
   *
   * @param memoryIds - Array of memory IDs to delete
   * @returns Confirmation message
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * await client.batchDelete(["mem_1", "mem_2", "mem_3"]);
   * ```
   */
  async batchDelete(memoryIds: Array<string>): Promise<{ message: string }> {
    const memoriesBody = memoryIds.map((id) => ({ memory_id: id }));

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/batch/`,
      {
        method: "DELETE",
        body: JSON.stringify({ memories: memoriesBody }),
      },
    );

    return response as { message: string };
  }

  /**
   * Retrieves project configuration and settings.
   *
   * @param options - Options specifying which fields to include
   * @returns Project configuration including instructions and categories
   * @throws {Error} When organizationId and projectId are not set
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const project = await client.getProject({
   *   fields: ["custom_instructions", "custom_categories"]
   * });
   * console.log(project.custom_instructions);
   * ```
   */
  async getProject(options: ProjectOptions): Promise<ProjectResponse> {
    if (!(this.#organizationId && this.#projectId)) {
      throw new Error(
        "organizationId and projectId must be set to access project settings",
      );
    }

    const params = new URLSearchParams();
    options.fields?.forEach((field) => params.append("fields", field));

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/api/v1/orgs/organizations/${this.#organizationId}/projects/${this.#projectId}/?${params}`,
      { method: "GET" },
    );

    return response as ProjectResponse;
  }

  /**
   * Updates project configuration and settings.
   *
   * @param prompts - Update payload with instructions and/or categories
   * @returns Updated project configuration
   * @throws {Error} When organizationId and projectId are not set
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * await client.updateProject({
   *   custom_instructions: "Focus on user preferences and habits"
   * });
   * ```
   */
  async updateProject(
    prompts: PromptUpdatePayload,
  ): Promise<Record<string, unknown>> {
    if (!(this.#organizationId && this.#projectId)) {
      throw new Error(
        "organizationId and projectId must be set to update project settings",
      );
    }

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/api/v1/orgs/organizations/${this.#organizationId}/projects/${this.#projectId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(prompts),
      },
    );

    return response as Record<string, unknown>;
  }

  /**
   * Lists all webhooks for the project.
   *
   * @param data - Optional object with projectId override
   * @returns Array of Webhook configurations
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const webhooks = await client.getWebhooks();
   * for (const webhook of webhooks) {
   *   console.log(`${webhook.name}: ${webhook.url}`);
   * }
   * ```
   */
  async getWebhooks(data?: { projectId?: string }): Promise<Array<Webhook>> {
    const projectId = data?.projectId ?? this.#projectId;

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/api/v1/webhooks/projects/${projectId}/`,
      { method: "GET" },
    );

    return response as Array<Webhook>;
  }

  /**
   * Creates a new webhook.
   *
   * @param webhook - Webhook configuration
   * @returns Created Webhook object
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const webhook = await client.createWebhook({
   *   name: "Memory Updates",
   *   url: "https://myapp.com/webhooks/mem0",
   *   eventTypes: ["memory_add", "memory_update"],
   *   projectId: "proj_123",
   *   webhookId: ""
   * });
   * ```
   */
  async createWebhook(webhook: WebhookPayload): Promise<Webhook> {
    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/api/v1/webhooks/projects/${this.#projectId}/`,
      {
        method: "POST",
        body: JSON.stringify(webhook),
      },
    );

    return response as Webhook;
  }

  /**
   * Updates an existing webhook.
   *
   * @param webhook - Updated webhook configuration
   * @returns Confirmation message
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * await client.updateWebhook({
   *   webhookId: "wh_123",
   *   name: "Updated Name",
   *   url: "https://newurl.com/webhook",
   *   eventTypes: ["memory_add"],
   *   projectId: "proj_123"
   * });
   * ```
   */
  async updateWebhook(webhook: WebhookPayload): Promise<{ message: string }> {
    const projectId = webhook.projectId || this.#projectId;

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/api/v1/webhooks/${webhook.webhookId}/`,
      {
        method: "PUT",
        body: JSON.stringify({ ...webhook, projectId }),
      },
    );

    return response as { message: string };
  }

  /**
   * Deletes a webhook.
   *
   * @param data - Object containing webhookId
   * @returns Confirmation message
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * await client.deleteWebhook({ webhookId: "wh_123" });
   * ```
   */
  async deleteWebhook(data: { webhookId: string }): Promise<{ message: string }> {
    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/api/v1/webhooks/${data.webhookId}/`,
      { method: "DELETE" },
    );

    return response as { message: string };
  }

  /**
   * Submits feedback on a memory.
   *
   * @param data - Feedback payload with memory_id and feedback type
   * @returns Confirmation message
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * import { Feedback } from "sdk-deno-mem0";
   *
   * await client.feedback({
   *   memory_id: "mem_123",
   *   feedback: Feedback.POSITIVE,
   *   feedback_reason: "Very helpful memory"
   * });
   * ```
   */
  async feedback(data: FeedbackPayload): Promise<{ message: string }> {
    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/feedback/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    return response as { message: string };
  }

  /**
   * Creates a memory export job.
   *
   * @param data - Export configuration with filters and schema
   * @returns Export job ID and status message
   * @throws {Error} When filters or schema is missing
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const exportJob = await client.createMemoryExport({
   *   filters: { user_id: "alice" },
   *   schema: { format: "json" }
   * });
   * console.log(`Export started: ${exportJob.id}`);
   * ```
   */
  async createMemoryExport(
    data: CreateMemoryExportPayload,
  ): Promise<{ message: string; id: string }> {
    if (!data.filters || !data.schema) {
      throw new Error("Missing filters or schema");
    }

    const payload = {
      ...data,
      "org_id": this.#organizationId?.toString() ?? null,
      "project_id": this.#projectId?.toString() ?? null,
    };

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/exports/`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return response as { message: string; id: string };
  }

  /**
   * Retrieves a memory export by ID or filters.
   *
   * @param data - Query with memory_export_id or filters
   * @returns Export data and status
   * @throws {Error} When neither memory_export_id nor filters is provided
   * @throws {APIError} When the API returns a non-OK response
   *
   * @example
   * ```ts
   * const exportData = await client.getMemoryExport({
   *   memory_export_id: "exp_123"
   * });
   * ```
   */
  async getMemoryExport(
    data: GetMemoryExportPayload,
  ): Promise<{ message: string; id: string }> {
    if (!data.memory_export_id && !data.filters) {
      throw new Error("Missing memory_export_id or filters");
    }

    const payload = {
      ...data,
      "org_id": this.#organizationId?.toString() ?? "",
      "project_id": this.#projectId?.toString() ?? "",
    };

    const response = await this.#fetchWithErrorHandling(
      `${this.#host}/v1/exports/get/`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return response as { message: string; id: string };
  }
}
