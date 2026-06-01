import Link from "next/link";
import Image from "next/image";

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group" aria-label="RoboAgent">
      <span className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute inset-0 rounded-md bg-cyan-glow/20 blur-md opacity-0 group-hover:opacity-100 transition" />
        <Image
          src="/logo.png"
          alt="RoboAgent"
          width={64}
          height={64}
          className="h-8 w-8 object-contain"
          priority
        />
      </span>
      {!compact && (
        <span className="font-semibold tracking-tight text-ink">
          Robo<span className="text-cyan-glow">Agent</span>
        </span>
      )}
    </Link>
  );
}
