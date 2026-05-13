import {
  type Bet,
  BetStatus,
  DrawLetter,
  type DrawResult,
  DrawType,
  type MobileUser,
} from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAdjustBalance,
  useAllBets,
  useAllMobileUsers,
  useAutoSettle,
  useEnterResult,
  useSettleBet,
} from "../hooks/useQueries";

type Tab = "players" | "results" | "bets";
type BetFilter = "all" | BetStatus;

// ── helpers ─────────────────────────────────────────────────────────────────
function fmtDate(ns: bigint) {
  return new Date(Number(ns / 1_000_000n)).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function drawLabel(d: DrawType) {
  if (d === DrawType.twoD) return "2D";
  if (d === DrawType.threeD) return "3D";
  return "4D";
}
function betTypeLabel(b: string) {
  return b.toUpperCase();
}

// ── sub-components ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BetStatus }) {
  const map: Record<BetStatus, string> = {
    [BetStatus.pending]: "bg-warning/20 text-warning border-warning/40",
    [BetStatus.won]: "bg-success/20 text-success border-success/40",
    [BetStatus.lost]:
      "bg-destructive/20 text-destructive border-destructive/40",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

// ── PlayerRow ────────────────────────────────────────────────────────────────
function PlayerRow({
  user,
  idx,
}: {
  user: MobileUser;
  idx: number;
}) {
  const { mutate: adjustBalance, isPending } = useAdjustBalance();
  const [action, setAction] = useState<"add" | "deduct" | null>(null);
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    const n = Number.parseInt(amount, 10);
    if (Number.isNaN(n) || n <= 0) {
      toast.error("Valid amount daalo");
      return;
    }
    const delta = action === "add" ? BigInt(n) : BigInt(-n);
    adjustBalance(
      { mobileNumber: user.mobileNumber, delta },
      {
        onSuccess: () => {
          toast.success(
            action === "add"
              ? `+${n} balance add hua`
              : `-${n} balance deduct hua`,
          );
          setAction(null);
          setAmount("");
        },
        onError: (e) => {
          toast.error(e instanceof Error ? e.message : "Error hua");
        },
      },
    );
  };

  return (
    <div
      data-ocid={`lottery.player.item.${idx}`}
      className="glass-card rounded-xl p-3 space-y-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground">
            {user.mobileNumber}
          </p>
          <p className="text-xs text-muted-foreground">
            {fmtDate(user.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono text-sm text-primary font-bold">
            {user.balance.toString()} pts
          </span>
          <Button
            data-ocid={`lottery.player.add_button.${idx}`}
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs border-success/40 text-success hover:bg-success/10"
            onClick={() => setAction(action === "add" ? null : "add")}
          >
            <ChevronUp className="w-3 h-3 mr-1" /> Add
          </Button>
          <Button
            data-ocid={`lottery.player.delete_button.${idx}`}
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => setAction(action === "deduct" ? null : "deduct")}
          >
            <ChevronDown className="w-3 h-3 mr-1" /> Deduct
          </Button>
        </div>
      </div>

      {action && (
        <div className="flex gap-2 items-center pt-1">
          <Input
            data-ocid={`lottery.player.input.${idx}`}
            type="number"
            min="1"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-8 text-sm bg-secondary/50 border-border"
          />
          <Button
            data-ocid={`lottery.player.confirm_button.${idx}`}
            size="sm"
            className="h-8 px-3"
            disabled={isPending}
            onClick={handleSubmit}
            type="button"
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
          <Button
            data-ocid={`lottery.player.cancel_button.${idx}`}
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-muted-foreground"
            onClick={() => {
              setAction(null);
              setAmount("");
            }}
            type="button"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

// ── PlayersTab ───────────────────────────────────────────────────────────────
function PlayersTab() {
  const {
    data: users = [],
    isLoading,
    refetch,
    isFetching,
  } = useAllMobileUsers();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} players registered
        </p>
        <Button
          data-ocid="lottery.players.refresh_button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground"
          onClick={() => refetch()}
          disabled={isFetching}
          type="button"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {isLoading ? (
        <div
          data-ocid="lottery.players.loading_state"
          className="flex justify-center py-12"
        >
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div
          data-ocid="lottery.players.empty_state"
          className="glass-card rounded-2xl p-10 text-center"
        >
          <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Koi player nahi mila</p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="lottery.players.list">
          {users.map((u, i) => (
            <PlayerRow key={u.mobileNumber} user={u} idx={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── ResultsTab ───────────────────────────────────────────────────────────────
const DRAW_DIGITS: Record<DrawType, number> = {
  [DrawType.twoD]: 2,
  [DrawType.threeD]: 3,
  [DrawType.fourD]: 4,
};

function ResultsTab() {
  const [drawType, setDrawType] = useState<DrawType>(DrawType.twoD);
  const [drawLetter, setDrawLetter] = useState<DrawLetter>(DrawLetter.A);
  const [winNum, setWinNum] = useState("");
  const [lastResult, setLastResult] = useState<DrawResult | null>(null);

  const { mutate: enterResult, isPending: entering } = useEnterResult();
  const { mutate: autoSettle, isPending: settling } = useAutoSettle();

  const expectedDigits = DRAW_DIGITS[drawType];
  const isValidNum = /^\d+$/.test(winNum) && winNum.length === expectedDigits;

  const handleEnter = () => {
    if (!isValidNum) {
      toast.error(`${expectedDigits} digit number daalo`);
      return;
    }
    enterResult(
      { drawType, drawLetter, winningNumber: winNum },
      {
        onSuccess: (result) => {
          toast.success(`Result enter hua: ${winNum}`);
          setLastResult(result);
          setWinNum("");
        },
        onError: (e) => {
          toast.error(e instanceof Error ? e.message : "Error hua");
        },
      },
    );
  };

  const handleAutoSettle = () => {
    if (!lastResult) return;
    autoSettle(
      { drawType: lastResult.drawType, drawLetter: lastResult.drawLetter },
      {
        onSuccess: (count) => {
          toast.success(`${count.toString()} bets settle hui`);
          setLastResult(null);
        },
        onError: (e) => {
          toast.error(e instanceof Error ? e.message : "Error hua");
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      {/* Form */}
      <div className="glass-card rounded-2xl p-4 space-y-4">
        <p className="text-sm font-semibold text-foreground">
          Draw Result Enter Karo
        </p>

        {/* Draw Type */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Draw Type</p>
          <div className="flex gap-2">
            {(
              [
                [DrawType.twoD, "2D"],
                [DrawType.threeD, "3D"],
                [DrawType.fourD, "4D"],
              ] as [DrawType, string][]
            ).map(([dt, label]) => (
              <button
                key={dt}
                type="button"
                data-ocid={`lottery.result.drawtype.${label.toLowerCase()}`}
                onClick={() => {
                  setDrawType(dt);
                  setWinNum("");
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  drawType === dt
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Draw Letter */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Draw Letter</p>
          <div className="flex gap-2">
            {([DrawLetter.A, DrawLetter.B, DrawLetter.C] as DrawLetter[]).map(
              (dl) => (
                <button
                  key={dl}
                  type="button"
                  data-ocid={`lottery.result.drawletter.${dl.toLowerCase()}`}
                  onClick={() => setDrawLetter(dl)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    drawLetter === dl
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {dl}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Winning Number */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Winning Number ({expectedDigits} digits)
          </p>
          <Input
            data-ocid="lottery.result.number_input"
            type="text"
            inputMode="numeric"
            maxLength={expectedDigits}
            placeholder={"0".repeat(expectedDigits)}
            value={winNum}
            onChange={(e) => setWinNum(e.target.value.replace(/\D/g, ""))}
            className={`bg-secondary/50 border-border font-mono text-lg tracking-widest ${
              winNum && !isValidNum ? "border-destructive" : ""
            }`}
          />
          {winNum && !isValidNum && (
            <p className="text-xs text-destructive mt-1">
              Exactly {expectedDigits} digits chahiye
            </p>
          )}
        </div>

        <Button
          data-ocid="lottery.result.submit_button"
          className="w-full"
          disabled={!isValidNum || entering}
          onClick={handleEnter}
          type="button"
        >
          {entering ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Trophy className="w-4 h-4 mr-2" />
          )}
          Result Enter Karo
        </Button>
      </div>

      {/* Auto-settle banner */}
      {lastResult && (
        <div className="glass-card rounded-xl p-4 border-success/30 bg-success/5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-success flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Result saved!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {drawLabel(lastResult.drawType)} {lastResult.drawLetter} →{" "}
              <span className="font-mono text-foreground">
                {lastResult.winningNumber}
              </span>
            </p>
          </div>
          <Button
            data-ocid="lottery.result.autosettle_button"
            size="sm"
            variant="outline"
            className="border-success/40 text-success hover:bg-success/10 flex-shrink-0"
            disabled={settling}
            onClick={handleAutoSettle}
            type="button"
          >
            {settling ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Zap className="w-3 h-3 mr-1" />
            )}
            Auto-Settle
          </Button>
        </div>
      )}
    </div>
  );
}

// ── BetsTab ──────────────────────────────────────────────────────────────────
function BetsTab() {
  const { data: bets = [], isLoading, refetch, isFetching } = useAllBets();
  const { mutate: settleBet, isPending: settling } = useSettleBet();
  const [filter, setFilter] = useState<BetFilter>("all");
  const [settleModal, setSettleModal] = useState<Bet | null>(null);

  const filtered =
    filter === "all" ? bets : bets.filter((b) => b.status === filter);

  const pendingCount = bets.filter(
    (b) => b.status === BetStatus.pending,
  ).length;
  const wonCount = bets.filter((b) => b.status === BetStatus.won).length;
  const lostCount = bets.filter((b) => b.status === BetStatus.lost).length;

  const handleSettle = (status: BetStatus) => {
    if (!settleModal) return;
    settleBet(
      { betId: settleModal.id, status },
      {
        onSuccess: () => {
          toast.success(
            `Bet ${status === BetStatus.won ? "won" : "lost"} mark hua`,
          );
          setSettleModal(null);
        },
        onError: (e) => {
          toast.error(e instanceof Error ? e.message : "Error hua");
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Pending", value: pendingCount, color: "text-warning" },
          { label: "Won", value: wonCount, color: "text-success" },
          { label: "Lost", value: lostCount, color: "text-destructive" },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card rounded-xl p-2.5 text-center"
          >
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            "all",
            BetStatus.pending,
            BetStatus.won,
            BetStatus.lost,
          ] as BetFilter[]
        ).map((f) => (
          <button
            key={f}
            type="button"
            data-ocid={`lottery.bets.filter.${f}`}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filter === f
                ? "bg-primary/20 border-primary text-primary"
                : "bg-secondary/30 border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {f === "all" ? "All" : f.toUpperCase()}
          </button>
        ))}
        <Button
          data-ocid="lottery.bets.refresh_button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground ml-auto"
          onClick={() => refetch()}
          disabled={isFetching}
          type="button"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {isLoading ? (
        <div
          data-ocid="lottery.bets.loading_state"
          className="flex justify-center py-10"
        >
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="lottery.bets.empty_state"
          className="glass-card rounded-2xl p-8 text-center"
        >
          <p className="text-muted-foreground text-sm">Koi bet nahi mili</p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="lottery.bets.list">
          {filtered.map((bet, i) => (
            <div
              key={bet.id}
              data-ocid={`lottery.bets.item.${i + 1}`}
              className="glass-card rounded-xl p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{bet.id.slice(-6)}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs py-0 border-primary/30 text-primary"
                    >
                      {drawLabel(bet.drawType)} {bet.drawLetter}
                    </Badge>
                    <Badge variant="outline" className="text-xs py-0">
                      {betTypeLabel(bet.betType)}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    <span className="font-mono">{bet.number}</span>{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      — {bet.mobileNumber}
                    </span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <StatusBadge status={bet.status} />
                  <p className="text-xs text-muted-foreground">
                    {bet.rate.toString()} →{" "}
                    <span className="text-primary font-semibold">
                      {bet.potentialWin.toString()}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {fmtDate(bet.placedAt)}
                </span>
                {bet.status === BetStatus.pending && (
                  <Button
                    data-ocid={`lottery.bets.edit_button.${i + 1}`}
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => setSettleModal(bet)}
                    type="button"
                  >
                    Settle
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settle modal */}
      <Dialog
        open={!!settleModal}
        onOpenChange={(o) => !o && setSettleModal(null)}
      >
        <DialogContent data-ocid="lottery.bets.dialog">
          <DialogHeader>
            <DialogTitle>Bet Settle Karo</DialogTitle>
          </DialogHeader>
          {settleModal && (
            <div className="space-y-4">
              <div className="glass-card rounded-xl p-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Number:</span>{" "}
                  <span className="font-mono font-bold">
                    {settleModal.number}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Mobile:</span>{" "}
                  {settleModal.mobileNumber}
                </p>
                <p>
                  <span className="text-muted-foreground">Rate:</span>{" "}
                  {settleModal.rate.toString()} →{" "}
                  <span className="text-primary">
                    {settleModal.potentialWin.toString()} pts
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  data-ocid="lottery.bets.confirm_button"
                  className="flex-1 bg-success/20 text-success border border-success/40 hover:bg-success/30"
                  variant="outline"
                  disabled={settling}
                  onClick={() => handleSettle(BetStatus.won)}
                  type="button"
                >
                  {settling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "✓ Won"
                  )}
                </Button>
                <Button
                  data-ocid="lottery.bets.cancel_button"
                  className="flex-1"
                  variant="destructive"
                  disabled={settling}
                  onClick={() => handleSettle(BetStatus.lost)}
                  type="button"
                >
                  {settling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "✗ Lost"
                  )}
                </Button>
              </div>
              <Button
                data-ocid="lottery.bets.close_button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setSettleModal(null)}
                type="button"
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LotteryAdminPage({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("players");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "players",
      label: "Players & Balance",
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: "results",
      label: "Enter Results",
      icon: <Trophy className="w-4 h-4" />,
    },
    { id: "bets", label: "All Bets", icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 glass-card border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          {onBack && (
            <Button
              data-ocid="lottery.back_button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
              onClick={onBack}
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <span
              className="font-bold text-foreground truncate"
              style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
            >
              Lottery Admin
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[57px] z-10 bg-background border-b border-border/50">
        <div className="flex max-w-2xl mx-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              data-ocid={`lottery.tab.${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">
        {tab === "players" && <PlayersTab />}
        {tab === "results" && <ResultsTab />}
        {tab === "bets" && <BetsTab />}
      </main>

      <footer className="px-4 py-4 text-center text-xs text-muted-foreground border-t border-border/30">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
