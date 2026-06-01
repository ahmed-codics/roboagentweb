import Link from "next/link";
import { Github, MessageCircle, Twitter } from "lucide-react";
import { Logo } from "./Logo";

const groups = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/download", label: "Download" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs/getting-started", label: "Getting Started" },
      { href: "/blog", label: "Blog" },
      { href: "/docs/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/contact#enterprise", label: "Enterprise" },
      { href: "/contact#partnerships", label: "Partnerships" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/security", label: "Security" },
      { href: "/legal/dpa", label: "DPA" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-ink-muted">
              The AI-native development environment for ROS2, embedded systems,
              and autonomous robots. Understand your robot. Not just your code.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="https://github.com/roboagent" aria-label="GitHub" className="rounded-md p-2 text-ink-muted hover:bg-white/[0.04] hover:text-ink"><Github className="h-4 w-4" /></Link>
              <Link href="https://discord.gg/roboagent" aria-label="Discord" className="rounded-md p-2 text-ink-muted hover:bg-white/[0.04] hover:text-ink"><MessageCircle className="h-4 w-4" /></Link>
              <Link href="https://twitter.com/roboagent" aria-label="Twitter" className="rounded-md p-2 text-ink-muted hover:bg-white/[0.04] hover:text-ink"><Twitter className="h-4 w-4" /></Link>
            </div>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-dim">{g.title}</div>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ink-muted hover:text-ink">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-ink-dim md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} RoboAgent, Inc. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse-soft" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
