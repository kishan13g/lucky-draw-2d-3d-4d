interface Props {
  selected: Set<string>;
  onToggle: (num: string) => void;
}

export default function NumberGrid4D({ selected, onToggle }: Props) {
  // 10000 numbers — render in a virtualised-like chunked approach using CSS overflow
  const nums = Array.from({ length: 10000 }, (_, i) => String(i).padStart(4, "0"));

  return (
    <div className="grid grid-cols-10 gap-0.5 max-h-48 overflow-y-auto" data-ocid="grid4d.container">
      {nums.map((n) => {
        const sel = selected.has(n);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onToggle(n)}
            className={`py-0.5 text-center font-mono-game text-[8px] rounded transition-all duration-100 ${
              sel
                ? "bg-ld-gold text-black font-bold"
                : "text-ld-border hover:bg-ld-gold/10 hover:text-ld-gold cursor-pointer"
            }`}
            data-ocid={`grid4d.num.${n}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
