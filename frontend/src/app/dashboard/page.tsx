"use client";

/**
 * ProjectLens — AI Powered Project Evaluation Platform
 * Single-file dashboard page containing all UI, styles and stage logic.
 *
 * Stages:
 *   idle    -> AnalyzeForm (GitHub URL + ZIP upload)
 *   loading -> Animated multi-step progress
 *   results -> Full evaluation report (score, categories, summary, etc.)
 *
 * Dependencies: react, lucide-react, tailwindcss.
 * No external component files are required — everything lives here.
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  History,
  Settings,
  Sparkles,
  Bell,
  Upload,
  Link2,
  Loader2,
  Check,
  CircleCheck,
  TriangleAlert,
  Lightbulb,
  MessageCircleQuestion,
  RotateCcw,
  Menu,
  User,
  Lock,
  Shield,
  Zap,
  Globe,
  LogOut,
  Key,
  Camera,
  ArrowRight,
  Clock,
  X,
  Users,
} from "lucide-react";

/**
 * Custom GitHub icon component since it's missing from the current lucide-react version.
 */
const GitHub = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

/* ---------------------------------------------------------------------------
 * Inline styles — design tokens, glassmorphism, gradients, glow effects.
 * Scoped to this page so the file is fully self-contained.
 * ------------------------------------------------------------------------- */
const PageStyles = () => (
  <style>{`
    .pl-root {
      --pl-bg: 230 25% 6%;
      --pl-fg: 220 20% 95%;
      --pl-muted-fg: 220 12% 65%;
      --pl-border: 230 20% 18%;
      --pl-card: 230 25% 12% / 0.55;
      --pl-primary: 265 90% 66%;
      --pl-accent: 195 95% 60%;
      --pl-success: 150 70% 50%;
      --pl-warning: 38 95% 60%;
      --pl-gradient: linear-gradient(135deg, hsl(265 90% 66%), hsl(220 95% 65%));
      --pl-glow: 0 0 40px hsl(265 90% 66% / 0.35);
      --pl-glow-accent: 0 0 30px hsl(195 95% 60% / 0.25);

      min-height: 100vh;
      background-color: hsl(var(--pl-bg));
      color: hsl(var(--pl-fg));
      background-image:
        radial-gradient(ellipse at top left, hsl(265 70% 18% / 0.6), transparent 55%),
        radial-gradient(ellipse at bottom right, hsl(195 80% 18% / 0.5), transparent 55%);
      background-attachment: fixed;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      font-size: 17px;
    }
    .pl-root { font-size: 1.05rem; }
    .pl-glass {
      background: hsl(230 25% 15% / 0.85);
      border: 1px solid hsl(230 30% 70% / 0.2);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      box-shadow: 0 20px 60px -12px hsl(230 60% 2% / 0.8);
    }
    .pl-glass-bright {
      background: hsl(230 25% 20% / 0.98);
      border: 1px solid hsl(230 30% 85% / 0.35);
      backdrop-filter: blur(40px);
      box-shadow: 0 30px 80px -12px hsl(0 0% 0% / 0.95);
    }
    .pl-gradient-bg { background: var(--pl-gradient); }
    .pl-gradient-text {
      background: var(--pl-gradient);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .pl-glow { box-shadow: var(--pl-glow); }
    .pl-glow-accent { box-shadow: var(--pl-glow-accent); }
    .pl-glow-border { position: relative; }
    .pl-glow-border::before {
      content: "";
      position: absolute; inset: -1px;
      border-radius: inherit;
      padding: 1px;
      background: var(--pl-gradient);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude;
      opacity: .5;
      pointer-events: none;
      transition: opacity .3s ease;
    }
    .pl-glow-border:hover::before { opacity: 1; }

    @keyframes pl-fade-in   { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    @keyframes pl-pulse-glow{ 0%,100% { box-shadow: 0 0 20px hsl(var(--pl-primary) / 0.4); }
                              50%     { box-shadow: 0 0 40px hsl(var(--pl-primary) / 0.7); } }
    .pl-fade-in    { animation: pl-fade-in 0.5s ease-out; }
    .pl-pulse-glow { animation: pl-pulse-glow 2.5s ease-in-out infinite; }

    .pl-input {
      width: 100%; height: 3rem;
      padding: 0 0.75rem 0 2.5rem;
      border-radius: 0.75rem;
      background: hsl(230 25% 6% / 0.6);
      border: 1px solid hsl(var(--pl-border));
      color: hsl(var(--pl-fg));
      font-size: 0.875rem;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
    }
    .pl-input::placeholder { color: hsl(var(--pl-muted-fg)); }
    .pl-input:focus {
      border-color: hsl(var(--pl-primary) / 0.5);
      box-shadow: 0 0 0 3px hsl(var(--pl-primary) / 0.15);
    }

    .pl-btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
      width: 100%; height: 3rem;
      border-radius: 0.75rem;
      background: var(--pl-gradient);
      color: hsl(var(--pl-bg));
      font-weight: 600; font-size: 1rem;
      box-shadow: var(--pl-glow);
      transition: transform .2s, box-shadow .2s, opacity .2s;
      cursor: pointer; border: 0;
    }
    .pl-btn-primary:hover:not(:disabled) {
      transform: scale(1.01);
      box-shadow: 0 0 60px hsl(var(--pl-primary) / 0.6);
    }
    .pl-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

    .pl-btn-outline {
      display: inline-flex; align-items: center; gap: .5rem;
      padding: .5rem 1rem;
      border-radius: 0.75rem;
      background: transparent;
      border: 1px solid hsl(var(--pl-border));
      color: hsl(var(--pl-fg));
      font-size: .875rem; font-weight: 500;
      transition: border-color .2s, box-shadow .2s;
      cursor: pointer;
    }
    .pl-btn-outline:hover {
      border-color: hsl(var(--pl-primary) / 0.5);
      box-shadow: var(--pl-glow);
    }

    .pl-icon-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 2.5rem; height: 2.5rem;
      border-radius: 999px;
      background: transparent; border: 0; color: hsl(var(--pl-fg));
      cursor: pointer; position: relative;
      transition: background .2s;
    }
    .pl-icon-btn:hover { background: hsl(230 20% 14%); }

    .pl-sidebar-item {
      display: flex; align-items: center; gap: .75rem;
      width: 100%;
      padding: .65rem .85rem;
      border-radius: .75rem;
      background: transparent; border: 0;
      color: hsl(var(--pl-fg) / 0.8);
      font-size: .875rem; font-weight: 500;
      cursor: pointer; text-align: left;
      transition: background .2s, color .2s, box-shadow .2s;
    }
    .pl-sidebar-item:hover { background: hsl(230 20% 12%); color: hsl(var(--pl-fg)); }
    .pl-sidebar-item.is-active {
      background: var(--pl-gradient);
      color: hsl(var(--pl-bg));
      box-shadow: var(--pl-glow);
    }
  `}</style>
);

/* ---------------------------------------------------------------------------
 * Sidebar
 * ------------------------------------------------------------------------- */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "history",   label: "Analyzed Projects", icon: History },
  { key: "settings",  label: "Settings", icon: Settings },
];

function Sidebar({ open, onClose, active, onSelect }: { open: boolean; onClose: () => void; active: string; onSelect: (key: string) => void }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={`fixed md:static z-40 h-screen w-64 shrink-0 border-r border-white/5 bg-[hsl(230_25%_7%)] transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 p-4">
          <div className="pl-gradient-bg pl-glow flex h-9 w-9 items-center justify-center rounded-xl">
            <Sparkles className="h-5 w-5" style={{ color: "hsl(230 25% 6%)" }} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">ProjectLens</div>
            <div className="text-[10px] opacity-60">AI Evaluation</div>
          </div>
        </div>
        <div className="px-3">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider opacity-50">
            Menu
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((it) => {
              const Icon = it.icon;
              return (
                <button
                  key={it.key}
                  onClick={() => {
                    onSelect(it.key);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`pl-sidebar-item ${active === it.key ? "is-active" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{it.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * Topbar
 * ------------------------------------------------------------------------- */
function Topbar({ onMenu, onViewAllNotifs, onNavigate, user }: { onMenu: () => void; onViewAllNotifs: () => void; onNavigate: (key: string) => void; user: { name: string; email: string } }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  const DEMO_NOTIFS = [
    { id: 1, title: "Analysis Complete", desc: "Your project 'Lens-Core' has been analyzed.", time: "2m ago", type: "success" },
    { id: 2, title: "New Feature", desc: "Settings panel is now live! Explore customization.", time: "1h ago", type: "info" },
    { id: 3, title: "Security Alert", desc: "Update your GitHub token for better security.", time: "5h ago", type: "warning" },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-white/5 bg-[hsl(230_25%_6%/0.6)] px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="pl-icon-btn md:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-base font-semibold">
            Welcome back, <span className="pl-gradient-text">{user.name.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-xs opacity-60">Let's evaluate something brilliant today.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className={`pl-icon-btn ${notifOpen ? "bg-white/10" : ""}`} 
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span
              className="pl-glow-accent pl-pulse-glow absolute right-2 top-2 h-2 w-2 rounded-full"
              style={{ background: "hsl(var(--pl-accent))" }}
            />
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="pl-glass-bright absolute right-0 mt-2 z-20 w-[350px] origin-top-right rounded-2xl p-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold">Notifications</h3>
                  <button onClick={() => setNotifOpen(false)} className="opacity-40 hover:opacity-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {DEMO_NOTIFS.map((n) => (
                    <div key={n.id} className="group relative rounded-xl bg-white/5 p-3 transition hover:bg-white/10">
                      <div className="flex justify-between gap-2">
                        <div className="text-[13px] font-semibold">{n.title}</div>
                        <div className="flex items-center gap-1 text-[10px] opacity-40">
                          <Clock className="h-3 w-3" />
                          {n.time}
                        </div>
                      </div>
                      <div className="mt-1 text-[11px] leading-relaxed opacity-60">{n.desc}</div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setNotifOpen(false);
                    onViewAllNotifs();
                  }}
                  className="mt-4 w-full py-2 text-center text-xs font-semibold text-purple-400 hover:underline"
                >
                  View all notifications
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pr-3 transition hover:border-[hsl(var(--pl-primary)/0.5)] hover:shadow-[var(--pl-glow)] ${profileOpen ? "border-[hsl(var(--pl-primary)/0.5)] shadow-[var(--pl-glow)]" : ""}`}
          >
            <span className="pl-gradient-bg flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold" style={{ color: "hsl(230 25% 6%)" }}>
              B
            </span>
            <span className="hidden text-sm font-medium sm:inline">Bhuvana</span>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="pl-glass-bright absolute right-0 mt-2 z-20 w-64 origin-top-right rounded-2xl p-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-2 px-3 py-2">
                  <div className="text-base font-bold">{user.name}</div>
                  <div className="text-xs opacity-60">{user.email}</div>
                </div>
                <div className="h-px bg-white/5 mx-2 mb-2" />
                <button 
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate("settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs transition hover:bg-white/5"
                >
                  <User className="h-4 w-4 opacity-60" />
                  Edit Profile
                </button>
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5">
                  <Users className="h-4 w-4 opacity-70" />
                  Switch Account
                </button>
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5">
                  <Users className="h-4 w-4 opacity-70" />
                  Add Account
                </button>
                <button 
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate("settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
                >
                  <Settings className="h-4 w-4 opacity-70" />
                  Preferences
                </button>
                <div className="h-px bg-white/10 mx-2 my-2" />
                <button 
                  onClick={() => router.push("/signin")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------------
 * Stage 1 — Analyze form
 * ------------------------------------------------------------------------- */
function AnalyzeForm({ onAnalyze }: { onAnalyze: () => void }) {
  const [url, setUrl] = useState("");
  return (
    <section className="pl-fade-in">
      <div className="mb-8 text-center">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
          style={{
            borderColor: "hsl(var(--pl-primary) / 0.3)",
            background: "hsl(var(--pl-primary) / 0.1)",
            color: "hsl(var(--pl-primary))",
          }}
        >
          <Sparkles className="h-3 w-3" /> AI-powered analysis
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Ready to analyze your <span className="pl-gradient-text">project?</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm opacity-70 md:text-base">
          Paste a GitHub repository link and get instant, AI-powered evaluation across code quality,
          architecture, documentation, and more.
        </p>
      </div>

      <div className="pl-glass pl-glow-border mx-auto max-w-2xl rounded-2xl p-6 md:p-8">
        <label className="mb-2 block text-sm font-medium opacity-70">GitHub repository URL</label>
        <div className="relative mb-4">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
          <input
            className="pl-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
          />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs opacity-60">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm opacity-80 transition hover:border-[hsl(var(--pl-primary)/0.6)] hover:opacity-100">
          <Upload className="h-4 w-4" />
          <span>Upload ZIP file <span className="text-xs opacity-60">(optional)</span></span>
          <input type="file" accept=".zip" className="hidden" />
        </label>

        <button
          onClick={onAnalyze}
          disabled={!url.trim()}
          className="pl-btn-primary mt-6"
        >
          <Sparkles className="h-4 w-4" />
          Analyze Project
        </button>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs opacity-60">
          <GitHub className="h-3 w-3" /> Works with public GitHub repositories
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Stage 2 — Loading
 * ------------------------------------------------------------------------- */
const LOADING_STEPS = [
  "Reading repository...",
  "Evaluating code quality...",
  "Analyzing architecture...",
  "Generating AI insights...",
];

function LoadingState({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (current >= LOADING_STEPS.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCurrent((c) => c + 1), 1100);
    return () => clearTimeout(t);
  }, [current, onDone]);

  return (
    <div className="pl-fade-in mx-auto max-w-xl">
      <div className="pl-glass rounded-2xl p-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="relative h-20 w-20">
            <div className="pl-gradient-bg pl-pulse-glow absolute inset-0 rounded-full opacity-30 blur-2xl" />
            <Loader2 className="absolute inset-0 m-auto h-12 w-12 animate-spin" style={{ color: "hsl(var(--pl-primary))" }} />
          </div>
        </div>
        <h3 className="mb-6 text-center text-lg font-semibold">Analyzing your project</h3>
        <ul className="space-y-3">
          {LOADING_STEPS.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li
                key={s}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                  active
                    ? "border-[hsl(var(--pl-primary)/0.4)] bg-[hsl(var(--pl-primary)/0.1)]"
                    : done
                    ? "border-white/10 bg-white/5"
                    : "border-white/5 bg-white/[0.02] opacity-60"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    done
                      ? "bg-[hsl(var(--pl-success)/0.2)] text-[hsl(var(--pl-success))]"
                      : active
                      ? "bg-[hsl(var(--pl-primary)/0.2)] text-[hsl(var(--pl-primary))]"
                      : "bg-white/10 opacity-70"
                  }`}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span className={`text-sm ${active ? "" : "opacity-70"}`}>{s}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Stage 3 — Analysis results
 * ------------------------------------------------------------------------- */
const OVERALL = 86;
const CATEGORIES = [
  { name: "Code Quality", score: 88 },
  { name: "Architecture", score: 82 },
  { name: "Documentation", score: 74 },
  { name: "Scalability", score: 90 },
  { name: "Resume Readiness", score: 92 },
];
const STRENGTHS = [
  "Clean, modular folder structure with clear separation of concerns",
  "Strong use of TypeScript with consistent typing across modules",
  "Comprehensive README and well-documented setup steps",
  "Good error handling and validation in critical paths",
];
const WEAKNESSES = [
  "Limited unit test coverage — some core utilities untested",
  "A few large components could be split for maintainability",
  "Missing CI/CD pipeline configuration",
];
const IMPROVEMENTS = [
  "Add Vitest/Jest tests targeting at least 70% coverage on core logic",
  "Introduce a GitHub Actions workflow for lint, test, and build",
  "Extract reusable UI primitives into a shared design package",
  "Add OpenAPI/Swagger docs for backend endpoints",
];
const QUESTIONS = [
  "Walk me through the architecture and why you chose this stack.",
  "How would you scale this to handle 10x the current load?",
  "What were the trickiest bugs you encountered and how did you fix them?",
  "How would you add authentication and protect sensitive routes?",
  "Describe your testing strategy and what you'd improve.",
];

function ScoreRing({ value }: { value: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <div className="pl-gradient-bg absolute inset-0 rounded-full opacity-20 blur-2xl" />
      <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} stroke="hsl(var(--pl-border))" strokeWidth="10" fill="none" />
        <circle
          cx="80" cy="80" r={r} fill="none" strokeWidth="10" strokeLinecap="round"
          stroke="url(#pl-ring-grad)" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        <defs>
          <linearGradient id="pl-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--pl-primary))" />
            <stop offset="100%" stopColor="hsl(var(--pl-accent))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="pl-gradient-text text-5xl font-bold">{value}</span>
        <span className="text-xs uppercase tracking-wider opacity-60">Overall</span>
      </div>
    </div>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="pl-gradient-bg h-full rounded-full"
        style={{ width: `${value}%`, transition: "width 1s ease-out" }}
      />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`pl-glass rounded-2xl p-6 ${className}`}>{children}</div>;
}

function AnalysisResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="pl-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider opacity-60">Analysis complete</p>
          <h2 className="text-2xl font-bold">Project Evaluation Report</h2>
        </div>
        <button onClick={onReset} className="pl-btn-outline">
          <RotateCcw className="h-4 w-4" /> Analyze another
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center text-center">
          <ScoreRing value={OVERALL} />
          <p className="mt-4 text-sm opacity-70">Excellent project — well above average</p>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider opacity-60">
            Category Scores
          </h3>
          <div className="space-y-4">
            {CATEGORIES.map((c) => (
              <div key={c.name}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="opacity-60">{c.score}/100</span>
                </div>
                <Bar value={c.score} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: "hsl(var(--pl-primary))" }} />
          <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60">AI Summary</h3>
        </div>
        <p className="text-sm leading-relaxed opacity-90">
          This project demonstrates a strong grasp of modern full-stack development with thoughtful
          architectural decisions and clean code practices. The modular structure, strong typing,
          and clear documentation make it stand out as a portfolio-ready project. Adding automated
          testing and a CI pipeline would push it to a production-grade level. Overall, this is a
          well-executed project that effectively communicates the developer's technical capability.
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <CircleCheck className="h-4 w-4" style={{ color: "hsl(var(--pl-success))" }} />
            <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60">Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {STRENGTHS.map((s) => (
              <li key={s} className="flex gap-3 text-sm">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: "hsl(var(--pl-success))",
                    boxShadow: "0 0 8px hsl(var(--pl-success))",
                  }}
                />
                <span className="opacity-90">{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <TriangleAlert className="h-4 w-4" style={{ color: "hsl(var(--pl-warning))" }} />
            <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60">Weaknesses</h3>
          </div>
          <ul className="space-y-2.5">
            {WEAKNESSES.map((s) => (
              <li key={s} className="flex gap-3 text-sm">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: "hsl(var(--pl-warning))",
                    boxShadow: "0 0 8px hsl(var(--pl-warning))",
                  }}
                />
                <span className="opacity-90">{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" style={{ color: "hsl(var(--pl-accent))" }} />
          <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60">
            Improvement Suggestions
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {IMPROVEMENTS.map((s, i) => (
            <div
              key={s}
              className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[hsl(var(--pl-primary)/0.4)] hover:bg-[hsl(var(--pl-primary)/0.05)]"
            >
              <span
                className="pl-gradient-bg pl-glow flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{ color: "hsl(230 25% 6%)" }}
              >
                {i + 1}
              </span>
              <span className="text-sm opacity-90">{s}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <MessageCircleQuestion className="h-4 w-4" style={{ color: "hsl(var(--pl-primary))" }} />
          <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60">
            Interview Preparation
          </h3>
        </div>
        <div className="space-y-3">
          {QUESTIONS.map((q, i) => (
            <div
              key={q}
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[hsl(var(--pl-accent)/0.4)] hover:shadow-[var(--pl-glow-accent)]"
            >
              <span className="text-xs font-bold" style={{ color: "hsl(var(--pl-accent))" }}>
                Q{i + 1}
              </span>
              <span className="text-sm opacity-90">{q}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Page (default export)
 * ------------------------------------------------------------------------- */
type Stage = "idle" | "loading" | "results";

/* ---------------------------------------------------------------------------
 * Settings View
 * ------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------
 * Settings View
 * ------------------------------------------------------------------------- */
function SettingsView({ user, onUpdate }: { user: any, onUpdate: (data: any) => void }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(user);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [aiConfig, setAiConfig] = useState({
    deepAnalysis: true,
    securityFocus: false,
    model: "lens-v4"
  });

  const [securityStep, setSecurityStep] = useState<"overview" | "change-password">("overview");

  const TABS = [
    { key: "profile", label: "Profile", icon: User },
    { key: "ai",      label: "AI Config", icon: Zap },
    { key: "security", label: "Security", icon: Lock },
  ];

  const handleProfileSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(profile);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm opacity-60">Manage your profile and AI preferences.</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Tabs */}
        <aside className="w-full lg:w-48 shrink-0">
          <nav className="flex gap-1 lg:flex-col">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === t.key
                      ? "bg-white/10 text-white shadow-[var(--pl-glow)]"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <div className="pl-glass space-y-6 rounded-3xl p-8">
              <div className="flex items-center gap-6">
                <div className="pl-gradient-bg pl-glow relative flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold" style={{ color: "hsl(230 25% 6%)" }}>
                  {profile.name.charAt(0)}
                  <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[hsl(230_25%_12%)] text-white/70 hover:text-white">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{profile.name}</h3>
                  <p className="text-sm opacity-60">{profile.email}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[hsl(var(--pl-primary)/0.5)] focus:ring-1 focus:ring-[hsl(var(--pl-primary)/0.2)]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[hsl(var(--pl-primary)/0.5)] focus:ring-1 focus:ring-[hsl(var(--pl-primary)/0.2)]" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Bio</label>
                  <textarea 
                    rows={3} 
                    value={profile.bio} 
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-[hsl(var(--pl-primary)/0.5)] focus:ring-1 focus:ring-[hsl(var(--pl-primary)/0.2)]" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                {saveSuccess && <span className="text-xs text-green-400 animate-in fade-in slide-in-from-right-2">Profile updated!</span>}
                <button 
                  onClick={handleProfileSave}
                  disabled={isSaving}
                  className="pl-btn-primary"
                >
                  {isSaving ? "Saving..." : "Update Profile"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="pl-glass space-y-6 rounded-3xl p-8">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">AI Configuration</h3>
                <p className="text-sm opacity-60">Tune how ProjectLens evaluates your code.</p>
              </div>

              <div className="space-y-6">
                <div 
                  onClick={() => setAiConfig({...aiConfig, deepAnalysis: !aiConfig.deepAnalysis})}
                  className="flex cursor-pointer items-center justify-between rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Deep Analysis</div>
                      <div className="text-xs opacity-60">Perform thorough evaluation of logic and patterns.</div>
                    </div>
                  </div>
                  <div className={`h-6 w-11 rounded-full p-1 transition-colors ${aiConfig.deepAnalysis ? "bg-purple-500" : "bg-white/10"}`}>
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${aiConfig.deepAnalysis ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                </div>

                <div 
                  onClick={() => setAiConfig({...aiConfig, securityFocus: !aiConfig.securityFocus})}
                  className="flex cursor-pointer items-center justify-between rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Security Focus</div>
                      <div className="text-xs opacity-60">Prioritize vulnerability detection and best practices.</div>
                    </div>
                  </div>
                  <div className={`h-6 w-11 rounded-full p-1 transition-colors ${aiConfig.securityFocus ? "bg-blue-500" : "bg-white/10"}`}>
                    <div className={`h-4 w-4 rounded-full bg-white transition-transform ${aiConfig.securityFocus ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Analysis Model</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button 
                      onClick={() => setAiConfig({...aiConfig, model: "lens-v4"})}
                      className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                        aiConfig.model === "lens-v4" 
                          ? "border-[hsl(var(--pl-primary)/0.5)] bg-[hsl(var(--pl-primary)/0.1)] shadow-[var(--pl-glow)]" 
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="text-sm font-bold">Lens-Core v4</span>
                      <span className="text-[10px] opacity-60">Fast, optimized for quality checks.</span>
                    </button>
                    <button 
                      onClick={() => setAiConfig({...aiConfig, model: "gpt-4"})}
                      className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
                        aiConfig.model === "gpt-4" 
                          ? "border-[hsl(var(--pl-primary)/0.5)] bg-[hsl(var(--pl-primary)/0.1)] shadow-[var(--pl-glow)]" 
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="text-sm font-bold">GPT-4o DeepMind</span>
                      <span className="text-[10px] opacity-60">Maximum precision for complex repos.</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="pl-glass space-y-6 rounded-3xl p-8">
              {securityStep === "overview" ? (
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Security</h3>
                    <p className="text-sm opacity-60">Manage your password and account security.</p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => setSecurityStep("change-password")}
                      className="flex w-full items-center justify-between rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-yellow-400/70" />
                        <span className="text-sm font-medium">Change Password</span>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-30" />
                    </button>
                    <button className="flex w-full items-center justify-between rounded-2xl bg-white/5 p-4 transition hover:bg-white/10">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-blue-400/70" />
                        <span className="text-sm font-medium">Two-Factor Authentication</span>
                      </div>
                      <div className="text-[10px] font-bold uppercase text-red-500/70">Disabled</div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSecurityStep("overview")} className="opacity-40 hover:opacity-100">
                      <X className="h-5 w-5" />
                    </button>
                    <h3 className="text-lg font-semibold">Update Password</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[hsl(var(--pl-primary)/0.5)]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-50">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[hsl(var(--pl-primary)/0.5)]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Confirm New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[hsl(var(--pl-primary)/0.5)]" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setSecurityStep("overview")} className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold transition hover:bg-white/10">Cancel</button>
                    <button onClick={() => setSecurityStep("overview")} className="pl-btn-primary flex-1">Update Password</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Notifications View
 * ------------------------------------------------------------------------- */
function NotificationsView() {
  const NOTIFICATIONS = [
    { id: 1, title: "Evaluation Complete", desc: "Project 'AI-Vision' analysis is ready for review.", time: "10m ago", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
    { id: 2, title: "Security Vulnerability", desc: "High priority: 2 vulnerabilities found in 'Web-Core' dependencies.", time: "2h ago", icon: Shield, color: "text-red-400", bg: "bg-red-500/10" },
    { id: 3, title: "GitHub Sync Success", desc: "Repository index updated successfully.", time: "5h ago", icon: GitHub, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: 4, title: "New AI Model Available", desc: "Lens-Core v4.2 is now available for deep analysis.", time: "1d ago", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { id: 5, title: "System Update", desc: "ProjectLens dashboard underwent scheduled maintenance.", time: "2d ago", icon: Settings, color: "text-slate-400", bg: "bg-slate-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Notifications Center</h1>
        <p className="text-sm opacity-60">Keep track of your project evaluations and system updates.</p>
      </div>

      <div className="pl-glass overflow-hidden rounded-3xl">
        <div className="divide-y divide-white/5">
          {NOTIFICATIONS.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="group flex items-start gap-4 p-6 transition hover:bg-white/[0.02]">
                <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.bg} ${n.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold">{n.title}</h4>
                    <span className="text-[10px] opacity-40">{n.time}</span>
                  </div>
                  <p className="text-sm leading-relaxed opacity-60">{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [user, setUser] = useState({
    name: "Bhuvana Shri",
    email: "bhuvana@example.com",
    bio: "AI enthusiast and full-stack developer passionate about building intelligent systems."
  });

  return (
    <div className="pl-root flex w-full">
      <PageStyles />
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        active={activeNav}
        onSelect={(key) => setActiveNav(key)}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar 
          onMenu={() => setSidebarOpen(true)} 
          onViewAllNotifs={() => setActiveNav("notifications")}
          onNavigate={(key) => setActiveNav(key)}
          user={user}
        />
        <main className="flex-1 px-4 py-8 md:px-8 md:py-12">
          <div className="mx-auto w-full max-w-5xl">
            {activeNav === "dashboard" && (
              <>
                {stage === "idle"    && <AnalyzeForm  onAnalyze={() => setStage("loading")} />}
                {stage === "loading" && <LoadingState onDone={()    => setStage("results")} />}
                {stage === "results" && <AnalysisResults onReset={() => setStage("idle")}   />}
              </>
            )}
            {activeNav === "settings" && <SettingsView user={user} onUpdate={(data) => setUser(data)} />}
            {activeNav === "notifications" && <NotificationsView />}
            {activeNav === "history" && (
              <div className="pl-glass rounded-3xl p-12 text-center">
                <History className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <h2 className="text-2xl font-bold">Analysis History</h2>
                <p className="mt-2 opacity-60">You haven't analyzed any projects yet.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
