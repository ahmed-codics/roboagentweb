import { Button } from "./ui/Button";

export function CTA() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl p-10 md:p-16">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="absolute -right-10 -bottom-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="relative max-w-2xl">
        <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">$ start_here</div>
        <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Ship robots, not workarounds.
        </h3>
        <p className="mt-4 text-lg text-slate-600">
          Download RoboAgent, point it at your <code className="font-mono text-cyan-600">ros2_ws</code>, and ask the
          first question. The agent does the rest.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/download" size="lg" variant="primary">
            <i className="fa-solid fa-download"></i> Download RoboAgent
          </Button>
          <Button href="/contact#enterprise" size="lg" variant="secondary">
            Talk to enterprise <i className="fa-solid fa-arrow-right"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
