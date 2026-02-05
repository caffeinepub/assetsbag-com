# Specification

## Summary
**Goal:** Fix the current canister deployment failure via a clean rebuild, and add a minimal backend scaffold for fetching market data from multiple external HTTP endpoints with a small runtime-verifiable API.

**Planned changes:**
- Perform a clean frontend+backend rebuild to capture the exact deploy failure step and error, then apply a concrete fix so the project builds and the canister deploys successfully.
- In `backend/main.mo` (single actor only), add a minimal internal abstraction for multiple market-data endpoints (e.g., endpoint selector/registry and per-endpoint fetch function signatures) without merging, caching, timers, or fallback logic.
- Expose a minimal public backend method to fetch from a selected endpoint and return a small typed success result or a structured typed error (no routine traps), with authorization consistent with existing patterns or explicitly documented as non-sensitive.

**User-visible outcome:** The canister deploys successfully, and there is a callable backend method that can fetch a chosen market-data endpoint and return an inspectable typed result or typed error to validate connectivity/parsing before later steps.
