// ── Mirrored from backend.d.ts ──────────────────────────────────────────────

export enum DrawType {
  twoD = "twoD",
  threeD = "threeD",
  fourD = "fourD",
}

export enum DrawLetter {
  A = "A",
  B = "B",
  C = "C",
}

export enum BetType {
  straight = "straight",
  box = "box",
  sp = "sp",
  dp = "dp",
}

export enum BetStatus {
  pending = "pending",
  won = "won",
  lost = "lost",
}

export interface MobileUser {
  deviceToken: string;
  balance: bigint;
  createdAt: bigint;
  mobileNumber: string;
}

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

export interface DrawResult {
  winningNumber: string;
  drawType: DrawType;
  drawLetter: DrawLetter;
  drawnAt: bigint;
  drawnBy: string;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export type AuthState = {
  mobileNumber: string;
  deviceToken: string;
} | null;

// ── Bet placement form state ─────────────────────────────────────────────────

export interface BetSlipItem {
  number: string;
  rate: number;
  betType: BetType;
  drawType: DrawType;
  drawLetter: DrawLetter;
  potentialWin: number;
}

export const PAYOUT: Record<DrawType, Record<BetType, number>> = {
  [DrawType.twoD]: {
    [BetType.straight]: 85,
    [BetType.box]: 40,
    [BetType.sp]: 42,
    [BetType.dp]: 170,
  },
  [DrawType.threeD]: {
    [BetType.straight]: 500,
    [BetType.box]: 83,
    [BetType.sp]: 250,
    [BetType.dp]: 100,
  },
  [DrawType.fourD]: {
    [BetType.straight]: 5000,
    [BetType.box]: 200,
    [BetType.sp]: 2500,
    [BetType.dp]: 800,
  },
};
