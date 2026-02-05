import { MarketType, type Asset } from '@/types';

/**
 * Static asset catalog for demonstration purposes.
 * This will be replaced with real market-data API integration.
 */
export const assetCatalog: Record<MarketType, Asset[]> = {
  [MarketType.crypto]: [
    { marketType: MarketType.crypto, ticker: 'BTC', name: 'Bitcoin' },
    { marketType: MarketType.crypto, ticker: 'ETH', name: 'Ethereum' },
    { marketType: MarketType.crypto, ticker: 'SOL', name: 'Solana' },
    { marketType: MarketType.crypto, ticker: 'ADA', name: 'Cardano' },
    { marketType: MarketType.crypto, ticker: 'DOT', name: 'Polkadot' },
    { marketType: MarketType.crypto, ticker: 'AVAX', name: 'Avalanche' },
    { marketType: MarketType.crypto, ticker: 'MATIC', name: 'Polygon' },
    { marketType: MarketType.crypto, ticker: 'LINK', name: 'Chainlink' },
  ],
  [MarketType.stocks]: [
    { marketType: MarketType.stocks, ticker: 'AAPL', name: 'Apple Inc.' },
    { marketType: MarketType.stocks, ticker: 'MSFT', name: 'Microsoft Corporation' },
    { marketType: MarketType.stocks, ticker: 'GOOGL', name: 'Alphabet Inc.' },
    { marketType: MarketType.stocks, ticker: 'AMZN', name: 'Amazon.com Inc.' },
    { marketType: MarketType.stocks, ticker: 'TSLA', name: 'Tesla Inc.' },
    { marketType: MarketType.stocks, ticker: 'NVDA', name: 'NVIDIA Corporation' },
    { marketType: MarketType.stocks, ticker: 'META', name: 'Meta Platforms Inc.' },
    { marketType: MarketType.stocks, ticker: 'NFLX', name: 'Netflix Inc.' },
  ],
  [MarketType.commodities]: [
    { marketType: MarketType.commodities, ticker: 'GOLD', name: 'Gold' },
    { marketType: MarketType.commodities, ticker: 'SILVER', name: 'Silver' },
    { marketType: MarketType.commodities, ticker: 'OIL', name: 'Crude Oil' },
    { marketType: MarketType.commodities, ticker: 'NATGAS', name: 'Natural Gas' },
    { marketType: MarketType.commodities, ticker: 'COPPER', name: 'Copper' },
    { marketType: MarketType.commodities, ticker: 'PLATINUM', name: 'Platinum' },
  ],
  [MarketType.fiat]: [
    { marketType: MarketType.fiat, ticker: 'USD', name: 'US Dollar' },
    { marketType: MarketType.fiat, ticker: 'EUR', name: 'Euro' },
    { marketType: MarketType.fiat, ticker: 'GBP', name: 'British Pound' },
    { marketType: MarketType.fiat, ticker: 'JPY', name: 'Japanese Yen' },
    { marketType: MarketType.fiat, ticker: 'CHF', name: 'Swiss Franc' },
    { marketType: MarketType.fiat, ticker: 'CAD', name: 'Canadian Dollar' },
    { marketType: MarketType.fiat, ticker: 'AUD', name: 'Australian Dollar' },
  ],
};
