import { useLatestResults } from "@/hooks/useBackend";
import { DrawType } from "@/types";

const DRAW_LABEL: Record<DrawType, string> = {
  [DrawType.twoD]: "2D",
  [DrawType.threeD]: "3D",
  [DrawType.fourD]: "4D",
};

export default function ResultsBar() {
  const { data: results = [] } = useLatestResults();

  if (results.length === 0) return null;

  return (
    <div
      className="px-3.5 py-1.5 overflow-x-auto whitespace-nowrap border-b border-ld-border"
      style={{ background: "#060615" }}
      data-ocid="results_bar"
    >
      <div className="inline-flex items-center gap-2">
        <span className="font-orbitron text-[9px] text-ld-border mr-1">RESULTS:</span>
        {results.map((r, i) => (
          <div
            key={i}
            className="rounded-md px-2.5 py-1 text-center"
            style={{ background: "linear-gradient(135deg, #0a1030, #0a2040)" }}
            data-ocid={`results_bar.item.${i + 1}`}
          >
            <div
              className={`font-orbitron text-sm ${
                r.drawType === DrawType.twoD
                  ? "text-ld-cyan"
                  : r.drawType === DrawType.threeD
                  ? "text-ld-green"
                  : "text-ld-gold"
              }`}
            >
              {r.winningNumber}
            </div>
            <div className="text-[8px] text-ld-border">
              {DRAW_LABEL[r.drawType]}-{r.drawLetter}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
