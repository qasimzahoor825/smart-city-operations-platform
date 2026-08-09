import React from "react";
import { publicGet, type PublicNewsArticle } from "@/services/public-api";

// Render on the server per request so live announaints are always fresh.
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const articles = (await publicGet<PublicNewsArticle[]>("/news/public")) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Municipal News & Bulletins</h1>
        <p className="text-slate-500 text-sm mt-1">
          Official announcements, press releases, and city updates published from the live news feed.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-slate-500 text-sm">
          No announcements have been published yet. Check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <article key={article.id} className="glass-card rounded-2xl p-6 flex flex-col space-y-3">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold uppercase tracking-wide">
                  {article.category}
                </span>
                <span className="text-slate-500">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : null}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{article.title}</h3>
              <p className="text-xs text-slate-500 flex-1">{article.summary}</p>
              <p className="text-[11px] text-slate-500">
                {article.authorName ? `By ${article.authorName}` : ""}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}