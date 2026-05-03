# Adaptive Difficulty Engine

> Status: Retired for `25maths-website`.
> Created: 2026-02-27.
> Retired: 2026-05-03.

The original adaptive-difficulty specification targeted the website's legacy online exercise player. That player, its public routes, runtime JavaScript, JSON catalog, Functions API routes, and exercise telemetry tables have been removed.

Do not implement this specification inside `25maths-website`.

If adaptive question selection is reintroduced, treat it as a new system design:

- Use a board-agnostic question ontology and metadata layer.
- Store cleaned question stems, solution metadata, shared compound stems, and asset references in a dedicated question bank.
- Keep generated figure assets and public static assets outside the private cleaned-question database.
- Expose only server-authorized slices to the frontend.
- Design fresh telemetry tables around attempts, mastery, review scheduling, and question versions.
- Add an ADR before introducing any schema or route that could recreate the retired website exercise surface.

The retired document is intentionally not preserved here because its implementation details point at deleted website modules.
