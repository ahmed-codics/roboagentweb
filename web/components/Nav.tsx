"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Github, Download } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/Button";
import { cn } from "@/lib/cn";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all",
        scrolled
          ? "border-b border-white/5 bg-bg/80 backdrop-blur-xl"
          : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-1.5 text-sm text-ink-muted transition hover:bg-white/[0.04] hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="https://github.com/roboagent"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-white/[0.04] hover:text-ink"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
          <Button variant="ghost" size="sm" href="/login">
            Sign in
          </Button>
          <Button variant="primary" size="sm" href="/download">
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
        </div>
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/5 bg-bg/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-white/[0.04] hover:text-ink"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Button variant="secondary" size="sm" href="/login">
                Sign in
              </Button>
              <Button variant="primary" size="sm" href="/download">
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
