import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePost } from "@/hooks/use-blog";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, ArrowLeft, Clock, Calendar, Share2, Link2, Check, Eye, ThumbsUp, Heart, List, Globe, ChevronDown, X, RotateCcw } from "lucide-react";
import { SiWhatsapp, SiX } from "react-icons/si";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { SeoHead } from "@/components/seometa/SeoHead";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { renderRichContent } from "@/components/ui/rich-text-editor";

function estimateReadTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const TRANSLATE_LANGS = [
  { code: "en", label: "English" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh-CN", label: "中文（简体）" },
  { code: "ar", label: "العربية" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";
  const { t, language } = useLanguage();
  const dateLocale = language === "id" ? "id-ID" : "en-US";

  const { data: post, isLoading } = usePost(slug);
  const [copied, setCopied] = useState(false);
  const [liveViewCount, setLiveViewCount] = useState<number | null>(null);
  const [liveReactions, setLiveReactions] = useState<{ thumbsUp: number; heart: number } | null>(null);
  const [userReacted, setUserReacted] = useState<{ thumbsUp: boolean; heart: boolean }>({ thumbsUp: false, heart: false });
  const [activeHeading, setActiveHeading] = useState<string>("");

  const [showTranslate, setShowTranslate] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [currentLangCode, setCurrentLangCode] = useState<string | null>(null);
  const translationCache = useRef<Record<string, string>>({});
  const translateRef = useRef<HTMLDivElement>(null);

  const viewMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/blog/${slug}/view`),
    onSuccess: async (res) => {
      const data = await res.json();
      setLiveViewCount(data.viewCount);
    },
  });

  const reactMutation = useMutation({
    mutationFn: (type: string) => apiRequest("POST", `/api/blog/${slug}/react`, { type }),
    onSuccess: async (res, type) => {
      const data = await res.json();
      setLiveReactions(data.reactions);
      const newState = { ...userReacted, [type]: true };
      setUserReacted(newState);
      localStorage.setItem(`reactions-${slug}`, JSON.stringify(newState));
    },
  });

  useEffect(() => {
    if (!slug) return;
    viewMutation.mutate();
    try {
      const stored = localStorage.getItem(`reactions-${slug}`);
      if (stored) setUserReacted(JSON.parse(stored));
    } catch {}
  }, [slug]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (translateRef.current && !translateRef.current.contains(e.target as Node)) {
        setShowTranslate(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTranslate = useCallback(async (langCode: string) => {
    if (!post) return;
    setShowTranslate(false);

    if (currentLangCode === langCode && translatedContent) return;

    if (translationCache.current[langCode]) {
      setTranslatedContent(translationCache.current[langCode]);
      setCurrentLangCode(langCode);
      return;
    }

    setIsTranslating(true);
    try {
      const sourceHtml = renderRichContent(post.content);
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${sourceHtml}</div>`, "text/html");
      const container = doc.body.firstChild as HTMLElement;

      const blocks = Array.from(
        container.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, figcaption")
      );
      const blocksWithText = blocks.filter(el => (el.textContent?.trim() ?? "").length > 0);
      const segments = blocksWithText.map(el => el.textContent!.trim());

      const res = await apiRequest("POST", "/api/translate", {
        segments,
        from: "auto",
        to: langCode,
      });
      const data = await res.json();

      blocksWithText.forEach((block, i) => {
        if (data.segments?.[i]) {
          block.textContent = data.segments[i];
        }
      });

      const result = container.innerHTML;
      translationCache.current[langCode] = result;
      setTranslatedContent(result);
      setCurrentLangCode(langCode);
    } catch (err) {
      console.error("Translation failed", err);
    } finally {
      setIsTranslating(false);
    }
  }, [post, currentLangCode, translatedContent]);

  const handleShowOriginal = () => {
    setTranslatedContent(null);
    setCurrentLangCode(null);
  };

  const headings = useMemo(() => {
    if (!post) return [];
    return post.content
      .split("\n\n")
      .filter((p: string) => p.startsWith("# ") || p.startsWith("## "))
      .map((p: string) => {
        const isH2 = p.startsWith("## ");
        const text = isH2 ? p.slice(3) : p.slice(2);
        return { text, id: slugify(text), level: isH2 ? 2 : 1 };
      });
  }, [post]);

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-10% 0% -80% 0%", threshold: 0 }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  const pageUrl = `https://iamchomad.my.id/blog/${slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent((post?.title ?? "") + " — " + pageUrl)}`, "_blank", "noopener");
  };

  const shareX = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(post?.title ?? "")}&url=${encodeURIComponent(pageUrl)}`, "_blank", "noopener");
  };

  const hasToc = headings.length > 1;
  const currentLangLabel = TRANSLATE_LANGS.find(l => l.code === currentLangCode)?.label ?? null;

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <span className="font-serif text-2xl text-primary">?</span>
        </div>
        <p className="font-serif text-2xl font-bold mb-2">{t("blogpost.notFound")}</p>
        <Link href="/blog" className="text-sm font-semibold text-primary hover:underline" data-testid="link-back-blog">
          {t("blogpost.return")}
        </Link>
      </div>
      <Footer />
    </div>
  );

  const currentReactions = liveReactions ?? (post as any).reactions ?? { thumbsUp: 0, heart: 0 };
  const readTime = estimateReadTime(post.content);
  const viewCount = liveViewCount ?? (post as any).viewCount ?? 0;
  const displayHtml = translatedContent ?? renderRichContent(post.content);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={post.title}
        description={post.excerpt || post.content.slice(0, 160).replace(/\n/g, " ")}
        url={`/blog/${slug}`}
        type="article"
        image={post.imageUrl ?? undefined}
        article={{
          publishedTime: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
        }}
      />
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-10 lg:py-14">

        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors group"
          data-testid="link-back-to-blog"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> {t("blogpost.back")}
        </Link>

        {/* Cover Image */}
        {post.imageUrl && (
          <div className="mb-10 rounded-2xl overflow-hidden bg-muted soft-shadow-lg aspect-video">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Main layout */}
        <div className={hasToc ? "lg:grid lg:grid-cols-[1fr_210px] lg:gap-14 lg:items-start" : ""}>

          {/* ── Article ── */}
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={!hasToc ? "max-w-[720px] mx-auto" : ""}
          >

            {/* Header */}
            <header className="mb-10">
              {/* Tags */}
              {(post.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {(post.tags ?? []).map((tag: string) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-5" data-testid="text-post-title">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed mb-6 border-l-4 border-primary/40 pl-4">
                  {post.excerpt}
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-xs font-medium text-muted-foreground">
                  <Calendar size={12} />
                  {new Date(post.createdAt || Date.now()).toLocaleDateString(dateLocale, { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-xs font-medium text-muted-foreground">
                  <Clock size={12} />
                  {readTime} {t("blogpost.minRead")}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-xs font-medium text-muted-foreground" data-testid="text-view-count">
                  <Eye size={12} />
                  {viewCount.toLocaleString()} views
                </span>

                {/* Translate control */}
                {currentLangCode ? (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      <Globe size={12} />
                      {currentLangLabel}
                    </span>
                    <button
                      onClick={handleShowOriginal}
                      data-testid="button-show-original"
                      title="Show original"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-accent text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
                    >
                      <RotateCcw size={11} /> Original
                    </button>
                  </div>
                ) : (
                  <div className="relative" ref={translateRef}>
                    <button
                      onClick={() => setShowTranslate(v => !v)}
                      data-testid="button-translate"
                      disabled={isTranslating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                    >
                      {isTranslating ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Globe size={12} />
                      )}
                      {isTranslating ? (language === "id" ? "Menerjemahkan…" : "Translating…") : t("blogpost.translate")}
                      {!isTranslating && <ChevronDown size={10} className={`transition-transform ${showTranslate ? "rotate-180" : ""}`} />}
                    </button>

                    <AnimatePresence>
                      {showTranslate && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-2xl shadow-lg py-2 min-w-[186px]"
                        >
                          <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {t("blogpost.translateTo")}
                          </p>
                          {TRANSLATE_LANGS.map(lang => (
                            <button
                              key={lang.code}
                              onClick={() => handleTranslate(lang.code)}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-accent transition-colors text-foreground flex items-center justify-between group"
                            >
                              <span>{lang.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="mt-8 h-px bg-gradient-to-r from-border via-border/50 to-transparent" />
            </header>

            {/* ── Article Body ── */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentLangCode ?? "original"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="prose prose-lg dark:prose-invert prose-p:leading-[1.85] prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1 max-w-none article-content"
                  dangerouslySetInnerHTML={{ __html: displayHtml }}
                />
              </AnimatePresence>

              {/* Translating overlay */}
              <AnimatePresence>
                {isTranslating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/70 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center gap-3 z-10"
                  >
                    <Loader2 size={28} className="animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {language === "id" ? "Sedang menerjemahkan…" : "Translating article…"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Reactions ── */}
            <div className="mt-14 pt-8 border-t border-border/50">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
                {t("blogpost.helpful")}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => !userReacted.thumbsUp && reactMutation.mutate("thumbsUp")}
                  data-testid="button-react-thumbsup"
                  disabled={userReacted.thumbsUp}
                  className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                    userReacted.thumbsUp
                      ? "bg-primary/10 text-primary border-primary/30 cursor-default"
                      : "border-border bg-card text-foreground hover:bg-primary/8 hover:border-primary/30 hover:text-primary active:scale-95"
                  }`}
                >
                  <ThumbsUp size={16} className={userReacted.thumbsUp ? "fill-primary text-primary" : ""} />
                  <span>{currentReactions.thumbsUp ?? 0}</span>
                </button>
                <button
                  onClick={() => !userReacted.heart && reactMutation.mutate("heart")}
                  data-testid="button-react-heart"
                  disabled={userReacted.heart}
                  className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                    userReacted.heart
                      ? "bg-rose-50 text-rose-500 border-rose-200 cursor-default dark:bg-rose-500/10 dark:border-rose-500/30"
                      : "border-border bg-card text-foreground hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/30 active:scale-95"
                  }`}
                >
                  <Heart size={16} className={userReacted.heart ? "fill-rose-500 text-rose-500" : ""} />
                  <span>{currentReactions.heart ?? 0}</span>
                </button>
              </div>
            </div>

            {/* ── Share ── */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <Share2 size={12} /> {t("blogpost.share")}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  onClick={shareWhatsApp}
                  data-testid="button-share-whatsapp"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
                >
                  <SiWhatsapp size={14} /> WhatsApp
                </button>
                <button
                  onClick={shareX}
                  data-testid="button-share-x"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  <SiX size={13} /> Share on X
                </button>
                <button
                  onClick={handleCopy}
                  data-testid="button-copy-link"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    copied
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Link2 size={14} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all group">
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> {t("blogpost.more")}
              </Link>
            </div>
          </motion.article>

          {/* ── Table of Contents ── */}
          {hasToc && (
            <aside className="hidden lg:block" data-testid="toc-sidebar">
              <div className="sticky top-24">
                <div className="bg-card border border-border/60 rounded-2xl p-5 soft-shadow">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    <List size={12} /> On this page
                  </p>
                  <nav className="space-y-0.5">
                    {headings.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        data-testid={`toc-link-${h.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className={`block text-xs py-1.5 pl-3 border-l-2 rounded-r transition-all duration-150 ${
                          h.level === 2 ? "ml-2" : ""
                        } ${
                          activeHeading === h.id
                            ? "border-primary text-primary font-semibold bg-primary/5"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60"
                        }`}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Mini meta card */}
                <div className="mt-4 bg-card border border-border/60 rounded-2xl p-4 soft-shadow space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={12} className="text-primary" />
                    <span>{readTime} min read</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye size={12} className="text-primary" />
                    <span>{viewCount.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ThumbsUp size={12} className="text-primary" />
                    <span>{currentReactions.thumbsUp ?? 0} likes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Heart size={12} className="text-rose-400" />
                    <span>{currentReactions.heart ?? 0} hearts</span>
                  </div>
                </div>
              </div>
            </aside>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
