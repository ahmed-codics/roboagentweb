import Link from "next/link";
import { AuthShell, Field } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";

export default function ForgotPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send a reset link."
      footer={
        <>
          Remember it? <Link className="text-cyan-glow hover:underline" href="/login">Sign in</Link>
        </>
      }
    >
      <form className="grid gap-4">
        <Field label="Email" type="email" placeholder="you@robotics.co" />
        <Button size="lg" className="w-full">Send reset link</Button>
      </form>
    </AuthShell>
  );
}
