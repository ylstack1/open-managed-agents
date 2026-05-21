// CF AUTH_DB schema (SQLite / D1).
//
// Holds: tenant, membership, user, session, account, verification,
// agents, agent_versions, sessions, session_resources,
// session_memory_stores, memory_stores, memories, memory_versions,
// vaults, credentials, model_cards, environments, files, eval_runs,
// kv_entries, api_keys, runtimes, runtime_tokens, connect_runtime_codes,
// usage_events, workspace_backups, memory_blob_poller_lease.
//
// drizzle-kit consumes this barrel via drizzle.cf-auth.config.ts and
// emits migrations into apps/main/migrations/.
//
// Tables populated in Phase 2 of the Drizzle adoption plan; empty for now.
export {};
