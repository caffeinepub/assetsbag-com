import { MarketType, type Asset } from '@/types';

interface FxRateEntry {
  countryCode: string;
  countryName: string;
  rateUSD: number;
  date: string;
}

interface FxRatesResponse {
  rates: Record<string, FxRateEntry>;
}

/**
 * Parse the fx_rates.json response into an array of Asset objects
 * Handles defensive parsing for missing keys and unexpected shapes
 */
export function parseFiatFxRates(rawJson: string): { assets: Asset[]; error?: string } {
  try {
    if (!rawJson || rawJson.trim() === '') {
      return { assets: [], error: 'Empty response body' };
    }

    const parsed = JSON.parse(rawJson) as FxRatesResponse;

    if (!parsed || typeof parsed !== 'object') {
      return { assets: [], error: 'Invalid JSON structure: expected object' };
    }

    if (!parsed.rates || typeof parsed.rates !== 'object') {
      return { assets: [], error: 'Missing or invalid "rates" field' };
    }

    const assets: Asset[] = [];

    for (const [key, entry] of Object.entries(parsed.rates)) {
      if (!entry || typeof entry !== 'object') {
        console.warn(`Skipping invalid entry for key "${key}"`);
        continue;
      }

      const countryCode = entry.countryCode || key;
      const countryName = entry.countryName || 'Unknown';

      if (!countryCode) {
        console.warn(`Skipping entry with missing countryCode`);
        continue;
      }

      assets.push({
        marketType: MarketType.fiat,
        ticker: countryCode,
        name: countryName,
      });
    }

    if (assets.length === 0) {
      return { assets: [], error: 'No valid FIAT entries found in response' };
    }

    return { assets };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return { assets: [], error: `Failed to parse FIAT data: ${message}` };
  }
}
