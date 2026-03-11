import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePosts } from "@/hooks/use-blog";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, ArrowRight, Clock, BookOpen, Search, X } from "lucide-react";
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
    if (activeTag) {
      result = result.filter(p => (p.tags ?? []).includes(activeTag));
    }
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
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
            <BookOpen size={14} /> {t("blog.badge")}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-blog-heading">
            {t("blog.heading")}
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-xl">
            {t("blog.description")}
          </p>
        </motion.header>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 space-y-4"
        >
          <div className="relative max-w-lg">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              data-testid="input-blog-search"
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-clear-search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2" data-testid="list-tag-filters">
              <button
                onClick={() => setActiveTag(null)}
                data-testid="button-tag-all"
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  !activeTag
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  data-testid={`button-tag-${tag}`}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    activeTag === tag
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Featured Post (only when not filtering) */}
            {featuredPost && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <Link href={`/blog/${featuredPost.slug}`} className="group block" data-testid={`link-featured-${featuredPost.slug}`}>
                  <div className="bg-card border border-border/60 rounded-2xl overflow-hidden hover-lift soft-shadow-lg">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="aspect-[4/3] lg:aspect-auto overflow-hidden bg-muted">
                        {featuredPost.imageUrl ? (
                          <img
                            src={featuredPost.imageUrl}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center font-serif text-muted-foreground/20 text-6xl italic">B</div>
                        )}
                      </div>
                      <div className="p-6 lg:p-10 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 w-fit">
                          {t("blog.featured")}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="font-medium">
                            {new Date(featuredPost.createdAt || Date.now()).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                          <span className="flex items-center gap-1"><Clock size={12} /> {estimateReadTime(featuredPost.content)} {t("blog.minRead")}</span>
                        </div>
                        <h2 className="font-serif text-2xl lg:text-3xl font-bold leading-tight group-hover:text-primary transition-colors mb-3">
                          {featuredPost.title}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                          {featuredPost.excerpt}
                        </p>
                        {(featuredPost.tags ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {(featuredPost.tags ?? []).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                          {t("blog.readArticle")} <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {/* Post Grid */}
            {remainingPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingPosts.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/blog/${post.slug}`} className="group block h-full" data-testid={`link-blog-${post.slug}`}>
                      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden h-full flex flex-col hover-lift soft-shadow hover:shadow-md transition-all">
                        <div className="aspect-[16/10] overflow-hidden bg-muted">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-violet-500/5 flex items-center justify-center font-serif text-muted-foreground/20 text-4xl italic">B</div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
                            <span className="font-medium">
                              {new Date(post.createdAt || Date.now()).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                            <span>{estimateReadTime(post.content)} {t("blog.minRead")}</span>
                          </div>
                          <h3 className="font-serif text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2 flex-1">
                            {post.excerpt}
                          </p>
                          {(post.tags ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {(post.tags ?? []).map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mt-4 group-hover:gap-2.5 transition-all">
                            {t("blog.readMore")} <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredPosts.length === 0 && !isLoading && (
              <div className="text-center py-24 bg-card border border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {isFiltering ? <Search size={28} className="text-primary" /> : <BookOpen size={28} className="text-primary" />}
                </div>
                {isFiltering ? (
                  <>
                    <p className="font-serif text-xl font-bold">No results found</p>
                    <p className="text-sm text-muted-foreground mt-2">Try a different search or category.</p>
                    <button
                      onClick={() => { setSearchQuery(""); setActiveTag(null); }}
                      className="mt-4 text-xs font-semibold text-primary hover:underline"
                    >
                      Clear filters
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
