/**
 * @module
 * Type definitions for the Mem0 Deno SDK.
 *
 * This module exports all interfaces, types, and enums used by the MemoryClient.
 */

// deno-lint-ignore-file camelcase
// Note: Property names use snake_case to match the Mem0 API response format exactly.

// =============================================================================
// Enums
// =============================================================================

/**
 * API version for Mem0 endpoints.
 * V2 provides enhanced filtering capabilities.
 */
export enum API_VERSION {
  /** Version 1 - Original API with query parameters */
  V1 = "v1",
  /** Version 2 - Enhanced API with JSON body filters */
  V2 = "v2",
}

/**
 * Output format version for memory responses.
 */
export enum OutputFormat {
  /** Version 1.0 format */
  V1 = "v1.0",
  /** Version 1.1 format with additional fields */
  V1_1 = "v1.1",
}

/**
 * Feedback type for memory quality assessment.
 */
export enum Feedback {
  /** Memory was helpful */
  POSITIVE = "POSITIVE",
  /** Memory was not helpful */
  NEGATIVE = "NEGATIVE",
  /** Memory was harmful or incorrect */
  VERY_NEGATIVE = "VERY_NEGATIVE",
}

// =============================================================================
// Message Types
// =============================================================================

/**
 * Multimodal content for image messages.
 */
export interface MultiModalMessages {
  /** Content type indicator */
  type: "image_url";
  /** Image URL configuration */
  image_url: {
    /** URL of the image */
    url: string;
  };
}

/**
 * A single message in a conversation.
 */
export interface Messages {
  /** Role of the message sender */
  role: "user" | "assistant";
  /** Content of the message - text or multimodal */
  content: string | MultiModalMessages;
}

/**
 * Alias for Messages interface.
 */
export interface Message extends Messages {}

// =============================================================================
// Memory Types
// =============================================================================

/**
 * Data contained within a memory.
 */
export interface MemoryData {
  /** The memory content text */
  memory: string;
}

/**
 * A memory object returned by the API.
 */
export interface Memory {
  /** Unique identifier for the memory */
  id: string;
  /** Original messages that created this memory */
  messages?: Array<Messages>;
  /** Event type (ADD, UPDATE, DELETE, NOOP) */
  event?: string;
  /** Memory data container */
  data?: MemoryData | null;
  /** The memory content text */
  memory?: string;
  /** User ID associated with this memory */
  user_id?: string;
  /** Hash of the memory content */
  hash?: string;
  /** Categories assigned to this memory */
  categories?: Array<string>;
  /** Creation timestamp */
  created_at?: Date;
  /** Last update timestamp */
  updated_at?: Date;
  /** Type of memory (e.g., 'short_term', 'long_term') */
  memory_type?: string;
  /** Relevance score for search results */
  score?: number;
  /** Custom metadata attached to the memory */
  metadata?: Record<string, unknown> | null;
  /** Owner of the memory */
  owner?: string | null;
  /** Agent ID if memory is agent-specific */
  agent_id?: string | null;
  /** App ID if memory is app-specific */
  app_id?: string | null;
  /** Run ID if memory is run-specific */
  run_id?: string | null;
}

/**
 * History entry for a memory showing changes over time.
 */
export interface MemoryHistory {
  /** Unique identifier for this history entry */
  id: string;
  /** ID of the memory this history belongs to */
  memory_id: string;
  /** Original input messages */
  input: Array<Messages>;
  /** Previous memory content before change */
  old_memory: string | null;
  /** New memory content after change */
  new_memory: string | null;
  /** User ID associated with this change */
  user_id: string;
  /** Categories at time of change */
  categories: Array<string>;
  /** Event type (ADD, UPDATE, DELETE, NOOP) */
  event: string;
  /** When this history entry was created */
  created_at: Date;
  /** When this history entry was last updated */
  updated_at: Date;
}

/**
 * Body for updating a memory.
 */
export interface MemoryUpdateBody {
  /** ID of the memory to update */
  memoryId: string;
  /** New text content for the memory */
  text: string;
}

// =============================================================================
// Options Types
// =============================================================================

/**
 * Custom category definition.
 */
export interface CustomCategory {
  /** Category properties */
  [key: string]: unknown;
}

/**
 * Options for memory operations (add, getAll, deleteAll, etc.).
 */
export interface MemoryOptions {
  /** API version to use */
  api_version?: API_VERSION | string;
  /** Alternative way to specify API version */
  version?: API_VERSION | string;
  /** User ID to filter/associate memories */
  user_id?: string;
  /** Agent ID to filter/associate memories */
  agent_id?: string;
  /** App ID to filter/associate memories */
  app_id?: string;
  /** Run ID to filter/associate memories */
  run_id?: string;
  /** Custom metadata to attach */
  metadata?: Record<string, unknown>;
  /** Filters for querying (v2 API) */
  filters?: Record<string, unknown>;
  /** Organization name (deprecated) */
  org_name?: string | null;
  /** Project name (deprecated) */
  project_name?: string | null;
  /** Organization ID */
  org_id?: string | number | null;
  /** Project ID */
  project_id?: string | number | null;
  /** Whether to infer memories from messages */
  infer?: boolean;
  /** Page number for pagination */
  page?: number;
  /** Page size for pagination */
  page_size?: number;
  /** Fields to include in response */
  includes?: string;
  /** Fields to exclude from response */
  excludes?: string;
  /** Enable graph-based memory */
  enable_graph?: boolean;
  /** Filter by start date */
  start_date?: string;
  /** Filter by end date */
  end_date?: string;
  /** Custom categories for organization */
  custom_categories?: CustomCategory[];
  /** Custom instructions for memory processing */
  custom_instructions?: string;
  /** Unix timestamp for temporal context */
  timestamp?: number;
  /** Output format version */
  output_format?: string | OutputFormat;
  /** Enable async processing mode */
  async_mode?: boolean;
  /** Filter memories before returning */
  filter_memories?: boolean;
  /** Make memories immutable */
  immutable?: boolean;
  /** Schema for structured data extraction */
  structured_data_schema?: Record<string, unknown>;
}

/**
 * Options for search operations.
 */
export interface SearchOptions extends MemoryOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Minimum similarity threshold for results */
  threshold?: number;
  /** Top K results to consider */
  top_k?: number;
  /** Search only by metadata, not content */
  only_metadata_based_search?: boolean;
  /** Enable keyword-based search */
  keyword_search?: boolean;
  /** Fields to return in results */
  fields?: string[];
  /** Categories to filter by */
  categories?: string[];
  /** Enable result reranking */
  rerank?: boolean;
}

/**
 * Options for project operations.
 */
export interface ProjectOptions {
  /** Fields to include in project response */
  fields?: string[];
}

// =============================================================================
// User Types
// =============================================================================

/**
 * A user/entity in the Mem0 system.
 */
export interface User {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Creation timestamp */
  created_at: Date;
  /** Last update timestamp */
  updated_at: Date;
  /** Total number of memories for this user */
  total_memories: number;
  /** Owner of this entity */
  owner: string;
  /** Entity type (user, agent, app, run) */
  type: string;
}

/**
 * Paginated list of users/entities.
 */
export interface AllUsers {
  /** Total count of entities */
  count: number;
  /** Array of user entities */
  results: Array<User>;
  /** URL for next page */
  next: string | null;
  /** URL for previous page */
  previous: string | null;
}

// =============================================================================
// Project Types
// =============================================================================

/**
 * Project information response.
 */
export interface ProjectResponse {
  /** Custom instructions for the project */
  custom_instructions?: string;
  /** Custom categories defined for the project */
  custom_categories?: string[];
  /** Additional project properties */
  [key: string]: unknown;
}

/**
 * Payload for updating project prompts/settings.
 */
export interface PromptUpdatePayload {
  /** Custom instructions to set */
  custom_instructions?: string;
  /** Custom categories to set */
  custom_categories?: CustomCategory[];
  /** Additional properties */
  [key: string]: unknown;
}

// =============================================================================
// Webhook Types
// =============================================================================

/**
 * Webhook configuration.
 */
export interface Webhook {
  /** Unique webhook identifier */
  webhook_id?: string;
  /** Display name for the webhook */
  name: string;
  /** URL to send webhook events to */
  url: string;
  /** Associated project */
  project?: string;
  /** Creation timestamp */
  created_at?: Date;
  /** Last update timestamp */
  updated_at?: Date;
  /** Whether webhook is active */
  is_active?: boolean;
  /** Event types to trigger this webhook */
  event_types?: string[];
}

/**
 * Payload for creating/updating webhooks.
 */
export interface WebhookPayload {
  /** Event types to subscribe to */
  eventTypes: string[];
  /** Project ID */
  projectId: string;
  /** Webhook ID (for updates) */
  webhookId: string;
  /** Display name */
  name: string;
  /** Target URL */
  url: string;
}

// =============================================================================
// Feedback Types
// =============================================================================

/**
 * Payload for submitting memory feedback.
 */
export interface FeedbackPayload {
  /** ID of the memory to provide feedback on */
  memory_id: string;
  /** Feedback type */
  feedback?: Feedback | null;
  /** Optional reason for feedback */
  feedback_reason?: string | null;
}

// =============================================================================
// Export Types
// =============================================================================

/**
 * Common fields for export operations.
 */
export interface ExportCommon {
  /** Project ID */
  project_id?: string | null;
  /** Organization ID */
  org_id?: string | null;
}

/**
 * Payload for creating a memory export.
 */
export interface CreateMemoryExportPayload extends ExportCommon {
  /** Schema defining export structure */
  schema: Record<string, unknown>;
  /** Filters for selecting memories to export */
  filters: Record<string, unknown>;
  /** Instructions for export processing */
  export_instructions?: string;
}

/**
 * Payload for retrieving a memory export.
 */
export interface GetMemoryExportPayload extends ExportCommon {
  /** Filters for locating the export */
  filters?: Record<string, unknown>;
  /** Specific export ID to retrieve */
  memory_export_id?: string;
}

// =============================================================================
// Client Options
// =============================================================================

/**
 * Configuration options for the MemoryClient.
 */
export interface ClientOptions {
  /** Mem0 API key (required) */
  apiKey: string;
  /** Base URL for API requests (default: https://api.mem0.ai) */
  host?: string;
  /** Organization name (deprecated, use organizationId) */
  organizationName?: string;
  /** Project name (deprecated, use projectId) */
  projectName?: string;
  /** Organization ID */
  organizationId?: string;
  /** Project ID */
  projectId?: string;
}
