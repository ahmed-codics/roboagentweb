"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell, OAuthButtons, Divider, Field } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Simulate login API call
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <AuthShell
      title="Sign in to RoboAgent"
      subtitle={<>Welcome back. Continue where you left off.</>}
      footer={
        <>
          New to RoboAgent?{" "}
          <Link className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline" href="/register">
            Create an account
          </Link>
        </>
      }
    >
      <OAuthButtons />
      <Divider />
      <form onSubmit={handleSubmit} className="grid gap-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 animate-fade-in">
            {error}
          </div>
        )}
        <Field
          label="Email"
          type="email"
          placeholder="you@robotics.co"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightLink={
            <Link href="/forgot" className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold">
              Forgot?
            </Link>
          }
        />
        <Button size="lg" className="w-full mt-2" type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
