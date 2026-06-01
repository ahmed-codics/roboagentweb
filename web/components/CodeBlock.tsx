import { cn } from "@/lib/cn";

export function CodeBlock({
  code,
  lang = "bash",
  filename,
  className,
}: {
  code: string;
  lang?: string;
  filename?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-white/[0.07] bg-[#070b14] overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 text-[11px] font-mono text-ink-dim">
        <span>{filename ?? lang}</span>
        <span className="uppercase tracking-wider">{lang}</span>
      </div>
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed font-mono text-ink">
{code}
      </pre>
    </div>
  );
}
