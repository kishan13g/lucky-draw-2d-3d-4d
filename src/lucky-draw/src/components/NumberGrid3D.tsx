interface Props {
  selected: Set<string>;
  onToggle: (num: string) => void;
  filterMode: "single" | "duplicates" | "triples" | "all";
}

function matchesFilter(n: string, mode: Props["filterMode"]): boolean {
  const digits = n.split("");
  const unique = new Set(digits).size;
  if (mode === "all") return true;
  if (mode === "triples") return unique === 1;
  if (mode === "duplicates") return unique === 2;
  // single = all digits different
  return unique === 3;
}

export default function NumberGrid3D({ selected, onToggle, filterMode }: Props) {
  const all = Array.from({ length: 1000 }, (_, i) => String(i).padStart(3, "0"));
  const nums = all.filter((n) => matchesFilter(n, filterMode));

  return (
    <div className="grid grid-cols-10 gap-0.5 max-h-52 overflow-y-auto" data-ocid="grid3d.container">
      {nums.map((n) => {
        const sel = selected.has(n);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onToggle(n)}
            className={`py-1 text-center font-mono-game text-[9px] rounded border transition-all duration-100 ${
              sel
                ? "bg-ld-gold text-black font-bold shadow-[0_0_6px_rgba(255,215,0,0.4)]"
                : "border-transparent text-ld-muted hover:bg-ld-cyan/10 hover:text-ld-cyan cursor-pointer"
            }`}
            data-ocid={`grid3d.num.${n}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
