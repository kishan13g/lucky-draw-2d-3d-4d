import {
  type Bet,
  type BetStatus,
  type DrawLetter,
  type DrawResult,
  type DrawType,
  type MobileUser,
  createActor,
} from "@/backend";
import type { UserProfile, UserRole } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Lottery Admin Hooks ──────────────────────────────────────────

export function useAllMobileUsers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MobileUser[]>({
    queryKey: ["allMobileUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllMobileUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdjustBalance() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      mobileNumber,
      delta,
    }: { mobileNumber: string; delta: bigint }) => {
      if (!actor) throw new Error("No actor");
      const res = await actor.adminAdjustBalance(mobileNumber, delta);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allMobileUsers"] });
    },
  });
}

export function useSetBalance() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      mobileNumber,
      newBalance,
    }: { mobileNumber: string; newBalance: bigint }) => {
      if (!actor) throw new Error("No actor");
      const res = await actor.adminSetBalance(mobileNumber, newBalance);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allMobileUsers"] });
    },
  });
}

export function useEnterResult() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      drawType,
      drawLetter,
      winningNumber,
    }: {
      drawType: DrawType;
      drawLetter: DrawLetter;
      winningNumber: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const res = await actor.adminEnterResult(
        drawType,
        drawLetter,
        winningNumber,
      );
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok as DrawResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allBets"] });
    },
  });
}

export function useAutoSettle() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      drawType,
      drawLetter,
    }: { drawType: DrawType; drawLetter: DrawLetter }) => {
      if (!actor) throw new Error("No actor");
      const res = await actor.adminAutoSettleDraw(drawType, drawLetter);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok as bigint;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allBets"] });
    },
  });
}

export function useAllBets() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Bet[]>({
    queryKey: ["allBets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllBets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSettleBet() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      betId,
      status,
    }: { betId: string; status: BetStatus }) => {
      if (!actor) throw new Error("No actor");
      const res = await actor.adminSettleBet(betId, status);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allBets"] });
    },
  });
}

// ── ControlHub Hooks ──────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useBlockUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("No actor");
      return actor.blockUser(principal);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useUnblockUser() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("No actor");
      return actor.unblockUser(principal);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignRole(user, role);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}
