import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bet, BetType, DrawLetter, DrawResult, DrawType, MobileUser } from "@/types";

// ── Auth ─────────────────────────────────────────────────────────────────────

export function useRegisterMobile() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      mobileNumber,
      deviceToken,
    }: {
      mobileNumber: string;
      deviceToken: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.registerMobileUser(mobileNumber, deviceToken);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok; // returns deviceToken string
    },
  });
}

export function useLoginMobile() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      mobileNumber,
      deviceToken,
    }: {
      mobileNumber: string;
      deviceToken: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.loginMobileUser(mobileNumber, deviceToken);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok as MobileUser;
    },
  });
}

// ── Bets ─────────────────────────────────────────────────────────────────────

export function usePlaceBet() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      mobileNumber: string;
      deviceToken: string;
      drawType: DrawType;
      drawLetter: DrawLetter;
      betType: BetType;
      number: string;
      rate: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.placeBet(
        params.mobileNumber,
        params.deviceToken,
        params.drawType,
        params.drawLetter,
        params.betType,
        params.number,
        params.rate,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok as Bet;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBets"] });
      qc.invalidateQueries({ queryKey: ["mobileUser"] });
    },
  });
}

export function useMyBets(mobileNumber: string, deviceToken: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Bet[]>({
    queryKey: ["myBets", mobileNumber],
    queryFn: async () => {
      if (!actor) return [];
      const bets = await actor.getMyBets(mobileNumber, deviceToken);
      return bets as Bet[];
    },
    enabled: !!actor && !isFetching && !!mobileNumber,
    refetchInterval: 2500,
  });
}

export function useLatestResults() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DrawResult[]>({
    queryKey: ["latestResults"],
    queryFn: async () => {
      if (!actor) return [];
      const results = await actor.getLatestResults();
      return results as DrawResult[];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 2500,
  });
}

export function useMobileUser(mobileNumber: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MobileUser | null>({
    queryKey: ["mobileUser", mobileNumber],
    queryFn: async () => {
      if (!actor) return null;
      const user = await actor.getMobileUser(mobileNumber);
      return (user ?? null) as MobileUser | null;
    },
    enabled: !!actor && !isFetching && !!mobileNumber,
    refetchInterval: 2500,
  });
}
