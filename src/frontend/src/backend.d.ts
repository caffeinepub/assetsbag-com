import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface FiatVPS1ValidationResult {
    validationStatus: Variant_valid_invalid;
    rawResponseBody: string;
    isTruncated: boolean;
    errorMessage?: string;
    requestedUrl: string;
    timestamp: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface StocksVPS1RawValidationResult {
    validationStatus: Variant_valid_invalid;
    rawResponseBody: string;
    isTruncated: boolean;
    errorMessage?: string;
    requestedUrl: string;
    timestamp: bigint;
}
export interface FiatAssetCacheEntry {
    expired: boolean;
    assets: Array<Asset>;
    timestamp: bigint;
}
export interface CommoditiesVPS1ValidationResult {
    validationStatus: Variant_valid_invalid;
    rawResponseBody: string;
    isTruncated: boolean;
    errorMessage?: string;
    requestedUrl: string;
    timestamp: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface StocksVPS1ValidationResult {
    validationStatus: Variant_valid_invalid;
    rawResponseBody: string;
    isTruncated: boolean;
    errorMessage?: string;
    requestedUrl: string;
    timestamp: bigint;
}
export interface Asset {
    marketType: MarketType;
    ticker: string;
    name: string;
}
export interface UserProfile {
    name: string;
}
export type HTTPSUrl = string;
export enum MarketType {
    stocks = "stocks",
    commodities = "commodities",
    fiat = "fiat",
    crypto = "crypto"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_valid_invalid {
    valid = "valid",
    invalid = "invalid"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cacheFiatVPS1Data(cacheId: string, assets: Array<Asset>): Promise<boolean>;
    expireFiatAssetCacheEntries(cacheIds: Array<string>): Promise<bigint>;
    fetchCommoditiesData(url: HTTPSUrl): Promise<string>;
    fetchCommoditiesVPS1Data(): Promise<string>;
    fetchCryptoData(url: HTTPSUrl): Promise<string>;
    fetchExternalData(_url: string): Promise<string>;
    fetchFiatData(url: HTTPSUrl): Promise<string>;
    fetchFiatVPS1Data(): Promise<string>;
    fetchStocksData(url: HTTPSUrl): Promise<string>;
    fetchStocksVPS1Chunk(endpointNumber: bigint, chunkIndex: bigint): Promise<void>;
    fetchStocksVPS1Raw(endpointNumber: bigint): Promise<void>;
    getAllStocksValidationResults(): Promise<Array<[string, StocksVPS1ValidationResult]>>;
    getCachedFiatAssets(cacheId: string): Promise<FiatAssetCacheEntry | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommoditiesVPS1ValidationResult(): Promise<CommoditiesVPS1ValidationResult | null>;
    getFiatCacheMetaData(): Promise<Array<[string, bigint, boolean]>>;
    getFiatVPS1ValidationResult(): Promise<FiatVPS1ValidationResult | null>;
    getStocksVPS1RawValidationResult(): Promise<StocksVPS1RawValidationResult | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
