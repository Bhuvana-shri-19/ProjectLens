"use client";

import { useState } from "react";
import { Target, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import GoogleSignInButton from "../../components/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(form.email, form.password);
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 relative z-10">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center space-x-2 mb-8 group">
          <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">
            Project<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Lens</span>
          </span>
        </Link>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">Welcome Back!</h1>
        <p className="text-slate-400 text-sm mb-6">Sign in to continue your project evaluations.</p>

        {/* Error Alert */}
        {error && (
          <div className="max-w-sm w-full mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-red-400 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <div className="max-w-sm w-full space-y-4">
          {/* Google Sign-In Button */}
          <GoogleSignInButton
            text="continue_with"
            onSuccess={() => router.push("/dashboard")}
            onError={(err) => setError(err)}
          />

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-slate-700/60 w-full" />
            <span className="bg-[#020817] px-3 text-[11px] font-semibold uppercase text-slate-500 tracking-wider whitespace-nowrap">
              or sign in with email
            </span>
            <div className="border-t border-slate-700/60 w-full" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email ID</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-70 shadow-lg shadow-blue-500/20 text-sm active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signin" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/login-bg.jpg"
          alt="ProjectLens Login Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#020817]/20 to-[#020817]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/60 to-transparent" />
        {/* Overlay text */}
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="text-3xl font-bold text-white leading-tight mb-2">
            See Your Project Through an{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              Interviewer&apos;s Eyes
            </span>
          </h2>
          <p className="text-slate-300 text-sm">AI-powered feedback to make your projects interview-ready.</p>
        </div>
      </div>
    </div>
  );
}
