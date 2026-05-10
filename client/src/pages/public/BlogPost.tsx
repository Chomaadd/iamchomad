import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePost } from "@/hooks/use-blog";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, ArrowLeft, Clock, Calendar, Share2, Link2, Check, Eye, ThumbsUp, Heart, Globe, ChevronDown, RotateCcw, Zap } from "lucide-react";
import { SiWhatsapp, SiX } from "react-icons/si";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { SeoHead } from "@/components/seometa/SeoHead";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { renderRichContent } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";

function estimateReadTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const TRANSLATE_LANGS = [
  { code: "en",    label: "English",           flag: "🇬🇧" },
  { code: "id",    label: "Bahasa Indonesia",   flag: "🇮🇩" },
  { code: "ja",    label: "日本語",              flag: "🇯🇵" },
  { code: "ko",    label: "한국어",              flag: "🇰🇷" },
  { code: "zh-CN", label: "中文（简体）",         flag: "🇨🇳" },
  { code: "ar",    label: "العربية",            flag: "🇸🇦" },
  { code: "es",    label: "Español",            flag: "🇪🇸" },
  { code: "fr",    label: "Français",           flag: "🇫🇷" },
  { code: "de",    label: "Deutsch",            flag: "🇩🇪" },
];

/** Walk all non-empty text nodes in an element (preserves HTML structure) */
function extractTextNodes(root: Element): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if ((node as Text).textContent?.trim()) {
      nodes.push(node as Text);
    }
  }
  return nodes;
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const dateLocale = language === "id" ? "id-ID" : "en-US";

  const { data: post, isLoading } = usePost(slug);
  const [copied, setCopied] = useState(false);
  const [liveViewCount, setLiveViewCount] = useState<number | null>(null);
  const [liveReactions, setLiveReactions] = useState<{ thumbsUp: number; heart: number } | null>(null);
  const [userReacted, setUserReacted] = useState<{ thumbsUp: boolean; heart: boolean }>({ thumbsUp: false, heart: false });

  const [showTranslate, setShowTranslate] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const [floatingVisible, setFloatingVisible] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedExcerpt, setTranslatedExcerpt] = useState<string | null>(null);
  const [currentLangCode, setCurrentLangCode] = useState<string | null>(null);
  const translationCache = useRef<Record<string, { html: string; title: string; excerpt: string }>>({});
  const translateRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

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

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (translateRef.current && !translateRef.current.contains(e.target as Node)) {
        setShowTranslate(false);
      }
      if (floatingRef.current && !floatingRef.current.contains(e.target as Node)) {
        setShowFloating(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show floating button after scrolling 400px
  useEffect(() => {
    const onScroll = () => setFloatingVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTranslate = async (langCode: string, fromFloating = false) => {
    if (!post) return;
    setShowTranslate(false);
    setShowFloating(false);

    // Serve from cache instantly
    if (translationCache.current[langCode]) {
      const cached = translationCache.current[langCode];
      setTranslatedContent(cached.html);
      setTranslatedTitle(cached.title);
      setTranslatedExcerpt(cached.excerpt);
      setCurrentLangCode(langCode);
      return;
    }

    setIsTranslating(true);
    try {
      const sourceHtml = renderRichContent(post.content);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = sourceHtml;

      // ── Collect ALL text nodes (preserves bold/italic/code/links!) ──
      const allTextNodes = extractTextNodes(tempDiv);
      const nodeTexts = allTextNodes.map(n => n.textContent?.trim() || "");

      const titleText = post.title ?? "";
      const excerptText = post.excerpt ?? "";
      const hasExcerpt = excerptText.length > 0;

      const allSegments = [titleText, ...(hasExcerpt ? [excerptText] : []), ...nodeTexts];
      if (allSegments.length === 0) return;

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ segments: allSegments, from: "auto", to: langCode }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.segments) throw new Error("No segments returned");

      const newTitle = data.segments[0] ?? titleText;
      const newExcerpt = hasExcerpt ? (data.segments[1] ?? excerptText) : "";
      const bodyStart = hasExcerpt ? 2 : 1;

      // ── Write back to text nodes — HTML formatting is preserved! ──
      allTextNodes.forEach((node, i) => {
        const translated = data.segments[bodyStart + i];
        if (translated) node.textContent = translated;
      });

      const resultHtml = tempDiv.innerHTML;
      translationCache.current[langCode] = { html: resultHtml, title: newTitle, excerpt: newExcerpt };
      setTranslatedContent(resultHtml);
      setTranslatedTitle(newTitle);
      setTranslatedExcerpt(newExcerpt);
      setCurrentLangCode(langCode);
    } catch (err) {
      console.error("Translation failed:", err);
      toast({
        title: language === "id" ? "Terjemahan gagal" : "Translation failed",
        description: language === "id" ? "Periksa koneksi dan coba lagi." : "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleShowOriginal = () => {
    setTranslatedContent(null);
    setTranslatedTitle(null);
    setTranslatedExcerpt(null);
    setCurrentLangCode(null);
    setShowTranslate(false);
    setShowFloating(false);
  };

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

  const currentLangLabel = TRANSLATE_LANGS.find(l => l.code === currentLangCode)?.label ?? null;
  const currentLangFlag  = TRANSLATE_LANGS.find(l => l.code === currentLangCode)?.flag  ?? null;

  /* ── Language dropdown (shared between inline & floating) ── */
  const LanguageDropdown = ({ upward = false }: { upward?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: upward ? 6 : -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: upward ? 6 : -6, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`absolute ${upward ? "bottom-full mb-2" : "top-full mt-2"} right-0 z-50 bg-card border border-border rounded-2xl shadow-xl py-2 min-w-[210px]`}
    >
      <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {t("blogpost.translateTo")}
      </p>
      {TRANSLATE_LANGS.map(lang => {
        const isCached  = !!translationCache.current[lang.code];
        const isActive  = currentLangCode === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => handleTranslate(lang.code)}
            className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center gap-2.5 group ${
              isActive ? "bg-primary/8 text-primary font-semibold" : "hover:bg-accent text-foreground"
            }`}
          >
            <span className="text-sm leading-none shrink-0">{lang.flag}</span>
            <span className="flex-1">{lang.label}</span>
            {isCached && !isActive && (
              <Zap size={10} className="text-amber-500 shrink-0" title="Cached — instant" />
            )}
            {isActive && <Check size={11} className="text-primary shrink-0" />}
          </button>
        );
      })}

      {currentLangCode && (
        <>
          <div className="mx-4 my-1.5 h-px bg-border" />
          <button
            onClick={handleShowOriginal}
            className="w-full text-left px-4 py-2 text-xs hover:bg-accent transition-colors text-muted-foreground hover:text-foreground flex items-center gap-2.5"
          >
            <RotateCcw size={11} className="shrink-0" />
            {language === "id" ? "Tampilkan asli" : "Show original"}
          </button>
        </>
      )}
    </motion.div>
  );

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

        {/* ── Article ── */}
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[720px] mx-auto"
        >
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
              {translatedTitle ?? post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-6 border-l-4 border-primary/40 pl-4">
                {translatedExcerpt || post.excerpt}
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

              {/* ── Translate button (inline, always a dropdown) ── */}
              <div className="relative" ref={translateRef}>
                <button
                  onClick={() => setShowTranslate(v => !v)}
                  data-testid="button-translate"
                  disabled={isTranslating}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                    currentLangCode
                      ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                      : "bg-accent text-muted-foreground hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  {isTranslating ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : currentLangFlag ? (
                    <span className="text-sm leading-none">{currentLangFlag}</span>
                  ) : (
                    <Globe size={12} />
                  )}
                  {isTranslating
                    ? (language === "id" ? "Menerjemahkan…" : "Translating…")
                    : (currentLangLabel ?? t("blogpost.translate"))
                  }
                  {!isTranslating && (
                    <ChevronDown size={10} className={`transition-transform ${showTranslate ? "rotate-180" : ""}`} />
                  )}
                </button>

                <AnimatePresence>
                  {showTranslate && <LanguageDropdown />}
                </AnimatePresence>
              </div>
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
      </main>

      <Footer />

      {/* ── Floating Translate Pill ── */}
      <AnimatePresence>
        {floatingVisible && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-5 z-40"
            ref={floatingRef}
          >
            <div className="relative">
              <button
                onClick={() => setShowFloating(v => !v)}
                disabled={isTranslating}
                data-testid="button-translate-floating"
                className={`inline-flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-full shadow-lg border text-sm font-medium transition-all disabled:opacity-50 ${
                  currentLangCode
                    ? "bg-primary text-primary-foreground border-primary/50 hover:bg-primary/90 shadow-primary/20"
                    : "bg-card text-foreground border-border hover:border-primary/40 hover:shadow-xl"
                }`}
              >
                {isTranslating ? (
                  <Loader2 size={14} className="animate-spin shrink-0" />
                ) : currentLangFlag ? (
                  <span className="text-base leading-none shrink-0">{currentLangFlag}</span>
                ) : (
                  <Globe size={14} className="shrink-0" />
                )}
                <span className="max-w-[110px] truncate">
                  {isTranslating
                    ? (language === "id" ? "Menerjemahkan…" : "Translating…")
                    : (currentLangLabel ?? (language === "id" ? "Terjemahkan" : "Translate"))
                  }
                </span>
                <ChevronDown size={12} className={`shrink-0 transition-transform ${showFloating ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showFloating && <LanguageDropdown upward />}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
