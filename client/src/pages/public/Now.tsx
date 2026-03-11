import { useNowItems } from "@/hooks/use-now";
import { useLanguage } from "@/hooks/use-language";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SeoHead } from "@/components/seometa/SeoHead";
import { motion } from "framer-motion";
import { ExternalLink, Zap } from "lucide-react";
import type { NowItem } from "@shared/schema";

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string }> = {
  project:   { emoji: "🔨", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  reading:   { emoji: "📚", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  listening: { emoji: "🎵", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  watching:  { emoji: "🎬", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
  note:      { emoji: "💭", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
};

const CATEGORY_ORDER = ["project", "reading", "listening", "watching", "note"];

function NowCard({ item }: { item: NowItem }) {
  const cfg = CATEGORY_CONFIG[item.category];
  const displayEmoji = item.emoji || cfg.emoji;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-border hover:shadow-md transition-all duration-300"
      data-testid={`card-now-${item.id}`}
    >
      {item.imageUrl ? (
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center bg-muted text-2xl">
          {displayEmoji}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm leading-tight">{item.title}</p>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors"
              data-testid={`link-now-external-${item.id}`}
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{item.description}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function Now() {
  const { t } = useLanguage();
  const { data: items = [], isLoading } = useNowItems();

  const activeItems = items.filter(i => i.isActive);

  const grouped = CATEGORY_ORDER.reduce<Record<string, NowItem[]>>((acc, cat) => {
    const catItems = activeItems.filter(i => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  const lastUpdated = activeItems.length > 0
    ? activeItems.reduce((latest, item) => {
        const d = new Date(item.updatedAt || 0);
        return d > latest ? d : latest;
      }, new Date(0))
    : null;

  return (
    <>
      <SeoHead
        title="Now — Choiril Ahmad"
        description={t("now.description")}
        url="https://iamchomad.my.id/now"
      />
      <Navbar />
      <main className="min-h-screen">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Zap size={12} className="fill-primary" />
              {t("now.badge")}
            </span>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">{t("now.heading")}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-3">{t("now.description")}</p>
            {lastUpdated && lastUpdated.getTime() > 0 && (
              <p className="text-xs text-muted-foreground/60 mb-12">
                {t("now.lastUpdated")}:{" "}
                {lastUpdated.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            )}
          </motion.div>

          {isLoading && (
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-3">
                  <div className="h-5 w-32 bg-muted rounded-full animate-pulse" />
                  <div className="h-20 bg-muted rounded-2xl animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && activeItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">⚡</p>
              <p className="text-muted-foreground">{t("now.empty.title")}</p>
              <p className="text-sm text-muted-foreground/60 mt-1">{t("now.empty.desc")}</p>
            </div>
          )}

          {!isLoading && Object.keys(grouped).length > 0 && (
            <div className="space-y-10">
              {CATEGORY_ORDER.filter(cat => grouped[cat]).map((cat, sectionIdx) => {
                const cfg = CATEGORY_CONFIG[cat];
                return (
                  <motion.section
                    key={cat}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIdx * 0.08 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                        {cfg.emoji} {t(`now.category.${cat}`)}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {grouped[cat].map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: sectionIdx * 0.08 + i * 0.05 }}
                        >
                          <NowCard item={item} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
