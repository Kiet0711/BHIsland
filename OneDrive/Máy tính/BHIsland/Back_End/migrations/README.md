# Backend database migrations

Migrations in this directory define the schema actually deployed by GIsland. `Document/GIsland-PostgreSQL-Core.sql` is the original reference schema and is not an alternate migration source.

## Rules

- Apply migrations only through the migration runner selected in `Document/DECISIONS.md` ADR-002; do not run them manually in a shared database.
- Migration versions are ordered and immutable after first use in any shared environment. Correct mistakes with a new forward migration.
- Each migration must be safe for the expected deploy sequence and document any data backfill, lock, or downtime concern.
- Apply schema, backend models/validation, OpenAPI and frontend types in the same change set as described in `Document/SYNC-RULES.md`.
- A migration is not considered applied until the runner records it and the target DB schema has been inspected.

## Current migration

`0001_phase_b_identity_garage_media.sql` introduces identity/session/token, profile, vehicle taxonomy, media metadata and garage tables. It has **not** been applied; the current machine has no PostgreSQL CLI or Docker detected. Select a local PostgreSQL service and migration runner before applying it.

