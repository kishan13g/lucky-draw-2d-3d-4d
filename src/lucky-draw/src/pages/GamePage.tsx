import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlaceBet } from "@/hooks/useBackend";
import { BetType, DrawLetter, DrawType, PAYOUT } from "@/types";
import type { BetSlipItem } from "@/types";
import NumberGrid2D from "@/components/NumberGrid2D";
import NumberGrid3D from "@/components/NumberGrid3D";
import NumberGrid4D from "@/components/NumberGrid4D";
import BetSlip from "@/components/BetSlip";

type Filter3D = "single" | "duplicates" | "triples" | "all";
const RATES = [10, 20, 30, 50, 100, 200];

const BET_TYPE_META: Record<BetType, { label: string; desc: string; example: string }> = {
  [BetType.straight]: { label: "STRAIGHT", desc: "Exact match", example: "123=123" },
  [BetType.box]: { label: "BOX", desc: "Any order", example: "123→321✓" },
  [BetType.sp]: { label: "SP", desc: "Straight+Box", example: "S+B combined" },
  [BetType.dp]: { label: "DP", desc: "Double play", example: "2× payout" },
};

const FILTER_LABELS: Filter3D[] = ["single", "duplicates", "triples", "all"];

interface Props {
  drawType: DrawType;
  drawLetter: DrawLetter;
}

export default function GamePage({ drawType, drawLetter }: Props) {
  const { auth } = useAuth();
  const placeBet = usePlaceBet();

  const [selectedBetType, setSelectedBetType] = useState<BetType>(BetType.straight);
  const [selectedRate, setSelectedRate] = useState(10);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [manualNumber, setManualNumber] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter3d, setFilter3d] = useState<Filter3D>("all");
  const [placing, setPlacing] = useState(false);

  const maxDigits = drawType === DrawType.twoD ? 2 : drawType === DrawType.threeD ? 3 : 4;
  const maxNum = 10 ** maxDigits;
  const payout = PAYOUT[drawType][selectedBetType];

  const slip: BetSlipItem[] = Array.from(selected).map((num) => ({
    number: num,
    rate: selectedRate,
    betType: selectedBetType,
    drawType,
    drawLetter,
    potentialWin: selectedRate * payout,
  }));

  const toggleNum = useCallback((num: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }, []);

  const handleManualAdd = () => {
    const n = manualNumber.trim().padStart(maxDigits, "0");
    if (n.length !== maxDigits || !/^\d+$/.test(n)) {
      toast.error("Valid number daalo");
      return;
    }
    setSelected((prev) => new Set(prev).add(n));
    setManualNumber("");
  };

  const handleRangeAdd = () => {
    const from = Number(rangeFrom);
    const to = Number(rangeTo);
    if (isNaN(from) || isNaN(to) || from > to || to >= maxNum) {
      toast.error("Valid range daalo");
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      for (let i = from; i <= to; i++) next.add(String(i).padStart(maxDigits, "0"));
      return next;
    });
    setRangeFrom("");
    setRangeTo("");
  };

  const handleLucky = () => {
    const picks = new Set<string>();
    while (picks.size < 5) picks.add(String(Math.floor(Math.random() * maxNum)).padStart(maxDigits, "0"));
    setSelected((prev) => new Set([...prev, ...picks]));
    toast.success("5 lucky numbers add ho gaye!");
  };

  const handleMotor = () => {
    const all = Array.from({ length: maxNum }, (_, i) => String(i).padStart(maxDigits, "0"));
    setSelected(new Set(all));
    toast.success(`${maxNum} numbers select ho gaye!`);
  };

  const handlePlaceBets = async () => {
    if (!auth || slip.length === 0) return;
    setPlacing(true);
    let success = 0;
    for (const item of slip) {
      try {
        await placeBet.mutateAsync({
          mobileNumber: auth.mobileNumber,
          deviceToken: auth.deviceToken,
          drawType: item.drawType,
          drawLetter: item.drawLetter,
          betType: item.betType,
          number: item.number,
          rate: BigInt(item.rate),
        });
        success++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Bet fail";
        toast.error(`${item.number}: ${msg}`);
      }
    }
    if (success > 0) {
      toast.success(`✅ ${success} bet${success > 1 ? "s" : ""} place ho gai!`);
      setSelected(new Set());
    }
    setPlacing(false);
  };

  return (
    <div className="px-3 py-3 space-y-4" data-ocid="game.panel">
      {/* Bet Type Cards */}
      {drawType !== DrawType.twoD && (
        <div>
          <p className="text-[10px] text-ld-border uppercase tracking-widest mb-2">Bet Type</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(BET_TYPE_META) as BetType[]).map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => setSelectedBetType(bt)}
                className={`rounded-xl border-2 p-2.5 text-left transition-all ${
                  selectedBetType === bt
                    ? "border-ld-gold bg-ld-gold/10 glow-gold"
                    : "border-ld-border bg-ld-card hover:border-ld-cyan"
                }`}
                data-ocid={`game.bet_type.${bt}`}
              >
                <div className="font-orbitron text-[10px] text-ld-gold">{BET_TYPE_META[bt].label}</div>
                <div className="text-[10px] text-ld-muted mt-0.5">{BET_TYPE_META[bt].desc}</div>
                <div className="font-mono-game text-[9px] text-ld-cyan mt-0.5">{BET_TYPE_META[bt].example}</div>
                <div className="font-orbitron text-xs text-ld-green font-bold mt-1">
                  ×{PAYOUT[drawType][bt]}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2D payout info */}
      {drawType === DrawType.twoD && (
        <div className="rounded-xl border border-ld-gold/20 bg-ld-gold/5 px-3 py-2 text-center">
          <span className="font-orbitron text-[10px] text-ld-muted">Number choose karo (00–99) · Draw se </span>
          <span className="font-orbitron text-sm text-ld-gold font-bold">EXACT MATCH</span>
          <span className="font-orbitron text-[10px] text-ld-muted"> → Jeet! Payout: </span>
          <span className="font-orbitron text-sm text-ld-green font-bold">×{payout}</span>
        </div>
      )}

      {/* 3D filter */}
      {drawType === DrawType.threeD && (
        <div>
          <p className="text-[10px] text-ld-border uppercase tracking-widest mb-2">Filter</p>
          <div className="flex gap-2 flex-wrap">
            {FILTER_LABELS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter3d(f)}
                className={`px-3 py-1 rounded-full border-2 font-orbitron text-[10px] transition-all ${
                  filter3d === f
                    ? "border-ld-cyan bg-ld-cyan/10 text-ld-cyan"
                    : "border-ld-border text-ld-muted hover:border-ld-muted"
                }`}
                data-ocid={`game.filter3d.${f}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rate */}
      <div>
        <p className="text-[10px] text-ld-border uppercase tracking-widest mb-2">Rate</p>
        <div className="flex flex-wrap gap-2">
          {RATES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRate(r)}
              className={`px-3 py-1.5 rounded-full border-2 font-orbitron text-xs transition-all ${
                selectedRate === r
                  ? "border-ld-orange bg-ld-orange text-black font-bold"
                  : "border-ld-border text-ld-text hover:border-ld-orange"
              }`}
              data-ocid={`game.rate.${r}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Range input */}
      <div>
        <p className="text-[10px] text-ld-border uppercase tracking-widest mb-2">Range Add</p>
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-[10px] text-ld-muted">From</span>
          <input
            type="number"
            min={0}
            max={maxNum - 1}
            placeholder={"0".repeat(maxDigits)}
            value={rangeFrom}
            onChange={(e) => setRangeFrom(e.target.value)}
            className="w-20 px-2 py-1.5 rounded-lg border-2 border-ld-border bg-white/[0.06] text-ld-text font-orbitron text-xs text-center outline-none focus:border-ld-cyan transition-colors"
            data-ocid="game.range_from_input"
          />
          <span className="text-[10px] text-ld-muted">To</span>
          <input
            type="number"
            min={0}
            max={maxNum - 1}
            placeholder={"9".repeat(maxDigits)}
            value={rangeTo}
            onChange={(e) => setRangeTo(e.target.value)}
            className="w-20 px-2 py-1.5 rounded-lg border-2 border-ld-border bg-white/[0.06] text-ld-text font-orbitron text-xs text-center outline-none focus:border-ld-cyan transition-colors"
            data-ocid="game.range_to_input"
          />
          <button
            type="button"
            onClick={handleRangeAdd}
            className="px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold text-black transition-all hover:opacity-90"
            style={{ background: "#00d4ff" }}
            data-ocid="game.range_add_button"
          >
            ADD
          </button>
        </div>
      </div>

      {/* Single Manual input */}
      <div>
        <p className="text-[10px] text-ld-border uppercase tracking-widest mb-2">Single Number</p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={0}
            max={maxNum - 1}
            placeholder={"0".repeat(maxDigits)}
            value={manualNumber}
            onChange={(e) => setManualNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
            className="w-24 px-2 py-1.5 rounded-lg border-2 border-ld-border bg-white/[0.06] text-ld-text font-orbitron text-xs text-center outline-none focus:border-ld-cyan transition-colors"
            data-ocid="game.number_input"
          />
          <button
            type="button"
            onClick={handleManualAdd}
            className="px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold text-black transition-all hover:opacity-90"
            style={{ background: "#ff8c00" }}
            data-ocid="game.add_button"
          >
            + ADD
          </button>
        </div>
      </div>

      {/* Number grid */}
      <div>
        <p className="text-[10px] text-ld-border uppercase tracking-widest mb-2">
          {drawType === DrawType.twoD && "Number (00–99)"}
          {drawType === DrawType.threeD && "Number (000–999)"}
          {drawType === DrawType.fourD && "Number (0000–9999)"}
        </p>
        {drawType === DrawType.twoD && (
          <NumberGrid2D selected={selected} onToggle={toggleNum} />
        )}
        {drawType === DrawType.threeD && (
          <NumberGrid3D selected={selected} onToggle={toggleNum} filterMode={filter3d} />
        )}
        {drawType === DrawType.fourD && (
          <NumberGrid4D selected={selected} onToggle={toggleNum} />
        )}
      </div>

      {/* Bet Slip */}
      <div>
        <p className="text-[10px] text-ld-border uppercase tracking-widest mb-2">Bet Slip</p>
        <BetSlip
          bets={slip}
          onRemove={(idx) => {
            const num = slip[idx]?.number;
            if (num) setSelected((prev) => { const n = new Set(prev); n.delete(num); return n; });
          }}
          totalAmount={slip.reduce((s, i) => s + i.rate, 0)}
        />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleMotor}
          className="py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest text-white transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #cc2244, #660011)" }}
          data-ocid="game.motor_button"
        >
          ⚡ MOTOR
        </button>
        <button
          type="button"
          onClick={handleLucky}
          className="py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest text-black transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #00e87a, #007733)" }}
          data-ocid="game.lucky_button"
        >
          🎲 LUCKY
        </button>
        <button
          type="button"
          onClick={handlePlaceBets}
          disabled={placing || slip.length === 0}
          className="py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest text-black transition-all hover:-translate-y-0.5 disabled:opacity-50 col-span-1"
          style={{ background: "linear-gradient(135deg, #ffd700, #997700)" }}
          data-ocid="game.place_bet_button"
        >
          {placing ? "⏳ PLACING..." : `✅ BET (${slip.length})`}
        </button>
        <button
          type="button"
          onClick={() => setSelected(new Set())}
          className="py-3 rounded-xl font-orbitron text-xs font-bold text-ld-muted border border-ld-border hover:border-ld-red hover:text-ld-red transition-all"
          data-ocid="game.clear_button"
        >
          🗑 CLEAR
        </button>
      </div>
    </div>
  );
}
