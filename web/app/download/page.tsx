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
    icon: <i className="fa-solid fa-terminal text-xl"></i>,
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
    icon: <i className="fa-solid fa-desktop text-xl"></i>,
    formats: [".exe (WSL2 helper)"],
    requirements: ["Windows 11 22H2+", "WSL2 with Ubuntu 22.04+", "Docker Desktop (for sim)", "16 GB RAM recommended"],
    installs: [
      { label: "Installer", code: `# inside WSL2\nwget https://dl.roboagent.ai/${VERSION}/roboagent.AppImage\nchmod +x roboagent.AppImage && ./roboagent.AppImage` },
    ],
  },
  {
    id: "macos",
    name: "macOS (remote)",
    icon: <i className="fa-brands fa-apple text-xl"></i>,
    formats: [".dmg (remote-only)"],
    requirements: ["macOS 13+", "Apple Silicon or Intel", "Ubuntu remote dev host (Tailscale, SSH)", "Native Mac build coming Q3"],
    installs: [
      { label: "Remote dev", code: `brew install --cask roboagent\nroboagent --remote ssh://you@robot-dev.lan` },
    ],
  },
];

const PACKAGES = [
  { icon: <i className="fa-solid fa-box"></i>, name: "AppImage", desc: "One-file Linux binary, runs anywhere." },
  { icon: <i className="fa-solid fa-box"></i>, name: ".deb", desc: "Native package for Ubuntu/Debian." },
  { icon: <i className="fa-brands fa-docker"></i>, name: "Docker", desc: "ghcr.io/roboagent/agent:" + VERSION + " — for headless sim and CI." },
  { icon: <i className="fa-solid fa-microchip"></i>, name: "VS Code extension", desc: "Coming Q3 2026 — RoboAgent inside your editor." },
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

        <div className="grid gap-6 lg:grid-cols-3">
          {OSCARDS.map((os) => (
            <div
              key={os.id}
              className={`relative rounded-2xl border p-7 transition-all duration-300 ${
                os.primary
                  ? "border-cyan-300 bg-white shadow-xl shadow-cyan-100/50"
                  : "border-slate-200 bg-white shadow-sm hover:shadow-md"
              }`}
            >
              {os.primary && (
                <div className="absolute -top-3.5 left-7 rounded-full bg-cyan-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-cyan-600/10">
                  Recommended
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
                  {os.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{os.name}</h3>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {os.formats.map((f) => (
                  <span key={f} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-600 font-semibold">
                    {f}
                  </span>
                ))}
              </div>

              <Button variant={os.primary ? "primary" : "secondary"} size="lg" className="mt-5 w-full" href={`/download/${os.id}`}>
                <i className="fa-solid fa-download"></i> Download for {os.name}
              </Button>

              <div className="mt-6 text-xs uppercase tracking-wider text-slate-400 font-bold">Requirements</div>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                {os.requirements.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-slate-300" />
                    <span>{r}</span>
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
            <div key={p.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 text-cyan-600 font-bold">
                {p.icon}
                <span className="font-bold text-slate-900">{p.name}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Latest release</h3>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              <div className="flex justify-between border-b border-slate-50 pb-2"><span>Version</span><span className="font-mono font-bold text-slate-900">{VERSION}</span></div>
              <div className="flex justify-between border-b border-slate-50 pb-2"><span>Released</span><span className="font-mono font-bold text-slate-900">{RELEASED}</span></div>
              <div className="flex justify-between border-b border-slate-50 pb-2"><span>Channel</span><span className="font-mono font-bold text-slate-900">stable</span></div>
              <div className="flex justify-between pb-1"><span>Min. ROS2</span><span className="font-mono font-bold text-slate-900">Humble</span></div>
            </div>
            <CodeBlock className="mt-5" filename="checksum" code={SHA} />
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Release notes — {VERSION}</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• Launch IR now resolves <code className="font-mono text-cyan-600 font-bold">PathJoinSubstitution</code> chains across nested includes.</li>
              <li>• Bag analyzer: 4× faster MCAP indexing on workspaces &gt; 200 packages.</li>
              <li>• Sim orchestrator: Ignition Harmonic supported alongside Fortress.</li>
              <li>• New tool: <code className="font-mono text-cyan-600 font-bold">debug.tf_tree</code> — diff URDF vs. live tree.</li>
              <li>• Fixes: rclpy memory leak on long-running sessions; Nav2 BT XML parser handles condition control.</li>
            </ul>
            <Button variant="ghost" className="mt-6" href="/docs/changelog">Full changelog →</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
