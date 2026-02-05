import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface Holding {
    purchasePrice: number;
    asset: Asset;
    amount: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Asset {
    marketType: MarketType;
    ticker: string;
    name: string;
}
export interface Portfolio {
    holdings: Array<Holding>;
}
export interface UserProfile {
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
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
export interface backendInterface {
    addHolding(holding: Holding): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    fetchExternalData(url: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPortfolio(): Promise<Portfolio>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchAssets(searchTerm: string, marketType: MarketType): Promise<Array<Asset>>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
