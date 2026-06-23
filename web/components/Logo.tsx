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
      {!compact && (
        <span className="font-bold tracking-tight text-slate-900 text-xl">
          Robo<span className="text-cyan-600">Agent</span>
        </span>
      )}
    </Link>
  );
}
