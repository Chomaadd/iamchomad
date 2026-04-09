import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { usePosts, useCreatePost, useUpdatePost, useDeletePost } from "@/hooks/use-blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, FileText, ArrowLeft, Save, ImageIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import { RichTextEditor, renderRichContent } from "@/components/ui/rich-text-editor";
import { useLanguage } from "@/hooks/use-language";

type EditorView = "list" | "editor";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  tags: "",
  published: true,
};

export default function ManageBlog() {
  const { data: posts, isLoading } = usePosts();
  const { mutateAsync: createPost, isPending: isCreating } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isUpdating } = useUpdatePost();
  const { mutateAsync: deletePost } = useDeletePost();
  const { toast } = useToast();
  const { confirm: showConfirm, ConfirmDialog } = useConfirm();
  const { t } = useLanguage();

  const [view, setView] = useState<EditorView>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const isSaving = isCreating || isUpdating;

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
    });
    setView("editor");
  };

  const handleBack = () => {
    setView("list");
    setEditingId(null);
    setForm(emptyForm);
  };

  useEffect(() => {
    if (!editingId && form.title && !form.slug) {
      const generatedSlug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setForm(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.title, form.slug, editingId]);

  const parseTags = (raw: string) => raw.split(",").map(s => s.trim()).filter(Boolean);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.excerpt.trim()) {
      toast({ title: "Judul, slug, dan excerpt wajib diisi.", variant: "destructive" });
      return;
    }
    const tags = parseTags(form.tags);
    try {
      if (editingId) {
        const { title, slug, excerpt, content, imageUrl, published } = form;
        await updatePost({ id: editingId, title, slug, excerpt, content, imageUrl, published, tags });
        toast({ title: t("admin.blog.toast.updated") });
      } else {
        await createPost({ ...form, slug: form.slug.trim(), published: Boolean(form.published), tags });
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
     FULL-PAGE EDITOR VIEW
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
            {/* Published toggle */}
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, published: !p.published }))}
              data-testid="button-toggle-published"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                form.published
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-600/40"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {form.published ? <Eye size={12} /> : <EyeOff size={12} />}
              {form.published ? t("admin.blog.published") : t("admin.blog.draft")}
            </button>

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
          {/* ── Left: Main writing area ── */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Judul artikel..."
                data-testid="input-blog-title"
                className="w-full bg-transparent border-0 border-b border-border focus:border-primary outline-none text-3xl font-serif font-bold placeholder:text-muted-foreground/40 py-3 transition-colors resize-none"
              />
            </div>

            {/* Excerpt */}
            <div>
              <Textarea
                value={form.excerpt}
                onChange={e => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Tulis ringkasan artikel (excerpt)..."
                data-testid="input-blog-excerpt"
                className="w-full min-h-[72px] bg-transparent border-0 border-b border-border focus:border-primary outline-none text-base text-muted-foreground placeholder:text-muted-foreground/40 resize-none rounded-none px-0 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border/60" />

            {/* Rich text editor */}
            <RichTextEditor
              value={form.content}
              onChange={html => setForm({ ...form, content: html })}
              placeholder="Mulai tulis artikel kamu di sini..."
              minHeight={480}
            />
          </div>

          {/* ── Right: Metadata panel ── */}
          <div className="space-y-5 lg:sticky lg:top-6">
            {/* Slug */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("admin.blog.form.slug")}
              </Label>
              <Input
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                placeholder="url-artikel-kamu"
                data-testid="input-blog-slug"
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">iamchomad.my.id/blog/<span className="text-primary">{form.slug || "..."}</span></p>
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
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileUpload}
                  data-testid="input-blog-image"
                />
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
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-blog-title">
            {t("admin.blog.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {posts?.length || 0} {t("admin.blog.entries")}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2" data-testid="button-new-entry">
          <Plus size={16} /> {t("admin.blog.newEntry")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-5 py-3">{t("admin.blog.col.title")}</th>
                <th className="px-5 py-3">{t("admin.blog.col.status")}</th>
                <th className="px-5 py-3 hidden md:table-cell">{t("admin.blog.col.date")}</th>
                <th className="px-5 py-3 text-right">{t("admin.blog.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts?.map(post => (
                <tr key={post.id} className="hover:bg-muted/30 transition-colors group" data-testid={`row-post-${post.id}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{post.title}</p>
                        {(post.tags ?? []).length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(post.tags ?? []).slice(0, 3).map((tag: string) => (
                              <span key={tag} className="px-1.5 py-px rounded text-[10px] bg-muted text-muted-foreground font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[200px]">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      post.published
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {post.published ? t("admin.blog.published") : t("admin.blog.draft")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground text-xs hidden md:table-cell">
                    {new Date(post.createdAt || Date.now()).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
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
                  </td>
                </tr>
              ))}
              {posts?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground italic text-sm">
                    {t("admin.blog.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog />
    </AdminLayout>
  );
}
