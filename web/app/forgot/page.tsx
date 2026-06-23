"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell, Field } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    // Simulate reset link API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle={
        submitted
          ? "Check your inbox for a link to reset your password."
          : "Enter your email and we'll send a reset link."
      }
      footer={
        <>
          Remember it?{" "}
          <Link className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline" href="/login">
            Sign in
          </Link>
        </>
      }
    >
      {submitted ? (
        <div className="text-center py-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50 mb-4">
            <i className="fa-solid fa-circle-check text-2xl"></i>
          </div>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            We've sent a password reset link to <strong className="text-slate-800">{email}</strong>. It should arrive shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 text-sm font-bold text-cyan-600 hover:text-cyan-700 transition"
          >
            Resend link
          </button>
        </div>
      ) : (
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
          <Button size="lg" className="w-full mt-2" type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
