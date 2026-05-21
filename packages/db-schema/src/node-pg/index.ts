// Node-PG schema — union of cf-auth + cf-integrations + cf-router with
// PG-typed columns (BIGINT timestamps, TIMESTAMPTZ for better-auth,
// BOOLEAN for boolean flags, etc.).
//
// On Node self-host every table lives in one PG database. The schema
// is the union of what CF splits across 3 D1 bindings.
//
// drizzle-kit consumes this barrel via drizzle.node-pg.config.ts and
// emits migrations into apps/main-node/migrations/ (Phase 3 will add
// that directory back — currently exists on rl-logprobs branch only).
//
// Tables populated in Phase 2; empty for now.
export {};
