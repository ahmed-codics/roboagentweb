import Link from "next/link";
import { AuthShell, OAuthButtons, Divider, Field } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever for personal use. No credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link className="text-cyan-glow hover:underline" href="/login">Sign in</Link>
        </>
      }
    >
      <OAuthButtons />
      <Divider />
      <form className="grid gap-4">
        <Field label="Full name" placeholder="Maya Okafor" />
        <Field label="Work email" type="email" placeholder="you@robotics.co" />
        <Field label="Password" type="password" placeholder="At least 12 characters" />
        <label className="flex items-start gap-2 text-xs text-ink-muted">
          <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-bg-surface" />
          <span>
            I agree to the <Link href="/legal/terms" className="text-cyan-glow">Terms</Link> and{" "}
            <Link href="/legal/privacy" className="text-cyan-glow">Privacy Policy</Link>.
          </span>
        </label>
        <Button size="lg" className="w-full">Create account</Button>
      </form>
    </AuthShell>
  );
}
