import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SeoHead } from "@/components/seometa/SeoHead";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ChevronDown, ChevronRight, ArrowLeft, Clock } from "lucide-react";
import type { NovelStory, NovelSeason, NovelChapter } from "@shared/schema";

const STATUS_LABEL: Record<string, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
};
const STATUS_COLOR: Record<string, string> = {
  ongoing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  hiatus: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

function estimateReadTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

function SeasonAccordion({ story, season }: { story: NovelStory; season: NovelSeason }) {
  const [open, setOpen] = useState(true);

  const { data: chapters, isLoading } = useQuery<NovelChapter[]>({
    queryKey: ["/api/novel/seasons", season.id, "chapters"],
    queryFn: () => fetch(`/api/novel/seasons/${season.id}/chapters`).then(r => r.json()),
  });

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
        data-testid={`button-season-${season.id}`}
      >
        <div>
          <span className="font-semibold text-foreground">Season {season.seasonNumber}</span>
          <span className="ml-2 text-sm text-muted-foreground">— {season.title}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs">{chapters?.length ?? 0} bab</span>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>
      {open && (
        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-3">
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : chapters?.length === 0 ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">Belum ada bab yang dipublikasikan.</div>
          ) : (
            chapters?.map(ch => (
              <Link
                key={ch.id}
                href={`/novel/${story.slug}/season-${season.seasonNumber}/bab-${ch.chapterNumber}`}
                data-testid={`link-chapter-${ch.id}`}
              >
                <div className="px-5 py-3.5 hover:bg-muted/40 transition-colors flex items-center justify-between group cursor-pointer">
                  <div>
                    <span className="text-xs text-muted-foreground mr-2">Bab {ch.chapterNumber}</span>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors font-medium">{ch.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>{estimateReadTime(ch.content)} menit</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function NovelDetail() {
  const [, params] = useRoute("/novel/:slug");
  const slug = params?.slug ?? "";

  const { data: story, isLoading: storyLoading } = useQuery<NovelStory>({
    queryKey: ["/api/novel/stories", slug],
    queryFn: () => fetch(`/api/novel/stories/${slug}`).then(r => r.json()),
    enabled: !!slug,
  });

  const { data: seasons, isLoading: seasonsLoading } = useQuery<NovelSeason[]>({
    queryKey: ["/api/novel/stories", story?.id, "seasons"],
    queryFn: () => fetch(`/api/novel/stories/${story!.id}/seasons`).then(r => r.json()),
    enabled: !!story?.id,
  });

  const { data: stats } = useQuery<{ totalSeasons: number; totalChapters: number }>({
    queryKey: ["/api/novel/stories", story?.id, "stats"],
    queryFn: () => fetch(`/api/novel/stories/${story!.id}/stats`).then(r => r.json()),
    enabled: !!story?.id,
  });

  const isLoading = storyLoading || seasonsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row gap-8">
            <Skeleton className="w-48 aspect-[2/3] rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <p className="text-muted-foreground">Cerita tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={story.title}
        description={story.description ?? `Baca ${story.title} — cerita karya Choiril Ahmad.`}
        url={`/novel/${story.slug}`}
        image={story.coverUrl ?? undefined}
      />
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Back */}
        <Link href="/novel">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors" data-testid="button-back-novel">
            <ArrowLeft size={16} />
            Kembali ke daftar
          </button>
        </Link>

        {/* Story Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-8 mb-10"
        >
          {/* Cover */}
          <div className="w-full sm:w-48 flex-shrink-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted">
              {story.coverUrl ? (
                <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <BookOpen size={40} className="text-primary/40" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[story.status] ?? STATUS_COLOR.ongoing}`}>
                {STATUS_LABEL[story.status] ?? story.status}
              </span>
              <span className="text-xs text-muted-foreground capitalize bg-muted px-2.5 py-1 rounded-full">{story.category}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4" data-testid="text-story-title">{story.title}</h1>
            {story.description && (
              <p className="text-muted-foreground leading-relaxed mb-4">{story.description}</p>
            )}
            <div className="text-sm text-muted-foreground">
              <span>{stats?.totalSeasons ?? seasons?.length ?? 0} Season</span>
              <span className="mx-2">·</span>
              <span>{stats?.totalChapters ?? 0} Bab</span>
            </div>
          </div>
        </motion.div>

        {/* Seasons & Chapters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Daftar Bab</h2>
          {!seasons || seasons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-border rounded-xl">
              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
              <p>Belum ada season yang tersedia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {seasons.map(season => (
                <SeasonAccordion key={season.id} story={story} season={season} />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
