import type { Principal } from "@icp-sdk/core/principal";

export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}

export enum MarketType {
    crypto = "crypto",
    stocks = "stocks",
    commodities = "commodities",
    fiat = "fiat"
}

export interface Asset {
    marketType: MarketType;
    ticker: string;
    name: string;
}

export interface Holding {
    asset: Asset;
    amount: number;
    purchasePrice: number;
}

export interface Portfolio {
    holdings: Array<Holding>;
}

export interface UserProfile {
    name: string;
}

export type HTTPSUrl = string;

export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}

export interface backendInterface {
    _initializeAccessControlWithSecret(adminToken: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    fetchCommoditiesData(url: HTTPSUrl): Promise<string>;
    fetchCryptoData(url: HTTPSUrl): Promise<string>;
    fetchExternalData(_url: string): Promise<string>;
    fetchFiatData(url: HTTPSUrl): Promise<string>;
    fetchStocksData(url: HTTPSUrl): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    addHolding(holding: Holding): Promise<void>;
    getPortfolio(): Promise<Portfolio>;
}
