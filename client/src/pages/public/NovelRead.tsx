import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { SeoHead } from "@/components/seometa/SeoHead";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, BookOpen, Clock, ChevronLeft } from "lucide-react";
import type { NovelChapter, NovelStory, NovelSeason } from "@shared/schema";
import { motion } from "framer-motion";

function estimateReadTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

export default function NovelRead() {
  const [, params] = useRoute("/novel/:slug/:seasonSlug/:chapterSlug");
  const slug = params?.slug ?? "";
  const seasonNum = Number(params?.seasonSlug?.replace("season-", "") ?? 1);
  const chapterNum = Number(params?.chapterSlug?.replace("bab-", "") ?? 1);

  const { data: chapter, isLoading } = useQuery<NovelChapter>({
    queryKey: ["/api/novel/read", slug, seasonNum, chapterNum],
    queryFn: () => fetch(`/api/novel/read/${slug}/season-${seasonNum}/bab-${chapterNum}`).then(r => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    }),
    enabled: !!slug && !isNaN(seasonNum) && !isNaN(chapterNum),
  });

  const { data: story } = useQuery<NovelStory>({
    queryKey: ["/api/novel/stories", slug],
    queryFn: () => fetch(`/api/novel/stories/${slug}`).then(r => r.json()),
    enabled: !!slug,
  });

  const { data: seasons } = useQuery<NovelSeason[]>({
    queryKey: ["/api/novel/stories", story?.id, "seasons"],
    queryFn: () => fetch(`/api/novel/stories/${story!.id}/seasons`).then(r => r.json()),
    enabled: !!story?.id,
  });

  const { data: chapterList } = useQuery<NovelChapter[]>({
    queryKey: ["/api/novel/seasons", chapter?.seasonId, "chapters"],
    queryFn: () => fetch(`/api/novel/seasons/${chapter!.seasonId}/chapters`).then(r => r.json()),
    enabled: !!chapter?.seasonId,
  });

  const currentSeason = seasons?.find(s => s.seasonNumber === seasonNum);
  const currentIndex = chapterList?.findIndex(c => c.chapterNumber === chapterNum) ?? -1;
  const prevChapter = currentIndex > 0 ? chapterList?.[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && chapterList && currentIndex < chapterList.length - 1 ? chapterList[currentIndex + 1] : null;

  const prevSeason = seasons?.find(s => s.seasonNumber === seasonNum - 1);
  const nextSeason = seasons?.find(s => s.seasonNumber === seasonNum + 1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-12 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <div className="space-y-3 pt-4">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </main>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">Bab tidak ditemukan atau belum dipublikasikan.</p>
          <Link href={`/novel/${slug}`}>
            <button className="mt-6 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity" data-testid="button-back-to-story">
              Kembali ke cerita
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`${chapter.title} — ${story?.title ?? slug}`}
        description={`Baca Bab ${chapter.chapterNumber}: ${chapter.title} dari ${story?.title ?? slug}.`}
        url={`/novel/${slug}/season-${seasonNum}/bab-${chapterNum}`}
      />
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 flex-wrap">
          <Link href="/novel"><span className="hover:text-foreground transition-colors cursor-pointer">Novel</span></Link>
          <ChevronLeft size={12} className="rotate-180" />
          <Link href={`/novel/${slug}`}><span className="hover:text-foreground transition-colors cursor-pointer">{story?.title ?? slug}</span></Link>
          <ChevronLeft size={12} className="rotate-180" />
          <span>Season {seasonNum}</span>
          <ChevronLeft size={12} className="rotate-180" />
          <span className="text-foreground font-medium">Bab {chapterNum}</span>
        </div>

        {/* Chapter Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pb-6 border-b border-border"
        >
          <p className="text-sm text-muted-foreground mb-1">Season {seasonNum} — {currentSeason?.title}</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3" data-testid="text-chapter-title">
            Bab {chapter.chapterNumber}: {chapter.title}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>~{estimateReadTime(chapter.content)} menit baca</span>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="prose prose-gray dark:prose-invert max-w-none"
          style={{ lineHeight: "1.9", fontSize: "1.0625rem" }}
          data-testid="text-chapter-content"
        >
          {chapter.content.split("\n").map((para, i) =>
            para.trim() ? (
              <p key={i} className="mb-5 text-foreground/90">
                {para}
              </p>
            ) : (
              <br key={i} />
            )
          )}
        </motion.div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between gap-4">
          {prevChapter ? (
            <Link href={`/novel/${slug}/season-${seasonNum}/bab-${prevChapter.chapterNumber}`}>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm" data-testid="button-prev-chapter">
                <ArrowLeft size={16} />
                <div className="text-left hidden sm:block">
                  <div className="text-xs text-muted-foreground">Sebelumnya</div>
                  <div className="font-medium line-clamp-1">Bab {prevChapter.chapterNumber}</div>
                </div>
              </button>
            </Link>
          ) : prevSeason ? (
            <Link href={`/novel/${slug}`}>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm" data-testid="button-prev-season">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Season {prevSeason.seasonNumber}</span>
              </button>
            </Link>
          ) : (
            <Link href={`/novel/${slug}`}>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm" data-testid="button-back-story">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Daftar Bab</span>
              </button>
            </Link>
          )}

          <Link href={`/novel/${slug}`}>
            <button className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors" title="Daftar bab" data-testid="button-chapter-list">
              <BookOpen size={18} />
            </button>
          </Link>

          {nextChapter ? (
            <Link href={`/novel/${slug}/season-${seasonNum}/bab-${nextChapter.chapterNumber}`}>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm" data-testid="button-next-chapter">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-muted-foreground">Selanjutnya</div>
                  <div className="font-medium line-clamp-1">Bab {nextChapter.chapterNumber}</div>
                </div>
                <ArrowRight size={16} />
              </button>
            </Link>
          ) : nextSeason ? (
            <Link href={`/novel/${slug}`}>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm" data-testid="button-next-season">
                <span className="hidden sm:inline">Season {nextSeason.seasonNumber}</span>
                <ArrowRight size={16} />
              </button>
            </Link>
          ) : (
            <div className="w-28" />
          )}
        </div>
      </main>
    </div>
  );
}
