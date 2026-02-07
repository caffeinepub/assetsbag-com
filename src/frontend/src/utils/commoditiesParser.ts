import { MarketType, type Asset } from '@/types';

interface CommodityEntry {
  symbol: string;
  name: string;
  category?: string;
  unit?: string;
}

interface CommoditiesResponse {
  commodities: Record<string, CommodityEntry>;
}

/**
 * Parse the commodities.json response into an array of Asset objects
 * Handles defensive parsing for missing keys and unexpected shapes
 */
export function parseCommodities(rawJson: string): { assets: Asset[]; error?: string } {
  try {
    if (!rawJson || rawJson.trim() === '') {
      return { assets: [], error: 'Empty response body' };
    }

    const parsed = JSON.parse(rawJson) as CommoditiesResponse;

    if (!parsed || typeof parsed !== 'object') {
      return { assets: [], error: 'Invalid JSON structure: expected object' };
    }

    if (!parsed.commodities || typeof parsed.commodities !== 'object') {
      return { assets: [], error: 'Missing or invalid "commodities" field' };
    }

    const assets: Asset[] = [];

    for (const [key, entry] of Object.entries(parsed.commodities)) {
      if (!entry || typeof entry !== 'object') {
        console.warn(`Skipping invalid entry for key "${key}"`);
        continue;
      }

      const symbol = entry.symbol || key;
      const name = entry.name || 'Unknown';

      if (!symbol) {
        console.warn(`Skipping entry with missing symbol`);
        continue;
      }

      assets.push({
        marketType: MarketType.commodities,
        ticker: symbol,
        name: name,
      });
    }

    if (assets.length === 0) {
      return { assets: [], error: 'No valid commodity entries found in response' };
    }

    return { assets };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return { assets: [], error: `Failed to parse commodities data: ${message}` };
  }
}
