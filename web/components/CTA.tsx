import { ArrowRight, Download } from "lucide-react";
import { Button } from "./ui/Button";

export function CTA() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-bg-elevated via-bg-surface to-bg p-10 md:p-16">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-glow/15 blur-3xl" />
      <div className="absolute -right-10 -bottom-20 h-72 w-72 rounded-full bg-accent-violet/15 blur-3xl" />
      <div className="relative max-w-2xl">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-glow">$ start_here</div>
        <h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
          Ship robots, not workarounds.
        </h3>
        <p className="mt-4 text-ink-muted">
          Download RoboAgent, point it at your <code className="font-mono text-cyan-glow">ros2_ws</code>, and ask the
          first question. The agent does the rest.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/download" size="lg" variant="primary">
            <Download className="h-4 w-4" /> Download RoboAgent
          </Button>
          <Button href="/contact#enterprise" size="lg" variant="outline">
            Talk to enterprise <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
