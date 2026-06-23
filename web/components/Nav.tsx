"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Button } from "./ui/Button";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((winScroll / height) * 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-slate-200 bg-white/80 backdrop-blur-2xl shadow-xl shadow-slate-200/50"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div 
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-150 ease-out" 
        style={{ width: `${scrollProgress}%` }} 
      />
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 lg:gap-2 md:flex">
            {links.map((l) => {
              const isActive = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 hover:text-cyan-600",
                    isActive ? "bg-slate-100 text-cyan-600" : "text-slate-600"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="https://github.com/roboagent"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="GitHub"
          >
            <i className="fa-brands fa-github text-lg"></i>
          </Link>
          <Button variant="ghost" size="sm" href="/login">
            Sign in
          </Button>
          <Button variant="primary" size="sm" href="/download">
            <i className="fa-solid fa-download"></i> Download
          </Button>
        </div>
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <i className="fa-solid fa-xmark text-xl"></i> : <i className="fa-solid fa-bars text-xl"></i>}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-lg">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-6">
            {links.map((l) => {
              const isActive = l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-lg px-4 py-3 text-base font-semibold transition-colors hover:bg-slate-100 hover:text-cyan-600",
                    isActive ? "bg-slate-100 text-cyan-600" : "text-slate-700"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-6">
              <Button variant="secondary" size="lg" href="/login">
                Sign in
              </Button>
              <Button variant="primary" size="lg" href="/download">
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
