/**
 * Frontend type definitions for AssetsBag application.
 * These types mirror the backend types but are defined locally
 * since the backend doesn't export them in the Candid interface.
 */

export enum MarketType {
  crypto = 'crypto',
  stocks = 'stocks',
  commodities = 'commodities',
  fiat = 'fiat',
}

export interface Asset {
  marketType: MarketType;
  ticker: string;
  name: string;
  // Optional fields for stocks and crypto
  marketCap?: number;
  lastPrice?: number;
  logoUrl?: string;
}

export interface Holding {
  asset: Asset;
  amount: number;
  purchasePrice: number;
}

export interface Portfolio {
  holdings: Holding[];
}
