import { notFound } from "next/navigation";
import Link from "next/link";

import { DOCS_NAV } from "@/lib/docs-nav";
import { CodeBlock } from "@/components/CodeBlock";

function findEntry(slug: string) {
  for (const g of DOCS_NAV) {
    for (const l of g.links) {
      if (l.slug === slug) return { group: g, link: l };
    }
  }
  return null;
}

export async function generateStaticParams() {
  return DOCS_NAV.flatMap((g) =>
    g.links
      .filter((l) => l.slug)
      .map((l) => ({ slug: l.slug.split("/") }))
  );
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join("/");
  const entry = findEntry(path);
  if (!entry) notFound();

  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{entry.group.title}</div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{entry.link.title}</h1>
      <p className="mt-4 text-lg text-slate-600 leading-relaxed">
        This is a placeholder page for <code className="font-mono text-cyan-600 bg-cyan-50 px-1 py-0.5 rounded text-sm">{path}</code>.
        The full docs system loads MDX content from <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-sm">/content/docs/</code> at build time.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-tight text-slate-900">Example</h2>
      <CodeBlock
        className="mt-4"
        filename={`docs · ${path}`}
        code={`# placeholder snippet for ${entry.link.title}
roboagent ${path.replace(/\//g, " ")}`}
      />

      <h2 className="mt-12 text-2xl font-bold tracking-tight text-slate-900">Related</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {entry.group.links
          .filter((l) => l.slug !== path)
          .slice(0, 4)
          .map((l) => (
            <li key={l.slug}>
              <Link
                href={`/docs/${l.slug}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white shadow-sm p-4 text-slate-600 font-medium hover:border-cyan-400 hover:text-cyan-700 hover:shadow-md transition-all"
              >
                {l.title}
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
