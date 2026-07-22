import Link from "next/link";
import Image from "next/image";

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group" aria-label="RoboAgent">
      <span className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute inset-0 rounded-md bg-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition" />
        <Image
          src="/logo.png"
          alt="RoboAgent"
          width={64}
          height={64}
          className="h-8 w-8 object-contain filter brightness-0 opacity-90"
          priority
        />
      </span>
      {/* Unbounded runs wide — drop a size step and pull tracking in hard so the
          wordmark occupies the same optical width the Inter version did. */}
      {!compact && (
        <span className="font-display font-bold tracking-[-0.045em] text-slate-900 text-lg">
          Robo<span className="text-cyan-600">Agent</span>
        </span>
      )}
    </Link>
  );
}
