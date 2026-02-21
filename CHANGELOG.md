# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-07

### Added

- Initial release of sdk-deno-mem0
- `MemoryClient` class with full Mem0 Cloud API support
- Memory operations: add, get, getAll, search, update, delete, deleteAll, history
- User/entity management: users, deleteUsers
- Batch operations: batchUpdate, batchDelete
- Project management: getProject, updateProject
- Webhook management: getWebhooks, createWebhook, updateWebhook, deleteWebhook
- Feedback submission: feedback
- Export functionality: createMemoryExport, getMemoryExport
- Full TypeScript type definitions
- JSDoc documentation for all public APIs
- Unit tests with mocked fetch
- Supabase Edge Functions compatibility
- Zero external dependencies (uses native fetch)

### Security

- No telemetry or analytics
- API keys stored in private class fields
- Request timeouts via AbortSignal

### Compatibility

- Deno 1.40+
- Supabase Edge Functions
- Deno Deploy
