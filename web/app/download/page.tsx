import { Download as DownloadIcon, Terminal, Package, Container, Apple, MonitorSmartphone, Cpu } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/CodeBlock";

const VERSION = "0.4.2";
const RELEASED = "2026-05-06";
const SHA = "sha256:9f3c…b71a";

const OSCARDS = [
  {
    id: "ubuntu",
    name: "Ubuntu / Linux",
    icon: <Terminal className="h-5 w-5" />,
    primary: true,
    formats: [".AppImage", ".deb", ".tar.gz"],
    requirements: ["Ubuntu 22.04 / 24.04", "x86_64 or arm64", "8 GB RAM minimum", "ROS2 Humble or Jazzy (optional but recommended)"],
    installs: [
      { label: "AppImage", code: `chmod +x RoboAgent-${VERSION}.AppImage\n./RoboAgent-${VERSION}.AppImage` },
      { label: ".deb (apt)", code: `sudo apt install ./roboagent_${VERSION}_amd64.deb\nroboagent` },
    ],
  },
  {
    id: "windows",
    name: "Windows (WSL2)",
    icon: <MonitorSmartphone className="h-5 w-5" />,
    formats: [".exe (WSL2 helper)"],
    requirements: ["Windows 11 22H2+", "WSL2 with Ubuntu 22.04+", "Docker Desktop (for sim)", "16 GB RAM recommended"],
    installs: [
      { label: "Installer", code: `# inside WSL2\nwget https://dl.roboagent.ai/${VERSION}/roboagent.AppImage\nchmod +x roboagent.AppImage && ./roboagent.AppImage` },
    ],
  },
  {
    id: "macos",
    name: "macOS (remote)",
    icon: <Apple className="h-5 w-5" />,
    formats: [".dmg (remote-only)"],
    requirements: ["macOS 13+", "Apple Silicon or Intel", "Ubuntu remote dev host (Tailscale, SSH)", "Native Mac build coming Q3"],
    installs: [
      { label: "Remote dev", code: `brew install --cask roboagent\nroboagent --remote ssh://you@robot-dev.lan` },
    ],
  },
];

const PACKAGES = [
  { icon: <Package className="h-4 w-4" />, name: "AppImage", desc: "One-file Linux binary, runs anywhere." },
  { icon: <Package className="h-4 w-4" />, name: ".deb", desc: "Native package for Ubuntu/Debian." },
  { icon: <Container className="h-4 w-4" />, name: "Docker", desc: "ghcr.io/roboagent/agent:" + VERSION + " — for headless sim and CI." },
  { icon: <Cpu className="h-4 w-4" />, name: "VS Code extension", desc: "Coming Q3 2026 — RoboAgent inside your editor." },
];

export default function DownloadPage() {
  return (
    <>
      <Section className="pb-10">
        <SectionHeading
          eyebrow={`v${VERSION} · released ${RELEASED}`}
          title="Download RoboAgent."
          subtitle="Linux-first, like the robots. Pick your platform — Ubuntu is the recommended path; Windows works through WSL2; macOS connects to a remote dev host."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {OSCARDS.map((os) => (
            <div
              key={os.id}
              className={`relative rounded-2xl border p-7 ${
                os.primary
                  ? "border-cyan-glow/40 bg-bg-surface shadow-glow"
                  : "border-white/10 bg-bg-surface/60"
              }`}
            >
              {os.primary && (
                <div className="absolute -top-3 left-7 rounded-full bg-cyan-glow px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-bg shadow-glow-sm">
                  Recommended
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-glow/10 text-cyan-glow ring-1 ring-cyan-glow/20">
                  {os.icon}
                </div>
                <h3 className="text-lg font-semibold">{os.name}</h3>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {os.formats.map((f) => (
                  <span key={f} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-ink-muted">
                    {f}
                  </span>
                ))}
              </div>

              <Button variant={os.primary ? "primary" : "secondary"} size="lg" className="mt-5 w-full" href={`/download/${os.id}`}>
                <DownloadIcon className="h-4 w-4" /> Download for {os.name}
              </Button>

              <div className="mt-6 text-xs uppercase tracking-wider text-ink-dim">Requirements</div>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
                {os.requirements.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-ink-dim" />
                    {r}
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-3">
                {os.installs.map((i) => (
                  <CodeBlock key={i.label} filename={`install · ${i.label}`} lang="bash" code={i.code} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-12">
        <SectionHeading title="Distribution formats" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((p) => (
            <div key={p.name} className="rounded-xl border border-white/10 bg-bg-surface/60 p-5">
              <div className="flex items-center gap-2 text-cyan-glow">{p.icon}<span className="font-medium text-ink">{p.name}</span></div>
              <p className="mt-2 text-sm text-ink-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-bg-surface/60 p-7">
            <h3 className="text-lg font-semibold">Latest release</h3>
            <div className="mt-3 grid gap-2 text-sm text-ink-muted">
              <div className="flex justify-between"><span>Version</span><span className="font-mono text-ink">{VERSION}</span></div>
              <div className="flex justify-between"><span>Released</span><span className="font-mono text-ink">{RELEASED}</span></div>
              <div className="flex justify-between"><span>Channel</span><span className="font-mono text-ink">stable</span></div>
              <div className="flex justify-between"><span>Min. ROS2</span><span className="font-mono text-ink">Humble</span></div>
            </div>
            <CodeBlock className="mt-5" filename="checksum" code={SHA} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-bg-surface/60 p-7">
            <h3 className="text-lg font-semibold">Release notes — {VERSION}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              <li>• Launch IR now resolves <code className="font-mono text-cyan-glow">PathJoinSubstitution</code> chains across nested includes.</li>
              <li>• Bag analyzer: 4× faster MCAP indexing on workspaces &gt; 200 packages.</li>
              <li>• Sim orchestrator: Ignition Harmonic supported alongside Fortress.</li>
              <li>• New tool: <code className="font-mono text-cyan-glow">debug.tf_tree</code> — diff URDF vs. live tree.</li>
              <li>• Fixes: rclpy memory leak on long-running sessions; Nav2 BT XML parser handles condition control.</li>
            </ul>
            <Button variant="ghost" className="mt-4" href="/docs/changelog">Full changelog →</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
