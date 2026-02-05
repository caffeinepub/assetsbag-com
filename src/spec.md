# Specification

## Summary
**Goal:** Show a live, backend-cached list of FIAT currencies in the Add-Asset search when the user selects the Fiat market type.

**Planned changes:**
- Update AddAssetPage/AssetSearch flow so selecting the Fiat market type loads FIAT currencies from the backend-cached VPS1 endpoint using the existing backend methods fetchFiatVPS1Data() and getFiatVPS1ValidationResult().
- Parse the VPS1 `fx_rates.json` response and map each `rates` entry into an Asset (marketType=fiat, ticker=countryCode, name=countryName), replacing the static `fiatCatalog` while valid data is available.
- Add/extend a frontend data hook backed by React Query to trigger FIAT cache refresh on entering Fiat, store the parsed FIAT Asset list in query cache, and expose loading/error states.
- Add in-place FIAT results UI states: loading indicator while fetching, clear error/empty message when cached data is null/invalid or fetch fails, plus a retry path (reselect Fiat or an explicit retry control).

**User-visible outcome:** When switching to the Fiat market type in Add-Asset, users see and can search a live list of FIAT currencies (by ticker or name) sourced from the VPS1 `fx_rates.json` cache; loading and error states are shown without affecting other market types.
