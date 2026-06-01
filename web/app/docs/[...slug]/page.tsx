import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      <div className="text-xs uppercase tracking-wider text-ink-dim">{entry.group.title}</div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{entry.link.title}</h1>
      <p className="mt-3 text-ink-muted">
        This is a placeholder page for <code className="font-mono text-cyan-glow">{path}</code>.
        The full docs system loads MDX content from <code className="font-mono">/content/docs/</code> at build time.
      </p>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">Example</h2>
      <CodeBlock
        className="mt-4"
        filename={`docs · ${path}`}
        code={`# placeholder snippet for ${entry.link.title}
roboagent ${path.replace(/\//g, " ")}`}
      />

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">Related</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {entry.group.links
          .filter((l) => l.slug !== path)
          .slice(0, 4)
          .map((l) => (
            <li key={l.slug}>
              <Link
                href={`/docs/${l.slug}`}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-bg-surface/60 p-3 text-sm text-ink-muted hover:border-cyan-glow/30 hover:text-ink"
              >
                {l.title}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
