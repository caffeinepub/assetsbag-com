import { MarketType, type Asset } from '@/types';

// Local Stock type matching backend's internal Stock structure
type Stock = {
  ticker: string;
  name: string;
  lastPrice: number;
  marketCap: bigint;
  logoUrl: string;
  validationStatus: 'valid' | 'invalid';
  errorMessage: string | null;
};

/**
 * Parse the merged stocks response from backend into an array of Asset objects
 * Handles defensive parsing without applying marketCap-based sorting (removed as per requirements)
 */
export function parseStocks(stocksArray: Array<[string, Stock]>): { assets: Asset[]; error?: string } {
  try {
    if (!stocksArray || !Array.isArray(stocksArray)) {
      return { assets: [], error: 'Invalid stocks data: expected array' };
    }

    if (stocksArray.length === 0) {
      return { assets: [], error: 'No stocks data available' };
    }

    const assets: Asset[] = [];

    for (const [ticker, stock] of stocksArray) {
      if (!stock || typeof stock !== 'object') {
        console.warn(`Skipping invalid stock entry for ticker "${ticker}"`);
        continue;
      }

      // Skip invalid stocks
      if (stock.validationStatus === 'invalid') {
        console.warn(`Skipping invalid stock: ${ticker} - ${stock.errorMessage || 'Unknown error'}`);
        continue;
      }

      const name = stock.name || ticker;
      const marketCap = typeof stock.marketCap === 'bigint' ? Number(stock.marketCap) : Number(stock.marketCap || 0);
      const lastPrice = stock.lastPrice || 0;
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

    // Return assets without sorting (marketCap sorting removed)
    return { assets };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return { assets: [], error: `Failed to parse stocks data: ${message}` };
  }
}
