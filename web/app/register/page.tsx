"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell, OAuthButtons, Divider, Field } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }

    if (!agree) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);

    // Simulate register API call
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever for personal use. No credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline" href="/login">
            Sign in
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
          label="Full name"
          placeholder="Maya Okafor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Field
          label="Work email"
          type="email"
          placeholder="you@robotics.co"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          placeholder="At least 12 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="flex items-start gap-2.5 text-xs text-slate-500 cursor-pointer select-none">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-slate-50 text-cyan-600 focus:ring-cyan-500/20"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link href="/legal/terms" className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <Button size="lg" className="w-full mt-2" type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
