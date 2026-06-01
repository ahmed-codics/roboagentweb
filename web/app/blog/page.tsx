import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

const CATEGORIES = ["All", "ROS2", "AI", "Robotics", "Embedded", "Simulation"] as const;

const POSTS = [
  {
    slug: "launch-ir-deep-dive",
    title: "How RoboAgent symbolically executes your launch files",
    date: "2026-05-04",
    cat: "ROS2",
    excerpt:
      "Why pattern-matching .launch.py files breaks for any non-trivial workspace — and how we built a symbolic executor that respects every IfCondition, PathJoinSubstitution, and nested IncludeLaunchDescription.",
    read: "12 min",
  },
  {
    slug: "qos-mismatches",
    title: "The 9 QoS mismatches that silently break your robot",
    date: "2026-04-27",
    cat: "ROS2",
    excerpt: "Best-effort vs reliable, late-joining subscribers, deadline misses. Plus the matrix the agent uses to flag them automatically.",
    read: "9 min",
  },
  {
    slug: "sim-in-the-loop",
    title: "Why every fix should pass simulation before it lands",
    date: "2026-04-20",
    cat: "Simulation",
    excerpt: "Velocity without verification crashes robots. The case for closed-loop AI: propose, simulate, observe, iterate.",
    read: "8 min",
  },
  {
    slug: "micro-ros-cross-domain",
    title: "Cross-domain reasoning across micro-ROS",
    date: "2026-04-12",
    cat: "Embedded",
    excerpt: "Your STM32 publishes BestEffort. Nav2 expects Reliable. The bug is invisible until the IDE understands both sides.",
    read: "11 min",
  },
  {
    slug: "rkg-schema",
    title: "Designing the Robotics Knowledge Graph schema",
    date: "2026-04-05",
    cat: "AI",
    excerpt: "How we ontologize ROS2 — what's a node, a topic, a frame, a controller, a hardware interface — and why structure beats embeddings.",
    read: "14 min",
  },
  {
    slug: "tf-drift",
    title: "Detecting TF drift before it kills your AMR",
    date: "2026-03-28",
    cat: "Robotics",
    excerpt: "Why static_transform_publisher mistakes are still the #1 cause of warehouse robot pile-ups, and how the agent catches them in 4s.",
    read: "7 min",
  },
];

export default function BlogPage() {
  return (
    <>
      <Section className="pb-6">
        <SectionHeading
          eyebrow="Blog"
          title="Engineering notes from the robotics frontier."
          subtitle="Deep dives, post-mortems, and field reports from our team and the community."
        />
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-sm">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`rounded-full border px-3 py-1.5 transition ${
                c === "All"
                  ? "border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow"
                  : "border-white/10 text-ink-muted hover:border-white/20 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        {/* Featured */}
        <Link href={`/blog/${POSTS[0].slug}`} className="group">
          <Card className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
              <div className="p-8 md:p-10">
                <div className="text-xs uppercase tracking-wider text-cyan-glow">{POSTS[0].cat} · {POSTS[0].date} · {POSTS[0].read}</div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl group-hover:text-cyan-glow">{POSTS[0].title}</h2>
                <p className="mt-3 text-ink-muted">{POSTS[0].excerpt}</p>
              </div>
              <div className="relative min-h-[220px] bg-gradient-to-br from-bg-elevated to-bg overflow-hidden">
                <div className="absolute inset-0 bg-grid mask-radial opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-mono text-cyan-glow/20">{"</>"}</div>
                </div>
              </div>
            </div>
          </Card>
        </Link>

        {/* Grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.slice(1).map((p) => (
            <Link href={`/blog/${p.slug}`} key={p.slug} className="group">
              <Card className="h-full p-6">
                <div className="text-xs uppercase tracking-wider text-cyan-glow">{p.cat}</div>
                <h3 className="mt-3 text-lg font-semibold leading-snug text-ink group-hover:text-cyan-glow">{p.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{p.excerpt}</p>
                <div className="mt-4 text-xs text-ink-dim">{p.date} · {p.read}</div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
