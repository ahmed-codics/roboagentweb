import Link from "next/link";
import { AuthShell, OAuthButtons, Divider, Field } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to RoboAgent"
      subtitle={<>Welcome back. Continue where you left off.</>}
      footer={
        <>
          New to RoboAgent? <Link className="text-cyan-glow hover:underline" href="/register">Create an account</Link>
        </>
      }
    >
      <OAuthButtons />
      <Divider />
      <form className="grid gap-4">
        <Field label="Email" type="email" placeholder="you@robotics.co" />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          rightLink={
            <Link href="/forgot" className="text-xs text-ink-muted hover:text-ink">Forgot?</Link>
          }
        />
        <Button size="lg" className="w-full">Sign in</Button>
      </form>
    </AuthShell>
  );
}
