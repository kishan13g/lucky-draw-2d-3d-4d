import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRegisterMobile, useLoginMobile } from "@/hooks/useBackend";

export default function LoginPage() {
  const { login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerMutation = useRegisterMobile();
  const loginMutation = useLoginMobile();

  async function handleLogin() {
    setError("");
    const num = mobile.trim();
    if (!num || num.length < 7) {
      setError("Valid mobile number daalo");
      return;
    }
    setLoading(true);
    // Generate a stable device token from mobile + timestamp seed stored locally
    const tokenKey = `ld_dt_${num}`;
    let deviceToken = localStorage.getItem(tokenKey);
    if (!deviceToken) {
      deviceToken = `dt_${num}_${Date.now()}`;
      localStorage.setItem(tokenKey, deviceToken);
    }
    try {
      // Try login first (existing user)
      const user = await loginMutation.mutateAsync({ mobileNumber: num, deviceToken });
      login(num, user.deviceToken);
    } catch {
      // New user — register
      try {
        const token = await registerMutation.mutateAsync({ mobileNumber: num, deviceToken });
        login(num, token);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Login fail hua";
        setError(msg);
        setLoading(false);
      }
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "#07070f radial-gradient(ellipse at 15% 30%, #00103a 0%, transparent 60%), radial-gradient(ellipse at 85% 70%, #001530 0%, transparent 60%)",
      }}
      data-ocid="login.page"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center border-2 border-ld-border"
        style={{ background: "#0f0f22", boxShadow: "0 0 60px rgba(0,212,255,0.1)" }}
      >
        {/* Logo */}
        <div className="font-orbitron text-4xl font-black mb-1 tracking-widest">
          <span className="text-ld-cyan">2D</span>{" "}
          <span className="text-ld-green">3D</span>{" "}
          <span className="text-ld-gold">4D</span>
        </div>
        <div className="text-ld-muted text-xs tracking-[0.3em] uppercase mb-8">
          Lucky Draw Lottery
        </div>

        {/* Mobile input */}
        <div className="relative mb-3" data-ocid="login.input">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">📱</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={15}
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-ld-border bg-white/[0.06] text-ld-text font-rajdhani text-base outline-none focus:border-ld-cyan transition-colors placeholder:text-ld-border tracking-widest"
            data-ocid="login.mobile_input"
          />
        </div>

        <p className="text-xs text-ld-border mb-4 flex items-center justify-center gap-1">
          <span>📶</span> Kisi bhi device se login karo
        </p>

        {/* Login button */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-orbitron text-sm font-bold tracking-widest text-black transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #00d4ff, #0088bb)" }}
          data-ocid="login.submit_button"
        >
          {loading ? "⏳ LOADING..." : "🎮 LOGIN & PLAY"}
        </button>

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-ld-red" data-ocid="login.error_state">
            {error}
          </p>
        )}

        <p className="mt-3 text-xs text-ld-border">
          Pehli baar? Auto account ban jayega!
        </p>
      </div>
    </div>
  );
}
