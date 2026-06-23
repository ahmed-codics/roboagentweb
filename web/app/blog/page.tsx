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
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-medium">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`rounded-full border px-4 py-1.5 transition shadow-sm ${
                c === "All"
                  ? "border-cyan-400 bg-cyan-50 text-cyan-700 font-bold"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        {/* Featured */}
        <Link href={`/blog/${POSTS[0].slug}`} className="group block">
          <Card className="overflow-hidden p-0 border-slate-200">
            <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr] h-full">
              <div className="p-10 flex flex-col justify-center">
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-600">{POSTS[0].cat} · <span className="text-slate-400">{POSTS[0].date}</span> · <span className="text-slate-400">{POSTS[0].read}</span></div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl group-hover:text-cyan-600 transition-colors text-slate-900">{POSTS[0].title}</h2>
                <p className="mt-4 text-lg text-slate-600 leading-relaxed">{POSTS[0].excerpt}</p>
              </div>
              <div className="relative min-h-[280px] bg-gradient-to-br from-slate-50 to-white overflow-hidden border-l border-slate-100">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-3xl bg-white shadow-xl border border-slate-100 flex items-center justify-center text-5xl font-mono text-cyan-500 transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500">{"</>"}</div>
                </div>
              </div>
            </div>
          </Card>
        </Link>

        {/* Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {POSTS.slice(1).map((p) => (
            <Link href={`/blog/${p.slug}`} key={p.slug} className="group block">
              <Card className="h-full p-8 flex flex-col border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-600 mb-4">{p.cat}</div>
                <h3 className="text-xl font-bold leading-snug text-slate-900 group-hover:text-cyan-600 transition-colors">{p.title}</h3>
                <p className="mt-3 text-base text-slate-600 leading-relaxed flex-1">{p.excerpt}</p>
                <div className="mt-6 pt-6 border-t border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex justify-between">
                  <span>{p.date}</span>
                  <span>{p.read}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
