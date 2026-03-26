import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SeoHead } from "@/components/seometa/SeoHead";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, X } from "lucide-react";
import type { NovelStory } from "@shared/schema";

const STATUS_COLOR: Record<string, string> = {
  ongoing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  hiatus: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default function Novel() {
  const { t } = useLanguage();
  const STATUS_LABEL: Record<string, string> = {
    ongoing: t("novel.status.ongoing"),
    completed: t("novel.status.completed"),
    hiatus: t("novel.status.hiatus"),
  };
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: stories, isLoading } = useQuery<NovelStory[]>({
    queryKey: ["/api/novel/stories"],
  });

  const categories = useMemo(() => {
    const cats = new Set<string>();
    stories?.forEach(s => cats.add(s.category));
    return Array.from(cats).sort();
  }, [stories]);

  const filtered = useMemo(() => {
    let result = stories ?? [];
    if (activeCategory) result = result.filter(s => s.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [stories, activeCategory, search]);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Novel"
        description="A collection of novels and comics, stories with a rich world and lively characters."
        url="/novel"
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen size={24} className="text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{t("novel.heading")}</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">{t("novel.description")}</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("novel.search.placeholder")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              data-testid="input-search-novel"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${!activeCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              data-testid="button-category-all"
            >
              {t("novel.filter.all")}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`px-3.5 py-2 rounded-full text-sm font-medium capitalize transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                data-testid={`button-category-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">{t("novel.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/novel/${story.slug}`} data-testid={`link-story-${story.id}`}>
                  <div className="group cursor-pointer">
                    {/* Cover */}
                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-muted relative">
                      {story.coverUrl ? (
                        <img
                          src={story.coverUrl}
                          alt={story.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <BookOpen size={32} className="text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      {/* Status badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[story.status] ?? STATUS_COLOR.ongoing}`}>
                          {STATUS_LABEL[story.status] ?? story.status}
                        </span>
                      </div>
                    </div>
                    {/* Info */}
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-1" data-testid={`text-story-title-${story.id}`}>
                      {story.title}
                    </h3>
                    <p className="text-xs text-muted-foreground capitalize mb-1">{story.category}</p>
                    {(story.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(story.tags ?? []).slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
