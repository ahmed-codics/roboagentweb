import Link from "next/link";

import { DOCS_NAV } from "@/lib/docs-nav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl gap-8 px-6 py-12">
      <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 overflow-y-auto pr-4 lg:block">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white shadow-sm px-3 py-2 text-sm text-slate-600 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            placeholder="Search docs…"
            className="w-full bg-transparent outline-none placeholder:text-slate-400 text-slate-900"
          />
          <kbd className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 font-medium">⌘K</kbd>
        </div>
        <nav className="mt-8 space-y-8 text-sm">
          {DOCS_NAV.map((g) => (
            <div key={g.title}>
              <div className="mb-3 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {g.title}
              </div>
              <ul className="space-y-1">
                {g.links.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={`/docs${l.slug ? `/${l.slug}` : ""}`}
                      className="block rounded-md px-2 py-1.5 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-cyan-600 uppercase tracking-widest">
          <i className="fa-solid fa-book-open text-xs"></i> Documentation
        </div>
        <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-cyan-600 hover:prose-a:text-cyan-500">
          {children}
        </div>
      </article>
      <aside className="sticky top-20 hidden h-fit w-48 shrink-0 xl:block">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">On this page</div>
        <ul className="mt-4 space-y-2 border-l border-slate-200 text-sm">
          <li><a className="block border-l-2 border-cyan-500 pl-4 text-cyan-600 font-semibold" href="#overview">Overview</a></li>
          <li><a className="block pl-4 text-slate-500 hover:text-slate-900 font-medium transition-colors" href="#concepts">Concepts</a></li>
          <li><a className="block pl-4 text-slate-500 hover:text-slate-900 font-medium transition-colors" href="#next-steps">Next steps</a></li>
        </ul>
      </aside>
    </div>
  );
}
