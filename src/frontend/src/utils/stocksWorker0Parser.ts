import { MarketType, type Asset } from '@/types';

/**
 * Parse the Worker0 stocks response into an array of Asset objects.
 * Handles defensive parsing without applying marketCap-based sorting or merging.
 * Expected structure: { "AAPL": { "lastPrice": 192.53, "marketCap": 2950000000000, "logoUrl": "...", "name": "Apple Inc" }, ... }
 */
export function parseStocksWorker0(rawResponseBody: string): { assets: Asset[]; error?: string } {
  try {
    if (!rawResponseBody || typeof rawResponseBody !== 'string') {
      return { assets: [], error: 'Invalid stocks data: expected string' };
    }

    const parsed = JSON.parse(rawResponseBody);

    if (!parsed || typeof parsed !== 'object') {
      return { assets: [], error: 'Invalid stocks data: expected object' };
    }

    const assets: Asset[] = [];

    // Iterate over the object keys (tickers)
    for (const [ticker, stockData] of Object.entries(parsed)) {
      if (!stockData || typeof stockData !== 'object') {
        console.warn(`Skipping invalid stock entry for ticker "${ticker}"`);
        continue;
      }

      const stock = stockData as any;

      const name = stock.name || ticker;
      const marketCap = typeof stock.marketCap === 'number' ? stock.marketCap : Number(stock.marketCap || 0);
      const lastPrice = typeof stock.lastPrice === 'number' ? stock.lastPrice : Number(stock.lastPrice || 0);
      const logoUrl = stock.logoUrl || '';

      assets.push({
        marketType: MarketType.stocks,
        ticker: ticker,
        name: name,
        marketCap: marketCap,
        lastPrice: lastPrice,
        logoUrl: logoUrl,
      });
    }

    if (assets.length === 0) {
      return { assets: [], error: 'No valid stock entries found in response' };
    }

    // Return assets without sorting (no marketCap-based sorting)
    return { assets };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return { assets: [], error: `Failed to parse stocks data: ${message}` };
  }
}
