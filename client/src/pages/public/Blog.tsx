import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePosts } from "@/hooks/use-blog";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, ArrowRight, Clock, BookOpen } from "lucide-react";
import { SeoHead } from "@/components/seometa/SeoHead";

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function Blog() {
  const { data: posts, isLoading } = usePosts();
  const { t, language } = useLanguage();
  const dateLocale = language === "id" ? "id-ID" : "en-US";
  const publishedPosts = posts?.filter(post => post.published);

  const featuredPost = publishedPosts?.[0];
  const remainingPosts = publishedPosts?.slice(1);

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
          className="mb-12"
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

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
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
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-5">
                          {featuredPost.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                          {t("blog.readArticle")} <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {remainingPosts && remainingPosts.length > 0 && (
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

            {publishedPosts?.length === 0 && (
              <div className="text-center py-24 bg-card border border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={28} className="text-primary" />
                </div>
                <p className="font-serif text-xl font-bold">{t("blog.empty.title")}</p>
                <p className="text-sm text-muted-foreground mt-2">{t("blog.empty.desc")}</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
