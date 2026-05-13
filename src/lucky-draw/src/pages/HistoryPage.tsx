import { useAuth } from "@/hooks/useAuth";
import { useMyBets } from "@/hooks/useBackend";
import { BetStatus, DrawType } from "@/types";

const STATUS_STYLE: Record<BetStatus, string> = {
  [BetStatus.pending]: "bg-ld-orange/20 text-ld-orange border border-ld-orange",
  [BetStatus.won]: "bg-ld-green/20 text-ld-green border border-ld-green",
  [BetStatus.lost]: "bg-ld-red/20 text-ld-red border border-ld-red",
};

const DRAW_LABEL: Record<DrawType, string> = {
  [DrawType.twoD]: "2D",
  [DrawType.threeD]: "3D",
  [DrawType.fourD]: "4D",
};

export default function HistoryPage() {
  const { auth } = useAuth();
  const { data: rawBets = [], isLoading } = useMyBets(
    auth?.mobileNumber ?? "",
    auth?.deviceToken ?? ""
  );

  // Sort newest first
  const bets = [...rawBets].sort((a, b) => Number(b.placedAt) - Number(a.placedAt));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" data-ocid="history.loading_state">
        <div className="text-center">
          <div className="font-orbitron text-ld-cyan text-sm animate-pulse-slow">⏳ LOADING...</div>
          <div className="text-xs text-ld-muted mt-2">Bets load ho rahi hain...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3" data-ocid="history.panel">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-orbitron text-xs text-ld-gold uppercase tracking-widest">
          📋 Bet History
        </h2>
        <span className="font-orbitron text-[10px] text-ld-muted">{bets.length} bets</span>
      </div>

      {bets.length === 0 ? (
        <div
          className="text-center py-12 border border-ld-border rounded-xl"
          style={{ background: "rgba(255,255,255,0.02)" }}
          data-ocid="history.empty_state"
        >
          <div className="text-4xl mb-3">🎰</div>
          <p className="font-orbitron text-xs text-ld-muted">Abhi koi bet nahi</p>
          <p className="text-xs text-ld-border mt-1">Game tab se pehli bet lagao!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ld-border">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ background: "linear-gradient(135deg, #1a1a40, #2a2060)" }}>
                <th className="px-2 py-2.5 text-left font-orbitron text-[9px] text-ld-gold">TIME</th>
                <th className="px-2 py-2.5 text-left font-orbitron text-[9px] text-ld-gold">NUM</th>
                <th className="px-2 py-2.5 text-left font-orbitron text-[9px] text-ld-gold">TYPE</th>
                <th className="px-2 py-2.5 text-left font-orbitron text-[9px] text-ld-gold">DRAW</th>
                <th className="px-2 py-2.5 text-left font-orbitron text-[9px] text-ld-gold">BET</th>
                <th className="px-2 py-2.5 text-right font-orbitron text-[9px] text-ld-gold">RATE</th>
                <th className="px-2 py-2.5 text-right font-orbitron text-[9px] text-ld-gold">WIN</th>
                <th className="px-2 py-2.5 text-center font-orbitron text-[9px] text-ld-gold">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet, idx) => {
                const ts = new Date(Number(bet.placedAt) / 1_000_000);
                const timeStr = ts.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                const dateStr = ts.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit" });
                return (
                  <tr
                    key={bet.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                    data-ocid={`history.item.${idx + 1}`}
                  >
                    <td className="px-2 py-2 text-ld-border text-[9px]">
                      <div>{dateStr}</div>
                      <div>{timeStr}</div>
                    </td>
                    <td className="px-2 py-2 font-orbitron text-ld-cyan">{bet.number}</td>
                    <td className="px-2 py-2 font-orbitron text-[9px] text-ld-text">
                      {DRAW_LABEL[bet.drawType]}
                    </td>
                    <td className="px-2 py-2 text-ld-muted text-[9px]">{bet.drawLetter}</td>
                    <td className="px-2 py-2 font-orbitron text-[9px] text-ld-orange">
                      {bet.betType.toUpperCase()}
                    </td>
                    <td className="px-2 py-2 text-right font-orbitron text-ld-text">
                      {bet.rate.toString()}
                    </td>
                    <td className="px-2 py-2 text-right font-orbitron text-ld-green">
                      {bet.potentialWin.toString()}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-orbitron font-bold ${
                          STATUS_STYLE[bet.status]
                        }`}
                        data-ocid={`history.status.${idx + 1}`}
                      >
                        {bet.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary footer */}
      {bets.length > 0 && (
        <div className="mt-3 flex gap-3 flex-wrap">
          {(["pending", "won", "lost"] as const).map((s) => {
            const count = bets.filter((b) => b.status === s).length;
            return (
              <div
                key={s}
                className={`rounded-lg px-3 py-1.5 text-center ${
                  s === "pending"
                    ? "bg-ld-orange/10 border border-ld-orange/30"
                    : s === "won"
                    ? "bg-ld-green/10 border border-ld-green/30"
                    : "bg-ld-red/10 border border-ld-red/30"
                }`}
              >
                <div
                  className={`font-orbitron text-sm font-bold ${
                    s === "pending" ? "text-ld-orange" : s === "won" ? "text-ld-green" : "text-ld-red"
                  }`}
                >
                  {count}
                </div>
                <div className="font-orbitron text-[9px] text-ld-muted uppercase">{s}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
