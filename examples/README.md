# sdk-deno-mem0 Examples

This directory contains comprehensive examples demonstrating all SDK features.

## Running Examples

All examples require the `MEM0_API_KEY` environment variable:

```bash
export MEM0_API_KEY=your-api-key-here
deno run --allow-net --allow-env examples/01_basic_usage.ts
```

## Example Index

| File                      | Methods Demonstrated               | Description             |
| ------------------------- | ---------------------------------- | ----------------------- |
| `01_basic_usage.ts`       | add, get, search                   | Quick start guide       |
| `02_memory_management.ts` | update, delete, deleteAll, history | CRUD operations         |
| `03_user_operations.ts`   | users, deleteUsers                 | Entity management       |
| `04_batch_operations.ts`  | batchUpdate, batchDelete           | Bulk operations         |
| `05_pagination.ts`        | getAll with pages                  | Handling large datasets |
| `06_webhooks.ts`          | webhook CRUD                       | Event subscriptions     |

## Quick Test

Test the SDK with a simple command:

```bash
export MEM0_API_KEY=your-key
deno run --allow-net --allow-env examples/01_basic_usage.ts
```

## Supabase Edge Functions

See `../supabase/functions/` for production-ready edge function examples.
