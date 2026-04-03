import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePosts } from "@/hooks/use-blog";
import { ArrowRight, Sparkles, Clock, Eye } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { SeoHead } from "@/components/seometa/SeoHead";
import { useSiteSettings } from "@/hooks/use-settings";

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const statusColors = {
  open: "bg-emerald-500",
  busy: "bg-amber-500",
  unavailable: "bg-red-500",
};

const statusRingColors = {
  open: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  busy: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  unavailable: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function Home() {
  const { data: posts } = usePosts();
  const featuredPosts = posts?.slice(0, 3) || [];
  const { t, language } = useLanguage();
  const { data: settings } = useSiteSettings();
  const status = (settings?.availabilityStatus ?? "open") as "open" | "busy" | "unavailable";
  const statusLabelMap = {
    open: t("home.activity.openwork"),
    busy: t("home.activity.curentlybusy"),
    unavailable: t("home.activity.notavailable"),
  };
  const label = statusLabelMap[status];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoHead url="/" />
      <Navbar />

      <main>
        <section className="relative pt-16 pb-20 lg:pt-28 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-8 relative"
              >
                <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto overflow-hidden rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-background shadow-lg">
                  <img
                    src={settings?.adminAvatarUrl || "/image/hellomaddy.jpg"}
                    alt="Choiril Ahmad"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
                  <Sparkles size={16} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 ${statusRingColors[status]}`}
                data-testid="badge-availability"
              >
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusColors[status]}`} />
                {label}
              </motion.div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1] max-w-4xl mx-auto" data-testid="text-hero-heading">
                {t("home.heading")}
                <span className="gradient-text">{t("home.heading.highlight")}</span>{t("home.heading.end")}
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {t("home.description")}
              </p>

              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                  data-testid="link-cta-connect"
                >
                  {t("home.cta.connect")}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold border border-border hover:bg-accent transition-all rounded-full"
                  data-testid="link-cta-about"
                >
                  {t("home.cta.learn")}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">

            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-between items-end mb-12"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
                  <Sparkles size={11} /> {t("home.blog.label")}
                </div>
                <h2 className="font-serif text-3xl lg:text-4xl font-bold">{t("home.blog.heading")}</h2>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full border border-border text-sm font-semibold hover:bg-accent hover:border-primary/30 transition-all"
                data-testid="link-view-all-posts"
              >
                {t("home.blog.viewAll")} <ArrowRight size={15} />
              </Link>
            </motion.div>

            {/* Asymmetric editorial grid: big left + stacked right */}
            {featuredPosts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* Primary card — spans 3 cols */}
                {featuredPosts[0] && (
                  <motion.article
                    className="lg:col-span-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0 }}
                  >
                    <Link href={`/blog/${featuredPosts[0].slug}`} className="group block h-full" data-testid={`link-featured-post-${featuredPosts[0].slug}`}>
                      <div className="relative rounded-2xl overflow-hidden h-full soft-shadow-lg" style={{ minHeight: 360 }}>
                        {featuredPosts[0].imageUrl ? (
                          <img
                            src={featuredPosts[0].imageUrl}
                            alt={featuredPosts[0].title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-violet-500/15" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Top meta */}
                        <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                          {(featuredPosts[0].tags ?? []).length > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-semibold border border-white/20">
                              {(featuredPosts[0].tags ?? [])[0]}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/80 text-[10px] font-medium ml-auto">
                            <Clock size={10} /> {estimateReadTime(featuredPosts[0].content)} min
                          </span>
                        </div>

                        {/* Bottom content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <p className="text-white/45 text-[11px] mb-2">
                            {new Date(featuredPosts[0].createdAt).toLocaleDateString(language === "id" ? "id-ID" : "en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </p>
                          <h3 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight line-clamp-2 mb-3 group-hover:text-white/90 transition-colors">
                            {featuredPosts[0].title}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 group-hover:text-white group-hover:gap-2 transition-all">
                            {t("blog.readMore")} <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                )}

                {/* Secondary cards — stacked, spans 2 cols */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                  {featuredPosts.slice(1, 3).map((post, i) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex-1"
                    >
                      <Link href={`/blog/${post.slug}`} className="group block h-full" data-testid={`link-featured-post-${post.slug}`}>
                        <div className="bg-card border border-border/60 rounded-2xl overflow-hidden h-full flex flex-col hover:border-primary/20 hover:shadow-lg transition-all soft-shadow">
                          <div className="aspect-[16/8] overflow-hidden bg-muted relative">
                            {post.imageUrl ? (
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/8 to-violet-500/8 flex items-center justify-center font-serif text-muted-foreground/15 text-4xl italic">B</div>
                            )}
                            {(post.tags ?? []).length > 0 && (
                              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-background/85 backdrop-blur-sm text-foreground text-[9px] font-bold uppercase tracking-wider">
                                {(post.tags ?? [])[0]}
                              </span>
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-serif text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                              {post.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">{post.excerpt}</p>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString(language === "id" ? "id-ID" : "en-US", { month: "short", day: "numeric" })}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Clock size={10} /> {estimateReadTime(post.content)} min
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Eye size={10} /> {(post.viewCount ?? 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile view all */}
            <div className="mt-8 text-center sm:hidden">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {t("home.blog.viewAllPosts")} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
