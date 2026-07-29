"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import Logo from "@/components/Logo";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Couldn't start the Google sign-in request. Check GOOGLE_CLIENT_ID/SECRET in .env.",
  OAuthCallback: "Google rejected the callback — this is almost always a redirect URI mismatch. In Google Cloud Console, make sure the Authorized redirect URI is exactly http://localhost:3000/api/auth/callback/google (or your real domain in production).",
  OAuthCreateAccount: "Couldn't create an account from your Google profile. Try again or use email/password.",
  Callback: "Something went wrong finishing the sign-in. Please try again.",
  AccessDenied: "Google blocked this sign-in. If your OAuth consent screen is in \"Testing\" mode, add your Google account as a test user in Google Cloud Console.",
  Configuration: "Google sign-in isn't configured correctly on the server. Double-check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env, then restart the dev server.",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.5 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3c-7.5 0-14 4.2-17.7 10.4z"/>
      <path fill="#4CAF50" d="M24 45c5.3 0 10.2-2 13.9-5.3l-6.4-5.4C29.4 35.7 26.8 36.6 24 36.6c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.9 40.6 16.4 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.4 5.4C41.8 35.6 45 30.4 45 24c0-1.4-.1-2.5-.4-3.5z"/>
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    getProviders().then((providers) => {
      setGoogleAvailable(!!providers?.google);
    });
    const err = params.get("error");
    if (err) {
      setError(ERROR_MESSAGES[err] || `Sign-in error: ${err}`);
    }
  }, [params]);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
      }
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) throw new Error("Invalid email or password.");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute -left-32 top-10 h-[400px] w-[400px] animate-blob rounded-full bg-cyan/15 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-[420px] w-[420px] animate-blob rounded-full bg-violet/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card relative w-full max-w-md p-8"
      >
        <Link href="/" className="mb-8 flex flex-col items-center justify-center gap-2 font-display text-lg font-bold">
          <Logo size={70} />
          <div className="flex items-center gap-1">
            <span className="text-cyan">Nova</span>
            <span className="text-white">Convert</span>
          </div>
        </Link>

        <h1 className="text-center font-display text-2xl font-bold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-center text-sm text-ink-dim">
          {mode === "login" ? "Log in to keep converting." : "Start converting files in seconds."}
        </p>

        {googleAvailable === false && (
          <div className="mt-7 flex items-start gap-2 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-xs text-amber">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>Google sign-in isn't active yet — add a real <code>GOOGLE_CLIENT_SECRET</code> in <code>.env</code> and restart the server. See README.md for the exact steps.</span>
          </div>
        )}

        {googleAvailable !== false && (
          <button
            onClick={handleGoogle}
            disabled={googleLoading || googleAvailable === null}
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white/95 py-3 text-sm font-semibold text-[#1F1F1F] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>
        )}

        <div className="my-6 flex items-center gap-3 text-xs text-ink-faint">
          <div className="h-px flex-1 bg-line" />
          OR
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-line bg-void/50 px-4 py-3 text-sm outline-none transition-colors focus:border-cyan/60"
            />
          )}
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-line bg-void/50 px-4 py-3 text-sm outline-none transition-colors focus:border-cyan/60"
          />
          <div className="relative">
            <input
              required
              type={showPw ? "text" : "password"}
              placeholder="Password"
              minLength={mode === "signup" ? 8 : undefined}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-line bg-void/50 px-4 py-3 pr-11 text-sm outline-none transition-colors focus:border-cyan/60"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-dim"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === "login" && (
            <div className="flex items-center justify-between text-xs text-ink-dim">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-cyan" /> Remember me
              </label>
              <a href="#" className="hover:text-cyan-soft">Forgot password?</a>
            </div>
          )}

          {error && <p className="rounded-lg bg-rose/10 px-3 py-2 text-xs text-rose">{error}</p>}

          <button type="submit" disabled={loading} className="btn-gradient flex w-full items-center justify-center gap-2 !py-3">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-dim">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-cyan-soft hover:underline"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
