import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { usePosts, useCreatePost, useUpdatePost, useDeletePost } from "@/hooks/use-blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus, Edit2, Trash2, FileText, ArrowLeft, Save, ImageIcon,
  Loader2, Eye, Calendar, Clock, CheckCircle2, FileEdit, AlarmClock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import { RichTextEditor, renderRichContent } from "@/components/ui/rich-text-editor";
import { useLanguage } from "@/hooks/use-language";

type EditorView = "list" | "editor" | "preview";
type PublishMode = "draft" | "published" | "scheduled";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  tags: "",
  published: false,
  scheduledAt: "",
};

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return Math.max(1, Math.ceil(text.split(" ").length / 200));
}

function getDefaultSchedule(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function localToISO(localStr: string): string | null {
  if (!localStr) return null;
  return new Date(localStr).toISOString();
}

function isoToLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export default function ManageBlog() {
  const { data: posts, isLoading } = usePosts();
  const { mutateAsync: createPost, isPending: isCreating } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isUpdating } = useUpdatePost();
  const { mutateAsync: deletePost } = useDeletePost();
  const { toast } = useToast();
  const { confirm: showConfirm, ConfirmDialog } = useConfirm();
  const { t, language } = useLanguage();

  const [view, setView] = useState<EditorView>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const isSaving = isCreating || isUpdating;

  const publishMode: PublishMode = form.published
    ? "published"
    : form.scheduledAt
    ? "scheduled"
    : "draft";

  const setPublishMode = (mode: PublishMode) => {
    if (mode === "published") setForm(p => ({ ...p, published: true, scheduledAt: "" }));
    else if (mode === "draft") setForm(p => ({ ...p, published: false, scheduledAt: "" }));
    else setForm(p => ({ ...p, published: false, scheduledAt: p.scheduledAt || getDefaultSchedule() }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm(prev => ({ ...prev, imageUrl: data.url }));
      toast({ title: t("admin.toast.imageUploaded") });
    } catch {
      toast({ title: t("admin.toast.uploadFailed"), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setView("editor");
  };

  const openEdit = (post: any) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: renderRichContent(post.content),
      imageUrl: post.imageUrl || "",
      tags: (post.tags ?? []).join(", "),
      published: post.published,
      scheduledAt: isoToLocal(post.scheduledAt),
    });
    setSlugTouched(true);
    setView("editor");
  };

  const handleBack = () => {
    setView("list");
    setEditingId(null);
    setForm(emptyForm);
    setSlugTouched(false);
  };

  useEffect(() => {
    if (!editingId && !slugTouched && form.title) {
      const generatedSlug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setForm(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.title, editingId, slugTouched]);

  const parseTags = (raw: string) => raw.split(",").map(s => s.trim()).filter(Boolean);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.excerpt.trim()) {
      toast({ title: "Judul, slug, dan excerpt wajib diisi.", variant: "destructive" });
      return;
    }
    const tags = parseTags(form.tags);
    const scheduledAt = (!form.published && form.scheduledAt) ? localToISO(form.scheduledAt) : null;
    try {
      if (editingId) {
        const { title, slug, excerpt, content, imageUrl, published } = form;
        await updatePost({ id: editingId, title, slug, excerpt, content, imageUrl, published, scheduledAt, tags });
        toast({ title: t("admin.blog.toast.updated") });
      } else {
        await createPost({ ...form, slug: form.slug.trim(), published: Boolean(form.published), scheduledAt, tags });
        toast({ title: t("admin.blog.toast.created") });
      }
      handleBack();
    } catch {
      toast({ title: t("admin.blog.toast.error"), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm({
      title: t("admin.blog.confirm.title"),
      description: t("admin.confirm.undone"),
      confirmLabel: t("admin.confirm.delete"),
    });
    if (ok) {
      try {
        await deletePost(id);
        toast({ title: t("admin.blog.toast.deleted") });
      } catch {
        toast({ title: t("admin.blog.toast.deleteError"), variant: "destructive" });
      }
    }
  };

  /* ──────────────────────────────────────────────
     PREVIEW VIEW
  ────────────────────────────────────────────── */
  if (view === "preview") {
    const readTime = estimateReadTime(form.content);
    const tags = parseTags(form.tags);
    return (
      <AdminLayout>
        {/* Preview top bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <button
            onClick={() => setView("editor")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> {t("admin.blog.preview.back")}
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
            <Eye size={12} /> {t("admin.blog.preview.label")}
          </span>
        </div>

        {/* Simulated article */}
        <div className="max-w-[760px] mx-auto">
          {form.imageUrl && (
            <div className="rounded-2xl overflow-hidden mb-8 aspect-video bg-muted">
              <img src={form.imageUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.map(tag => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            {form.title || <span className="text-muted-foreground italic">Untitled</span>}
          </h1>

          {form.excerpt && (
            <p className="text-muted-foreground text-lg leading-relaxed italic mb-6 border-l-2 border-primary/30 pl-4">
              {form.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 pb-6 border-b border-border">
            <span>{new Date().toLocaleDateString(language === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>·</span>
            <span>{readTime} min read</span>
          </div>

          <div
            className="prose prose-lg dark:prose-invert prose-p:leading-[1.85] prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1 max-w-none article-content"
            dangerouslySetInnerHTML={{ __html: form.content }}
          />

          {/* Preview notice */}
          <div className="mt-12 py-3 px-4 rounded-xl bg-amber-500/8 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium text-center">
            {t("admin.blog.preview.notice")}
          </div>
        </div>

        <ConfirmDialog />
      </AdminLayout>
    );
  }

  /* ──────────────────────────────────────────────
     EDITOR VIEW
  ────────────────────────────────────────────── */
  if (view === "editor") {
    return (
      <AdminLayout>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-back-to-list"
            >
              <ArrowLeft size={16} />
              {t("admin.blog.title")}
            </button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm font-semibold text-foreground">
              {editingId ? t("admin.blog.modal.edit") : t("admin.blog.modal.new")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setView("preview")}
              className="gap-2"
              data-testid="button-preview-entry"
            >
              <Eye size={14} /> {t("admin.blog.preview.label")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving || uploading}
              className="gap-2"
              data-testid="button-save-entry"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isSaving ? t("admin.uploading") : t("admin.blog.form.save")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
          {/* ── Left: Writing area ── */}
          <div className="space-y-4">
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Judul artikel..."
              data-testid="input-blog-title"
              className="w-full bg-transparent border-0 border-b border-border focus:border-primary outline-none text-3xl font-serif font-bold placeholder:text-muted-foreground/40 py-3 transition-colors resize-none"
            />
            <Textarea
              value={form.excerpt}
              onChange={e => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Tulis ringkasan artikel (excerpt)..."
              data-testid="input-blog-excerpt"
              className="w-full min-h-[72px] bg-transparent border-0 border-b border-border focus:border-primary outline-none text-base text-muted-foreground placeholder:text-muted-foreground/40 resize-none rounded-none px-0 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
            />
            <div className="h-px bg-border/60" />
            <RichTextEditor
              value={form.content}
              onChange={html => setForm({ ...form, content: html })}
              placeholder="Mulai tulis artikel kamu di sini..."
              minHeight={480}
            />
          </div>

          {/* ── Right: Metadata panel ── */}
          <div className="space-y-4 lg:sticky lg:top-6">

            {/* Publish Settings */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("admin.blog.status.title")}
              </Label>
              <div className="grid grid-cols-3 rounded-lg border border-border overflow-hidden text-xs font-semibold">
                {(["draft", "published", "scheduled"] as PublishMode[]).map((mode, i) => {
                  const isActive = publishMode === mode;
                  const icons = [FileEdit, CheckCircle2, AlarmClock];
                  const Icon = icons[i];
                  const labels = [t("admin.blog.status.draft"), t("admin.blog.status.publish"), t("admin.blog.status.schedule")];
                  const activeColors = [
                    "bg-muted text-foreground",
                    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                    "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                  ];
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPublishMode(mode)}
                      data-testid={`button-publish-mode-${mode}`}
                      className={`flex flex-col items-center gap-1 py-2.5 transition-colors border-r last:border-r-0 border-border ${
                        isActive ? activeColors[i] : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{labels[i]}</span>
                    </button>
                  );
                })}
              </div>

              {publishMode === "scheduled" && (
                <div className="space-y-1.5">
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
                    data-testid="input-scheduled-at"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-[11px] text-muted-foreground">{t("admin.blog.schedule.hint")}</p>
                </div>
              )}
            </div>

            {/* Slug */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("admin.blog.form.slug")}
              </Label>
              <Input
                value={form.slug}
                onChange={e => {
                  setSlugTouched(true);
                  setForm({ ...form, slug: e.target.value });
                }}
                placeholder="url-artikel-kamu"
                data-testid="input-blog-slug"
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                iamchomad.my.id/blog/<span className="text-primary">{form.slug || "..."}</span>
              </p>
            </div>

            {/* Tags */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("admin.blog.form.tags")}
              </Label>
              <Input
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="Technology, Design, Life"
                data-testid="input-blog-tags"
              />
              <p className="text-[11px] text-muted-foreground">{t("admin.blog.form.tags.hint")}</p>
            </div>

            {/* Cover image */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("admin.blog.form.cover")}
              </Label>
              {form.imageUrl && (
                <div className="relative rounded-lg overflow-hidden aspect-video bg-muted">
                  <img src={form.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, imageUrl: "" }))}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80 transition"
                  >
                    ✕
                  </button>
                </div>
              )}
              <label
                htmlFor="cover-upload"
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                {uploading ? t("admin.uploading") : "Upload gambar"}
                <input id="cover-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} data-testid="input-blog-image" />
              </label>
              <Input
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                placeholder={t("admin.orUrl")}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        <ConfirmDialog />
      </AdminLayout>
    );
  }

  /* ──────────────────────────────────────────────
     LIST VIEW
  ────────────────────────────────────────────── */
  const publishedCount = posts?.filter(p => p.published).length || 0;
  const draftCount = posts?.filter(p => !p.published && !(p as any).scheduledAt).length || 0;
  const scheduledCount = posts?.filter(p => !p.published && (p as any).scheduledAt).length || 0;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-blog-title">
            {t("admin.blog.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{posts?.length || 0} {t("admin.blog.entries")}</p>
        </div>
        <Button onClick={openCreate} className="gap-2" data-testid="button-new-entry">
          <Plus size={16} /> {t("admin.blog.newEntry")}
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: t("admin.blog.stat.published"), count: publishedCount, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/8", icon: CheckCircle2 },
          { label: t("admin.blog.stat.draft"), count: draftCount, color: "text-muted-foreground", bg: "bg-muted/50", icon: FileEdit },
          { label: t("admin.blog.stat.scheduled"), count: scheduledCount, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/8", icon: AlarmClock },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label} className={`rounded-xl border border-border ${bg} px-4 py-3 flex items-center gap-3`}>
            <Icon size={18} className={color} />
            <div>
              <p className={`text-xl font-bold font-serif ${color}`}>{count}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts?.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl py-16 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm italic">{t("admin.blog.empty")}</p>
          <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
            <Plus size={14} /> {t("admin.blog.newEntry")}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {posts?.map(post => {
            const isScheduled = !post.published && (post as any).scheduledAt;
            const scheduledDate = isScheduled
              ? new Date((post as any).scheduledAt).toLocaleDateString(language === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
              : null;

            return (
              <div
                key={post.id}
                data-testid={`row-post-${post.id}`}
                className="group bg-card border border-border rounded-xl px-4 py-3.5 flex items-center gap-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
              >
                {/* Thumbnail */}
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-muted-foreground" />
                  </div>
                )}

                {/* Title + tags */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{post.title}</p>
                  {(post.tags ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(post.tags ?? []).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-1.5 py-px rounded text-[10px] bg-muted text-muted-foreground font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[280px]">{post.excerpt}</p>
                  )}
                </div>

                {/* Date info */}
                <div className="hidden md:flex flex-col items-end gap-1 shrink-0 text-right min-w-[120px]">
                  {isScheduled ? (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                      <AlarmClock size={11} />
                      <span>{scheduledDate}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                      <Clock size={11} />
                      <span>{new Date(post.createdAt || Date.now()).toLocaleDateString(language === "id" ? "id-ID" : "en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                  post.published
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : isScheduled
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {post.published ? (
                    <><CheckCircle2 size={10} /> {t("admin.blog.published")}</>
                  ) : isScheduled ? (
                    <><AlarmClock size={10} /> {t("admin.blog.scheduled")}</>
                  ) : (
                    <><FileEdit size={10} /> {t("admin.blog.draft")}</>
                  )}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { openEdit(post); setTimeout(() => setView("preview"), 50); }}
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    title={t("admin.blog.preview.label")}
                    data-testid={`button-preview-post-${post.id}`}
                  >
                    <Eye size={14} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => openEdit(post)}
                    className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                    data-testid={`button-edit-post-${post.id}`}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    data-testid={`button-delete-post-${post.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog />
    </AdminLayout>
  );
}
