import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePosts } from "@/hooks/use-blog";
import { useLanguage } from "@/hooks/use-language";
import { ArrowRight, Clock, BookOpen, Search, X, Eye, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SeoHead } from "@/components/seometa/SeoHead";

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function Blog() {
  const { data: posts, isLoading } = usePosts();
  const { t, language } = useLanguage();
  const dateLocale = language === "id" ? "id-ID" : "en-US";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const publishedPosts = useMemo(() => posts?.filter(p => p.published) ?? [], [posts]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    publishedPosts.forEach(p => (p.tags ?? []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [publishedPosts]);

  const filteredPosts = useMemo(() => {
    let result = publishedPosts;
    if (activeTag) result = result.filter(p => (p.tags ?? []).includes(activeTag));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        (p.tags ?? []).some(tag => tag.toLowerCase().includes(q))
      );
    }
    return result;
  }, [publishedPosts, activeTag, searchQuery]);

  const isFiltering = !!activeTag || !!searchQuery.trim();
  const featuredPost = isFiltering ? undefined : filteredPosts[0];
  const remainingPosts = isFiltering ? filteredPosts : filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Blog"
        description="Thoughts, stories, and ideas from Choiril Ahmad on entrepreneurship, software development, and creativity."
        url="/blog"
      />
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-24">

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5 uppercase tracking-wider">
                <BookOpen size={12} /> {t("blog.badge")}
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight" data-testid="text-blog-heading">
                {t("blog.heading")}
              </h1>
              <p className="text-muted-foreground mt-3 max-w-xl">
                {t("blog.description")}
              </p>
            </div>
            {publishedPosts.length > 0 && (
              <div className="shrink-0 text-right">
                <div className="text-5xl font-black text-foreground/8 leading-none select-none">
                  {String(publishedPosts.length).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">articles</div>
              </div>
            )}
          </div>
        </motion.header>

        {/* ── Search & Filter ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 space-y-4"
        >
          <div className="relative max-w-lg">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              data-testid="input-blog-search"
              className="w-full pl-11 pr-10 py-3 text-sm bg-card border border-border/60 rounded-2xl outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                data-testid="button-clear-search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2" data-testid="list-tag-filters">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                <Tag size={10} /> Tags:
              </span>
              <button
                onClick={() => setActiveTag(null)}
                data-testid="button-tag-all"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  !activeTag
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  data-testid={`button-tag-${tag}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    activeTag === tag
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="w-full h-[420px] rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ── Featured Post — full overlay ── */}
            {featuredPost && (
              <motion.article
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <Link href={`/blog/${featuredPost.slug}`} data-testid={`link-featured-${featuredPost.slug}`}>
                  <div className="group relative rounded-3xl overflow-hidden cursor-pointer" style={{ minHeight: 440 }}>
                    {/* Background image */}
                    {featuredPost.imageUrl ? (
                      <img
                        src={featuredPost.imageUrl}
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-violet-500/20 to-primary/10" />
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

                    {/* Featured badge */}
                    <div className="absolute top-6 left-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold border border-white/20">
                        <BookOpen size={11} /> {t("blog.featured")}
                      </span>
                    </div>

                    {/* Reading time top-right */}
                    <div className="absolute top-6 right-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white/80 text-xs font-medium">
                        <Clock size={11} /> {estimateReadTime(featuredPost.content)} {t("blog.minRead")}
                      </span>
                    </div>

                    {/* Bottom content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                      {(featuredPost.tags ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(featuredPost.tags ?? []).slice(0, 3).map(tag => (
                            <span key={tag} className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-white/50 text-xs mb-2">
                        {new Date(featuredPost.createdAt || Date.now()).toLocaleDateString(dateLocale, { month: "long", day: "numeric", year: "numeric" })}
                        <span className="mx-2">·</span>
                        <span className="inline-flex items-center gap-1"><Eye size={11} className="inline" /> {(featuredPost.viewCount ?? 0).toLocaleString()}</span>
                      </div>
                      <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors leading-tight max-w-2xl">
                        {featuredPost.title}
                      </h2>
                      <p className="text-white/65 text-sm leading-relaxed line-clamp-2 max-w-2xl mb-6">
                        {featuredPost.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-foreground text-sm font-semibold hover:bg-white/90 transition-all group/btn">
                        {t("blog.readArticle")} <ArrowRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {/* ── Divider ── */}
            {featuredPost && remainingPosts.length > 0 && (
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/60" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">More Articles</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/60" />
              </div>
            )}

            {/* ── Post Grid ── */}
            {remainingPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {remainingPosts.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: (i % 3) * 0.07 }}
                  >
                    <Link href={`/blog/${post.slug}`} className="group block h-full" data-testid={`link-blog-${post.slug}`}>
                      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden h-full flex flex-col hover:border-primary/20 hover:shadow-lg transition-all duration-300 soft-shadow">
                        {/* Image */}
                        <div className="aspect-[16/9] overflow-hidden bg-muted relative">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/8 to-violet-500/8 flex items-center justify-center font-serif text-muted-foreground/15 text-5xl italic">
                              B
                            </div>
                          )}
                          {/* Read time badge on image */}
                          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
                            <Clock size={10} /> {estimateReadTime(post.content)} {t("blog.minRead")}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          {/* Tags */}
                          {(post.tags ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(post.tags ?? []).slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[10px] font-semibold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <h3 className="font-serif text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                            {post.excerpt}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(post.createdAt || Date.now()).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Eye size={11} /> {(post.viewCount ?? 0).toLocaleString()}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                                {t("blog.readMore")} <ArrowRight size={13} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}

            {/* ── Empty State ── */}
            {filteredPosts.length === 0 && !isLoading && (
              <div className="text-center py-28 bg-card border border-dashed border-border/60 rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  {isFiltering ? <Search size={28} className="text-primary" /> : <BookOpen size={28} className="text-primary" />}
                </div>
                {isFiltering ? (
                  <>
                    <p className="font-serif text-xl font-bold">{t("blog.noResults")}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t("blog.noResults.hint")}</p>
                    <button
                      onClick={() => { setSearchQuery(""); setActiveTag(null); }}
                      className="mt-5 text-xs font-semibold text-primary hover:underline"
                    >
                      {t("blog.clearFilters")}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-serif text-xl font-bold">{t("blog.empty.title")}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t("blog.empty.desc")}</p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
