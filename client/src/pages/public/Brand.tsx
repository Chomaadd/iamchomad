import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBrandItems } from "@/hooks/use-brand";
import { ArrowUpRight, Layers, Star } from "lucide-react";
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

  const totalCount = (items?.length ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Brand"
        description="Brand projects and creative work by Choiril Ahmad — a showcase of design, identity, and visual storytelling."
        url="/brand"
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-14"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5 uppercase tracking-wider">
                <Layers size={12} /> {t("brand.badge")}
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-brand-heading">
                {t("brand.heading")}
              </h1>
              <p className="text-muted-foreground mt-3 max-w-xl">
                {t("brand.description")}
              </p>
            </div>
            {totalCount > 0 && (
              <div className="shrink-0 text-right">
                <div className="text-5xl font-black text-foreground/8 leading-none select-none">{String(totalCount).padStart(2, "0")}</div>
                <div className="text-xs text-muted-foreground font-medium mt-0.5">projects total</div>
              </div>
            )}
          </div>
        </motion.header>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="w-full h-[420px] rounded-3xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
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
                className="flex flex-wrap gap-2 mb-12"
              >
                <button
                  onClick={() => setActiveCategory(null)}
                  data-testid="button-category-all"
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    !activeCategory
                      ? "bg-foreground text-background border-foreground"
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
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}

            {/* ── Featured Items — Full-bleed overlay style ── */}
            {filteredFeatured.length > 0 && (
              <div className="space-y-5 mb-16">
                {filteredFeatured.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    data-testid={`card-brand-featured-${item.id}`}
                  >
                    <div className="group relative rounded-3xl overflow-hidden soft-shadow-lg" style={{ minHeight: 420 }}>
                      {/* Background image — full bleed */}
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-500/10" />
                      )}

                      {/* Gradient overlay — text readable */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                      {/* Corner badge */}
                      <div className="absolute top-6 left-6 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold border border-white/20">
                          <Star size={10} className="fill-amber-400 text-amber-400" /> Featured Partner
                        </span>
                        {item.category && (
                          <span className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold border border-white/20">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Bottom content */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-white/90 transition-colors">
                          {item.title}
                        </h2>
                        <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-2xl mb-6 line-clamp-2">
                          {item.description}
                        </p>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={`link-brand-featured-${item.id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-foreground text-sm font-semibold hover:bg-white/90 transition-all group/btn"
                          >
                            Visit Website
                            <ArrowUpRight size={15} className="group-hover/btn:rotate-12 transition-transform" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Divider */}
            {filteredFeatured.length > 0 && regularItems.length > 0 && (
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/60" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">All Brands</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/60" />
              </div>
            )}

            {/* ── Regular Items Grid ── */}
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
                    <div className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all duration-300 soft-shadow h-full flex flex-col">
                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden bg-muted/40 relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-violet-500/5">
                            <Layers size={30} className="text-muted-foreground/20" />
                          </div>
                        )}

                        {/* Category pill on image */}
                        {item.category && (
                          <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-sm text-foreground">
                            {item.category}
                          </span>
                        )}

                        {/* External link button */}
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
                        <h3 className="font-serif text-base font-bold leading-snug group-hover:text-primary transition-colors mb-1.5">
                          {item.title}
                        </h3>
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
