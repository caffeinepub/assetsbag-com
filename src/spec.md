# Specification

## Summary
**Goal:** Add per-market verified HTTPS fetch methods with a strict allowlist, and fix the backend/frontend actor API mismatch that blocks deployment.

**Planned changes:**
- Add four separate backend update methods in `backend/main.mo` to fetch external data for crypto, stocks, fiat, and commodities using the existing `OutCall.httpGetRequest(..., transform)` pattern.
- Implement a strict, hardcoded HTTPS allowlist so each per-market method can only call its own approved endpoints and traps on non-HTTPS or non-allowlisted URLs.
- Update or replace the existing `fetchExternalData(url : Text)` so it can no longer fetch arbitrary user-provided URLs and aligns with the allowlist safety model; ensure the backend Candid interface matches the implemented methods.
- Fix the deploy-breaking actor API mismatch by exposing a backend public method compatible with the frontend call `_initializeAccessControlWithSecret(adminToken)` without changing immutable frontend paths.

**User-visible outcome:** The canister deploys successfully, the frontend actor initializes without runtime errors, and market-category fetch calls work via dedicated methods that only reach allowlisted HTTPS endpoints (no open-proxy behavior).
