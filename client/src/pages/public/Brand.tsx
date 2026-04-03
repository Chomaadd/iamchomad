import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBrandItems } from "@/hooks/use-brand";
import { ArrowUpRight, Layers, Star, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import { SeoHead } from "@/components/seometa/SeoHead";

export default function Brand() {
  const { data: items, isLoading } = useBrandItems();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const catSet = new Set<string>();
    items?.forEach(item => { if (item.category) catSet.add(item.category); });
    return Array.from(catSet).sort();
  }, [items]);

  const featuredItems = useMemo(() => items?.filter(i => i.featured) ?? [], [items]);
  const regularItems = useMemo(() => {
    const nonFeatured = items?.filter(i => !i.featured) ?? [];
    return activeCategory ? nonFeatured.filter(i => i.category === activeCategory) : nonFeatured;
  }, [items, activeCategory]);

  const filteredFeatured = useMemo(() => {
    return activeCategory ? featuredItems.filter(i => i.category === activeCategory) : featuredItems;
  }, [featuredItems, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Brand"
        description="Brand projects and creative work by Choiril Ahmad — a showcase of design, identity, and visual storytelling."
        url="/brand"
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5 uppercase tracking-wider">
            <Layers size={12} /> {t("brand.badge")}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-brand-heading">
            {t("brand.heading")}
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-xl">
            {t("brand.description")}
          </p>
        </motion.header>

        {isLoading ? (
          <div className="space-y-16">
            <div className="bg-card border border-border/60 rounded-3xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <Skeleton className="min-h-[280px] lg:min-h-[380px] w-full" />
                <div className="p-8 lg:p-14 flex flex-col justify-center gap-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-28 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-9 w-3/4" />
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-5/6" />
                    <Skeleton className="h-3.5 w-2/3" />
                  </div>
                  <Skeleton className="h-4 w-28 mt-2" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Category Filter */}
            {categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-2 mb-14"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mr-1">
                  <SlidersHorizontal size={12} /> Filter:
                </div>
                <button
                  onClick={() => setActiveCategory(null)}
                  data-testid="button-category-all"
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    !activeCategory
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    data-testid={`button-category-${cat}`}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      activeCategory === cat
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Featured Items */}
            {filteredFeatured.length > 0 && (
              <div className="space-y-6 mb-18">
                {filteredFeatured.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    data-testid={`card-brand-featured-${item.id}`}
                  >
                    <div className="group relative bg-card border border-border/60 rounded-3xl overflow-hidden hover:border-primary/20 transition-all duration-500 soft-shadow hover:shadow-2xl">
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image */}
                        <div className="relative overflow-hidden bg-muted/40 order-2 lg:order-1" style={{ minHeight: 300 }}>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-violet-500/10">
                              <Layers size={40} className="text-muted-foreground/20" />
                            </div>
                          )}
                          {/* Vignette overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/10 pointer-events-none" />
                        </div>

                        {/* Info */}
                        <div className="p-8 lg:p-14 flex flex-col justify-center order-1 lg:order-2">
                          <div className="flex items-center gap-2 mb-5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                              <Star size={10} className="fill-amber-500 text-amber-500" /> Featured Partner
                            </span>
                            {item.category && (
                              <span className="px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-semibold border border-primary/15">
                                {item.category}
                              </span>
                            )}
                          </div>
                          <h2 className="font-serif text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                            {item.title}
                          </h2>
                          <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                            {item.description}
                          </p>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid={`link-brand-featured-${item.id}`}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all w-fit group/link"
                            >
                              Visit Website
                              <ArrowUpRight size={16} className="group-hover/link:rotate-12 transition-transform" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Divider */}
            {filteredFeatured.length > 0 && regularItems.length > 0 && (
              <div className="flex items-center gap-4 mb-10 mt-14">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/60" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">All Brands</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/60" />
              </div>
            )}

            {/* Regular Items Grid */}
            {regularItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {regularItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: (i % 3) * 0.07 }}
                    data-testid={`card-brand-${item.id}`}
                  >
                    <div className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all duration-300 soft-shadow h-full flex flex-col">
                      {/* Logo / Image */}
                      <div className="aspect-[4/3] overflow-hidden bg-muted/40 relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-violet-500/5">
                            <Layers size={30} className="text-muted-foreground/20" />
                          </div>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-3 right-3 bg-background/85 backdrop-blur-sm text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-primary hover:text-primary-foreground"
                            data-testid={`link-brand-external-${item.id}`}
                          >
                            <ArrowUpRight size={14} />
                          </a>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-serif text-base font-bold leading-snug group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          {item.category && (
                            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredFeatured.length === 0 && regularItems.length === 0 && (
              <div className="text-center py-28 bg-card border border-dashed border-border/60 rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Layers size={28} className="text-primary" />
                </div>
                <p className="font-serif text-xl font-bold">{t("brand.empty.title")}</p>
                <p className="text-sm text-muted-foreground mt-2">{t("brand.empty.desc")}</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
