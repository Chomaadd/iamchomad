import { useState, useEffect, useMemo } from "react";
import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePost } from "@/hooks/use-blog";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, ArrowLeft, Clock, Calendar, Share2, Link2, Check, Eye, ThumbsUp, Heart, List } from "lucide-react";
import { SiWhatsapp, SiX } from "react-icons/si";
import { Link } from "wouter";
import { motion } from "framer-motion";
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={post.title}
        description={post.excerpt || post.content.slice(0, 160).replace(/\n/g, " ")}
        url={`/blog/${slug}`}
        type="article"
        article={{
          publishedTime: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
        }}
      />
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
          data-testid="link-back-to-blog"
        >
          <ArrowLeft size={16} /> {t("blogpost.back")}
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-14 lg:items-start">

          {/* Article */}
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent">
                  <Calendar size={13} />
                  {new Date(post.createdAt || Date.now()).toLocaleDateString(dateLocale, { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent">
                  <Clock size={13} />
                  {estimateReadTime(post.content)} {t("blogpost.minRead")}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent" data-testid="text-view-count">
                  <Eye size={13} />
                  {(liveViewCount ?? (post as any).viewCount ?? 0).toLocaleString()} views
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4" data-testid="text-post-title">
                {post.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </header>

            {post.imageUrl && (
              <div className="mb-10 rounded-2xl overflow-hidden soft-shadow-lg aspect-video bg-muted">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div
              className="prose prose-lg dark:prose-invert prose-p:leading-loose prose-headings:font-serif prose-headings:font-bold prose-a:text-primary max-w-none"
              dangerouslySetInnerHTML={{ __html: renderRichContent(post.content) }}
            />

            {/* Reactions */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Was this helpful?
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => !userReacted.thumbsUp && reactMutation.mutate("thumbsUp")}
                  data-testid="button-react-thumbsup"
                  disabled={userReacted.thumbsUp}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    userReacted.thumbsUp
                      ? "bg-primary/10 text-primary border-primary/30 cursor-default"
                      : "border-border bg-card text-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-primary active:scale-95"
                  }`}
                >
                  <ThumbsUp size={15} className={userReacted.thumbsUp ? "fill-primary text-primary" : ""} />
                  <span>{currentReactions.thumbsUp ?? 0}</span>
                </button>
                <button
                  onClick={() => !userReacted.heart && reactMutation.mutate("heart")}
                  data-testid="button-react-heart"
                  disabled={userReacted.heart}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    userReacted.heart
                      ? "bg-rose-50 text-rose-500 border-rose-200 cursor-default dark:bg-rose-500/10 dark:border-rose-500/30"
                      : "border-border bg-card text-foreground hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/30 active:scale-95"
                  }`}
                >
                  <Heart size={15} className={userReacted.heart ? "fill-rose-500 text-rose-500" : ""} />
                  <span>{currentReactions.heart ?? 0}</span>
                </button>
              </div>
            </div>

            {/* Share */}
            <div className="mt-10 pt-8 border-t border-border/50 space-y-6">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  <Share2 size={13} /> Share this article
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={shareWhatsApp}
                    data-testid="button-share-whatsapp"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-200"
                  >
                    <SiWhatsapp size={15} /> WhatsApp
                  </button>
                  <button
                    onClick={shareX}
                    data-testid="button-share-x"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all duration-200"
                  >
                    <SiX size={14} /> Share on X
                  </button>
                  <button
                    onClick={handleCopy}
                    data-testid="button-copy-link"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      copied
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-card text-foreground hover:bg-accent hover:border-foreground/20"
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Link2 size={14} />}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
                <ArrowLeft size={16} /> {t("blogpost.more")}
              </Link>
            </div>
          </motion.article>

          {/* Table of Contents */}
          {headings.length > 1 && (
            <aside className="hidden lg:block" data-testid="toc-sidebar">
              <div className="sticky top-24">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  <List size={13} /> On this page
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
                      className={`block text-sm py-1.5 border-l-2 transition-all duration-200 ${
                        h.level === 2 ? "pl-3" : "pl-5"
                      } ${
                        activeHeading === h.id
                          ? "border-primary text-primary font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
