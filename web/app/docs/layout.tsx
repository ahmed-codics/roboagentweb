import Link from "next/link";
import { Search, BookOpen } from "lucide-react";
import { DOCS_NAV } from "@/lib/docs-nav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl gap-8 px-6 py-12">
      <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 overflow-y-auto pr-4 lg:block">
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-bg-surface px-3 py-2 text-sm text-ink-muted">
          <Search className="h-4 w-4" />
          <input
            placeholder="Search docs…"
            className="w-full bg-transparent outline-none placeholder:text-ink-dim"
          />
          <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-ink-dim">⌘K</kbd>
        </div>
        <nav className="mt-6 space-y-6 text-sm">
          {DOCS_NAV.map((g) => (
            <div key={g.title}>
              <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-dim">
                {g.title}
              </div>
              <ul className="space-y-0.5">
                {g.links.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={`/docs${l.slug ? `/${l.slug}` : ""}`}
                      className="block rounded-md px-2 py-1.5 text-ink-muted hover:bg-white/[0.04] hover:text-ink"
                    >
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <article className="min-w-0 flex-1">
        <div className="mb-4 flex items-center gap-2 text-xs text-ink-dim">
          <BookOpen className="h-3.5 w-3.5" /> Documentation
        </div>
        <div className="prose prose-invert max-w-none">
          {children}
        </div>
      </article>
      <aside className="sticky top-20 hidden h-fit w-48 shrink-0 xl:block">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim">On this page</div>
        <ul className="mt-3 space-y-1.5 border-l border-white/10 text-sm">
          <li><a className="block border-l-2 border-cyan-glow pl-3 text-ink" href="#overview">Overview</a></li>
          <li><a className="block pl-3 text-ink-muted hover:text-ink" href="#concepts">Concepts</a></li>
          <li><a className="block pl-3 text-ink-muted hover:text-ink" href="#next-steps">Next steps</a></li>
        </ul>
      </aside>
    </div>
  );
}
