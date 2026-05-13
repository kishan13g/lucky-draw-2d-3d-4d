import type { BetSlipItem } from "@/types";
import { PAYOUT } from "@/types";

interface Props {
  bets: BetSlipItem[];
  onRemove: (idx: number) => void;
  totalAmount: number;
}

export default function BetSlip({ bets, onRemove, totalAmount }: Props) {
  return (
    <div>
      <div
        className="rounded-xl border border-ld-border bg-white/[0.02] min-h-[56px] max-h-36 overflow-y-auto p-2"
        data-ocid="bet_slip.container"
      >
        {bets.length === 0 ? (
          <p className="text-center text-[11px] text-ld-border py-2" data-ocid="bet_slip.empty_state">
            Koi number select nahi
          </p>
        ) : (
          bets.map((item, idx) => (
            <div
              key={`${item.number}-${item.betType}-${idx}`}
              className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0"
              data-ocid={`bet_slip.item.${idx + 1}`}
            >
              <span className="font-orbitron text-sm text-ld-cyan min-w-[32px]">{item.number}</span>
              <span className="font-orbitron text-[9px] text-ld-orange">{item.betType.toUpperCase()}</span>
              <span className="text-[9px] text-ld-green">×{PAYOUT[item.drawType][item.betType]}</span>
              <span className="font-orbitron text-[10px] text-ld-text">{item.rate} pts</span>
              <span className="text-[9px] text-ld-muted">→{item.potentialWin}</span>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="text-ld-red text-sm px-1 hover:opacity-70 transition-opacity"
                data-ocid={`bet_slip.remove.${idx + 1}`}
                aria-label={`Remove ${item.number}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
      {bets.length > 0 && (
        <div className="flex justify-between mt-1.5 pt-1.5 border-t border-ld-gold/20 font-orbitron text-xs text-ld-gold">
          <span>{bets.length} bet{bets.length !== 1 ? "s" : ""}</span>
          <span>Total: {totalAmount} pts</span>
        </div>
      )}
    </div>
  );
}
