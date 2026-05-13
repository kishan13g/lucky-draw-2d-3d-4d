import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLatestResults, useMobileUser } from "@/hooks/useBackend";
import { DrawLetter, DrawType } from "@/types";
import GamePage from "@/pages/GamePage";
import HistoryPage from "@/pages/HistoryPage";

type Tab = "2d" | "3d" | "4d" | "history";
type DrawLetterTab = "A" | "B" | "C";

const DRAW_TYPE_MAP: Record<"2d" | "3d" | "4d", DrawType> = {
  "2d": DrawType.twoD,
  "3d": DrawType.threeD,
  "4d": DrawType.fourD,
};

const LETTER_MAP: Record<DrawLetterTab, DrawLetter> = {
  A: DrawLetter.A,
  B: DrawLetter.B,
  C: DrawLetter.C,
};

const DRAW_TYPE_LABEL: Record<DrawType, string> = {
  [DrawType.twoD]: "2D",
  [DrawType.threeD]: "3D",
  [DrawType.fourD]: "4D",
};

export default function Layout() {
  const { auth, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("2d");
  const [activeLetter, setActiveLetter] = useState<DrawLetterTab>("A");

  const { data: results = [] } = useLatestResults();
  const { data: mobileUser } = useMobileUser(auth?.mobileNumber ?? "");

  const balance = mobileUser?.balance != null ? mobileUser.balance.toString() : "—";

  return (
    <div
      className="flex flex-col min-h-screen font-rajdhani"
      style={{
        background:
          "#07070f radial-gradient(ellipse at 15% 30%, #00103a 0%, transparent 60%), radial-gradient(ellipse at 85% 70%, #001530 0%, transparent 60%)",
      }}
    >
      {/* Top Bar */}
      <header
        className="sticky top-0 z-50 px-3.5 py-2 flex items-center justify-between flex-wrap gap-2 border-b-2 border-ld-border"
        style={{ background: "linear-gradient(135deg, #0a003a, #00082a)" }}
        data-ocid="layout.topbar"
      >
        <div className="font-orbitron text-sm font-black text-ld-cyan flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-ld-green animate-pulse-slow" />
          🎯 LUCKY DRAW
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="rounded-md border border-ld-border px-2 py-0.5 text-center" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div className="text-[8px] text-ld-border uppercase">Mobile</div>
            <div className="font-orbitron text-[11px] text-ld-gold" data-ocid="layout.mobile_chip">
              {auth?.mobileNumber ?? "—"}
            </div>
          </div>
          <div className="rounded-md border border-ld-border px-2 py-0.5 text-center" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div className="text-[8px] text-ld-border uppercase">Balance</div>
            <div className="font-orbitron text-[11px] text-ld-gold" data-ocid="layout.balance_chip">
              {balance}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-2.5 py-1 rounded-md border border-ld-red bg-ld-red/15 text-ld-red font-orbitron text-[10px] hover:bg-ld-red hover:text-white transition-all"
            data-ocid="layout.logout_button"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Game Tabs */}
      <nav
        className="flex border-b-2 border-ld-border overflow-x-auto"
        style={{ background: "#0f0f22" }}
        data-ocid="layout.tabs"
      >
        {(["2d", "3d", "4d", "history"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[65px] py-2.5 px-1.5 text-center font-orbitron text-xs font-bold border-b-2 transition-all ${
              activeTab === tab
                ? "text-ld-gold border-ld-gold"
                : "text-ld-muted border-transparent hover:text-ld-text"
            }`}
            data-ocid={`layout.tab.${tab}`}
          >
            <span className="block">
              {tab === "history" ? "📋" : tab.toUpperCase()}
            </span>
            <span className="block text-[8px] font-rajdhani font-normal opacity-60 mt-0.5">
              {tab === "2d" && "00–99"}
              {tab === "3d" && "000–999"}
              {tab === "4d" && "0000–9999"}
              {tab === "history" && "History"}
            </span>
          </button>
        ))}
      </nav>

      {/* Results Bar */}
      {results.length > 0 && (
        <div
          className="px-3.5 py-1.5 overflow-x-auto whitespace-nowrap border-b border-ld-border"
          style={{ background: "#060615" }}
          data-ocid="layout.results_bar"
        >
          <div className="inline-flex items-center gap-2">
            <span className="font-orbitron text-[9px] text-ld-border mr-1">RESULTS:</span>
            {results.map((r, i) => (
              <div
                key={i}
                className="rounded-md px-2.5 py-1 text-center"
                style={{ background: "linear-gradient(135deg, #0a1030, #0a2040)" }}
                data-ocid={`layout.result.${i + 1}`}
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
                  {DRAW_TYPE_LABEL[r.drawType]}-{r.drawLetter}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABC Draw Letter selector (only for game tabs) */}
      {activeTab !== "history" && (
        <div
          className="flex gap-2.5 px-3.5 pt-3 pb-1"
          data-ocid="layout.draw_letters"
        >
          {(["A", "B", "C"] as DrawLetterTab[]).map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => setActiveLetter(letter)}
              className={`flex-1 rounded-xl border-2 py-1.5 text-center cursor-pointer transition-all ${
                activeLetter === letter
                  ? "border-ld-gold shadow-[0_0_15px_rgba(255,215,0,0.25)]"
                  : "border-ld-border hover:border-ld-muted"
              }`}
              style={{ background: "#161630" }}
              data-ocid={`layout.letter.${letter}`}
            >
              <div
                className={`font-orbitron text-lg font-bold ${
                  letter === "A"
                    ? "text-purple-400"
                    : letter === "B"
                    ? "text-ld-green"
                    : "text-ld-red"
                }`}
              >
                {letter}
              </div>
              <div className="font-orbitron text-[9px] text-ld-cyan mt-0.5">DRAW {letter}</div>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "history" ? (
          <HistoryPage />
        ) : (
          <GamePage
            drawType={DRAW_TYPE_MAP[activeTab]}
            drawLetter={LETTER_MAP[activeLetter]}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-[10px] text-ld-border border-t border-ld-border" style={{ background: "#0f0f22" }}>
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noreferrer"
          className="text-ld-cyan hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
