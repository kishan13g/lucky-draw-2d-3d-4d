interface Props {
  selected: Set<string>;
  onToggle: (num: string) => void;
}

export default function NumberGrid2D({ selected, onToggle }: Props) {
  const nums = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <div className="grid grid-cols-10 gap-1" data-ocid="grid2d.container">
      {nums.map((n) => {
        const sel = selected.has(n);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onToggle(n)}
            className={`aspect-square flex items-center justify-center font-orbitron text-[10px] rounded-full border-2 transition-all duration-100 ${
              sel
                ? "bg-ld-gold border-ld-gold text-black font-bold scale-110 shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                : "border-ld-border text-ld-muted hover:border-ld-cyan hover:text-ld-cyan cursor-pointer"
            }`}
            data-ocid={`grid2d.num.${n}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
