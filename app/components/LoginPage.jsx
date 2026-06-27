"use client";

import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ─────────────────────────────────────────────
const T = {
  bg: "#0A0A0F",
  surface: "#111118",
  surfaceElevated: "#16161F",
  border: "#1E1E2E",
  borderHover: "#2E2E45",
  muted: "#3A3A52",
  text: "#E8E8F0",
  textSecondary: "#7070A0",
  textTertiary: "#4A4A6A",
  accent: "#6366F1",
  accentHover: "#818CF8",
  accentGlow: "rgba(99,102,241,0.12)",
  accentGlowMd: "rgba(99,102,241,0.20)",
  accentGlowStrong: "rgba(99,102,241,0.28)",
  success: "#34D399",
  danger: "#F87171"
};

// ─── KNOWLEDGE GRAPH ───────────────────────────────────────────
const KnowledgeGraph = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      // Keep track of CSS dimensions for the draw loop to avoid layout thrashing
      dimensionsRef.current = { w: width, h: height };

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const nodes = [
      { x: 0.25, y: 0.20, r: 5, pulse: 0, label: "Research.pdf" },
      { x: 0.55, y: 0.15, r: 4, pulse: 1.2, label: "ML Notes" },
      { x: 0.72, y: 0.35, r: 6, pulse: 0.6, label: "Ideas" },
      { x: 0.20, y: 0.48, r: 4, pulse: 2.1, label: "Meeting" },
      { x: 0.45, y: 0.42, r: 8, pulse: 0.3, label: "Core" },
      { x: 0.68, y: 0.58, r: 4, pulse: 1.8, label: "Paper.pdf" },
      { x: 0.30, y: 0.68, r: 5, pulse: 0.9, label: "Notes" },
      { x: 0.58, y: 0.72, r: 4, pulse: 1.5, label: "Links" },
      { x: 0.80, y: 0.22, r: 3, pulse: 0.4, label: "Article" },
      { x: 0.15, y: 0.72, r: 3, pulse: 2.4, label: "Log" },
      { x: 0.82, y: 0.68, r: 3, pulse: 1.1, label: "Data" }
    ];

    const edges = [
      [0, 4], [1, 4], [2, 4], [3, 4],
      [4, 5], [4, 6], [4, 7],
      [2, 5], [1, 8], [3, 9],
      [5, 7], [6, 9], [7, 10], [2, 8]
    ];

    const draw = (time) => {
      const { w: W, h: H } = dimensionsRef.current;
      if (W === 0 || H === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, W, H);
      const t = time * 0.001;

      // EDGES
      edges.forEach(([a, b]) => {
        const n1 = nodes[a];
        const n2 = nodes[b];

        const x1 = n1.x * W;
        const y1 = n1.y * H;
        const x2 = n2.x * W;
        const y2 = n2.y * H;

        const pulse = (Math.sin(t * 1.5 + n1.pulse) + 1) / 2;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);

        grad.addColorStop(0, `rgba(99,102,241,${0.06 + pulse * 0.08})`);
        grad.addColorStop(1, `rgba(99,102,241,${0.06 + pulse * 0.08})`);

        ctx.beginPath();
        ctx.moveTo(x1, y1);

        const mx = (x1 + x2) / 2 + Math.sin(t) * 20;
        const my = (y1 + y2) / 2 + Math.cos(t) * 15;

        ctx.quadraticCurveTo(mx, my, x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // NODES
      nodes.forEach(node => {
        const x = node.x * W;
        const y = node.y * H;
        const pulse = (Math.sin(t + node.pulse) + 1) / 2;
        const r = node.r + pulse * 1.5;

        // Outer Glow Shadow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        glow.addColorStop(0, "rgba(99,102,241,.2)");
        glow.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Solid Center Node
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = T.accent;
        ctx.fill();

        // Render Node Typography Labels
        ctx.fillStyle = T.textSecondary;
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        
        const cleanLabel = truncateText(ctx, node.label, 75);
        ctx.fillText(cleanLabel, x, y + r + 6);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block"
      }}
    />
  );
};

// ─── HELPERS ───────────────────────────────────────────────────
function truncateText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let txt = text;
  while (ctx.measureText(txt + "…").width > maxWidth && txt.length > 0) {
    txt = txt.slice(0, -1);
  }
  return txt + "…";
}

// ─── ICONS ────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const BrainIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
);

// ─── GLOBAL CSS ───────────────────────────────────────────
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
}

body {
  font-family: 'Inter', sans-serif;
  background: ${T.bg};
  color: ${T.text};
  overflow-x: hidden;
  overflow-y: auto;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.anim-0 { animation: fadeUp .5s ease both; }
.anim-1 { animation: fadeUp .5s .1s ease both; }
.anim-2 { animation: fadeUp .5s .2s ease both; }

input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px ${T.surface} inset !important;
  -webkit-text-fill-color: ${T.text} !important;
}

@media (max-width: 768px) {
  .login-left { display: none !important; }
  .login-right { width: 100% !important; padding: 30px 20px !important; }
}
`;

// ─── FORM INPUT ───────────────────────────────────────────
const FormInput = ({ label, type = "text", placeholder, value, onChange, rightSlot }) => {
  const [focus, setFocus] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <label style={{ fontSize: "12px", color: T.textSecondary }}>{label}</label>
      <div
        style={{
          position: "relative",
          border: `1px solid ${focus ? T.accent : T.border}`,
          borderRadius: "9px",
          background: T.surfaceElevated,
          boxShadow: focus ? `0 0 0 3px ${T.accentGlow}` : "none",
          transition: "all .2s ease"
        }}
      >
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: "100%",
            padding: rightSlot ? "12px 42px 12px 14px" : "12px 14px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: T.text,
            fontFamily: "inherit"
          }}
        />
        {rightSlot && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── LOGIN PAGE START ─────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("login");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (view === "forgot") {
      if (!email) return;
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        alert("Reset link sent successfully!");
      }, 1200);
      return;
    }

    if (view === "signup" && !name) return;
    if (!email || !password) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(view === "login" ? "Logged in successfully!" : "Account created successfully!");
    }, 1200);
  };

  const isLogin = view === "login";

  return (
    <>
      <style>{globalCSS}</style>

      <div style={{ display: "flex", height: "100vh" }}>
        {/* LEFT PANEL */}
        <div
          className="login-left"
          style={{
            flex: "1 1 55%",
            position: "relative",
            background: T.bg,
            borderRight: `1px solid ${T.border}`,
            overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", inset: 0, top: -40,}}>
            <KnowledgeGraph />
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(10,10,15,0), rgba(10,10,15,0))"
            }}
          />

          {/* LOGO */}
          <div style={{ position: "relative", zIndex: 2, padding: "28px 32px", display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: 30, height: 30, background: T.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyC: "center", justifyContent: "center" }}>
              <BrainIcon size={16} />
            </div>
            <b style={{fontSize: 25, color: T.text }}>Second Brain</b>
          </div>

          {/* LEFT TEXT */}
          <div style={{ position: "absolute", bottom: 40, left: 40, zIndex: 2 }}>
            <h1 style={{ fontSize: "60px", lineHeight: 1.2, letterSpacing: "-.04em" }}>
              Your personal AI-powered
              <br />
              knowledge system
            </h1>
            <p style={{ marginTop: 15, maxWidth: 420, color: T.textSecondary, lineHeight: 1.6 }}>
              Upload, organize, and chat with everything you know. Documents, notes, and research instantly searchable.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="login-right"
            style={{
            overflowY: "auto",
            width: "43%",
            minWidth: 400,
            background: T.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40
          }}
        >
          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 420, margin: "auto" }}>
            {/* HEADER */}
            <div className="anim-0" style={{ marginBottom: 30 }}>
              <div style={{ width: 42, height: 42, background: T.accent, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <BrainIcon />
              </div>

              <h2 style={{ fontSize: 40, marginBottom: 5 }}>
                {view === "login" ? "Hey there!" : view === "signup" ? "Design your brain" : "Reset password"}
              </h2>

              <p style={{ color: T.textSecondary, fontSize: 13 }}>
                {view === "login" ? "Sign in to access your knowledge base" : view === "signup" ? "Build your personal AI system" : "Enter email to reset password"}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {view === "signup" && (
                <FormInput
                  label="Full name"
                  placeholder="Jamie Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <FormInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {view !== "forgot" && (
                <FormInput
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ background: "none", border: "none", color: T.textSecondary, cursor: "pointer" }}
                    >
                      <EyeIcon open={showPass} />
                    </button>
                  }
                />
              )}

              {isLogin && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: T.textSecondary }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={() => setRemember(!remember)}
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    style={{ background: "none", border: "none", color: T.accent, cursor: "pointer" }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* MAIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 5,
                  width: "100%",
                  padding: "12px",
                  borderRadius: 9,
                  border: "none",
                  background: T.accent,
                  color: "white",
                  cursor: "pointer",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        border: "2px solid white",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite"
                      }}
                    />
                    Loading...
                  </>
                ) : view === "login" ? (
                  "Sign in"
                ) : view === "signup" ? (
                  "Create account"
                ) : (
                  "Send reset link"
                )}
              </button>

              {view !== "forgot" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "15px 0", color: T.textTertiary, fontSize: 12 }}>
                    <div style={{ flex: 1, height: 1, background: T.border }} />
                    or continue with
                    <div style={{ flex: 1, height: 1, background: T.border }} />
                  </div>

                  <button
                    type="button"
                    onClick={() => alert("Google OAuth setup required")}
                    style={{
                      width: "100%",
                      padding: "11px",
                      borderRadius: 9,
                      border: `1px solid ${T.border}`,
                      background: T.surfaceElevated,
                      color: T.text,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 10
                    }}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                </>
              )}

              {/* SWITCH VIEWS */}
              <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: T.textSecondary }}>
                {view === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setView("signup")} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer" }}>
                      Sign up free
                    </button>
                  </>
                ) : view === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => setView("login")} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer" }}>
                      Sign in
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setView("login")} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer" }}>
                    ← Back to sign in
                  </button>
                )}
              </p>

              {/* FOOTER */}
              <p style={{ textAlign: "center", fontSize: 11, marginTop: 30, color: T.textTertiary }}>
                By continuing, you agree to our{" "}
                <span style={{ color: T.textSecondary, cursor: "pointer" }}>Terms</span> and{" "}
                <span style={{ color: T.textSecondary, cursor: "pointer" }}>Privacy Policy</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}