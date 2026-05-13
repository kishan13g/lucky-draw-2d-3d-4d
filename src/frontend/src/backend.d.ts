import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Result_2 = {
    __kind__: "ok";
    ok: MobileUser;
} | {
    __kind__: "err";
    err: string;
};
export interface Bet {
    id: string;
    status: BetStatus;
    rate: bigint;
    betType: BetType;
    mobileNumber: string;
    drawType: DrawType;
    potentialWin: bigint;
    placedAt: bigint;
    number: string;
    drawLetter: DrawLetter;
}
export type Result_5 = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export type Result_1 = {
    __kind__: "ok";
    ok: Bet;
} | {
    __kind__: "err";
    err: string;
};
export type Result_4 = {
    __kind__: "ok";
    ok: DrawResult;
} | {
    __kind__: "err";
    err: string;
};
export interface DrawResult {
    winningNumber: string;
    drawType: DrawType;
    drawLetter: DrawLetter;
    drawnAt: bigint;
    drawnBy: string;
}
export type Result = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export type Result_3 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface MobileUser {
    deviceToken: string;
    balance: bigint;
    createdAt: bigint;
    mobileNumber: string;
}
export interface UserProfile {
    isBlocked: boolean;
    name: string;
}
export enum BetStatus {
    won = "won",
    pending = "pending",
    lost = "lost"
}
export enum BetType {
    dp = "dp",
    sp = "sp",
    box = "box",
    straight = "straight"
}
export enum DrawLetter {
    A = "A",
    B = "B",
    C = "C"
}
export enum DrawType {
    fourD = "fourD",
    twoD = "twoD",
    threeD = "threeD"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminAdjustBalance(mobileNumber: string, delta: bigint): Promise<Result_3>;
    adminAutoSettleDraw(drawType: DrawType, drawLetter: DrawLetter): Promise<Result_5>;
    adminEnterResult(drawType: DrawType, drawLetter: DrawLetter, winningNumber: string): Promise<Result_4>;
    adminGetAllBets(): Promise<Array<Bet>>;
    adminGetAllMobileUsers(): Promise<Array<MobileUser>>;
    adminSetBalance(mobileNumber: string, newBalance: bigint): Promise<Result_3>;
    adminSettleBet(betId: string, status: BetStatus): Promise<Result_3>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(user: Principal): Promise<void>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLatestResults(): Promise<Array<DrawResult>>;
    getMobileUser(mobileNumber: string): Promise<MobileUser | null>;
    getMyBets(mobileNumber: string, deviceToken: string): Promise<Array<Bet>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    loginMobileUser(mobileNumber: string, deviceToken: string): Promise<Result_2>;
    placeBet(mobileNumber: string, deviceToken: string, drawType: DrawType, drawLetter: DrawLetter, betType: BetType, number: string, rate: bigint): Promise<Result_1>;
    registerMobileUser(mobileNumber: string, deviceToken: string): Promise<Result>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unblockUser(user: Principal): Promise<void>;
}
