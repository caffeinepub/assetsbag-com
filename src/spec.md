# Specification

## Summary
**Goal:** Fetch and store the full Worker0 `stocks.json` from the backend in a single HTTP outcall, and use it as the sole data source for the frontend Stocks Add-Asset search without any merge or marketCap sorting.

**Planned changes:**
- Add a permission-gated backend update method to fetch `https://api.assetsbag.com/stocks.json` in one request, validate, and store the raw response body as-is (no transform/merge/sort; no chunk pipeline).
- Store and expose a latest Worker0 stocks validation/inspection record (requestedUrl, timestamp, rawResponseBody, validationStatus, errorMessage, truncated flag).
- Add a permission-gated backend query method to read the latest stored Worker0 stocks inspection record without triggering a new fetch.
- Update the frontend Stocks market data path used by Add-Asset search to trigger the new backend Worker0 fetch flow and parse the stored result for search.
- Update Stocks-related UI copy to remove references to merging multiple endpoints or chunked fetching, and ensure no marketCap-based sorting is applied for this path.

**User-visible outcome:** When adding a Stock asset, the app loads stock assets from the single Worker0 `stocks.json` source via the backend, and search results are shown without any multi-source merging or marketCap sorting.
