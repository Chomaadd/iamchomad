import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { usePosts, useCreatePost, useUpdatePost, useDeletePost } from "@/hooks/use-blog";
import { Button, Input, Textarea, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor, renderRichContent } from "@/components/ui/rich-text-editor";

export default function ManageBlog() {
  const { data: posts, isLoading } = usePosts();
  const { mutateAsync: createPost } = useCreatePost();
  const { mutateAsync: updatePost } = useUpdatePost();
  const { mutateAsync: deletePost } = useDeletePost();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    tags: "",
    published: true
  });


  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm(prev => ({ ...prev, imageUrl: data.url }));
      toast({ title: "Image uploaded" });
    } catch (error) {
        console.error("Upload error:", error);
        toast({ title: "Upload failed", variant: "destructive" });
      } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", slug: "", excerpt: "", content: "", imageUrl: "", tags: "", published: true });
    setModalOpen(true);
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
      published: post.published
    });
    setModalOpen(true);
  };

  useEffect(() => {
    if (!editingId && form.title && !form.slug) {
      const generatedSlug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setForm(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.title, form.slug, editingId]);

  const parseTags = (raw: string) =>
    raw.split(",").map(t => t.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = parseTags(form.tags);
    try {
      if (editingId) {
        const { title, slug, excerpt, content, imageUrl, published } = form;
        await updatePost({ 
          id: editingId, 
          title, slug, excerpt, content, imageUrl, published, tags
        });
        toast({ title: "Entry updated successfully." });
      } else {
        await createPost({ ...form, slug: form.slug.trim(), published: Boolean(form.published), tags });
        toast({ title: "Entry created successfully." });
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Error saving entry", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await deletePost(id);
        toast({ title: "Entry deleted." });
      } catch (error) {
        toast({ title: "Error deleting entry", variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-blog-title">Blog Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">{posts?.length || 0} entries total</p>
        </div>
        <Button onClick={openCreate} className="gap-2" data-testid="button-new-entry">
          <Plus size={16} /> New Entry
        </Button>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider border-b border-border">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 hidden md:table-cell">Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts?.map(post => (
              <tr key={post.id} className="hover:bg-muted/30 transition-colors group" data-testid={`row-post-${post.id}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0 border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0"><FileText size={16} className="text-muted-foreground" /></div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{post.title}</p>
                      {(post.tags ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(post.tags ?? []).slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-1.5 py-px rounded text-[10px] bg-muted text-muted-foreground font-medium">{tag}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-[200px]">{post.excerpt}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${post.published ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground text-xs hidden md:table-cell">{new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(post)} className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors" data-testid={`button-edit-post-${post.id}`}><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors" data-testid={`button-delete-post-${post.id}`}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {posts?.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground italic text-sm">No blog entries yet. Create your first one!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Entry" : "New Entry"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} data-testid="input-blog-title" />
          </div>
          <div>
            <Label>Slug</Label>
            <Input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} data-testid="input-blog-slug" />
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea className="min-h-[80px]" required value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} data-testid="input-blog-excerpt" />
          </div>
          <div>
            <Label>Content</Label>
            <RichTextEditor
              value={form.content}
              onChange={html => setForm({...form, content: html})}
              placeholder="Tulis konten artikel di sini..."
              minHeight={320}
            />
          </div>
          <div>
            <Label>Tags</Label>
            <Input
              value={form.tags}
              onChange={e => setForm({...form, tags: e.target.value})}
              placeholder="e.g. Technology, Design, Life (comma-separated)"
              data-testid="input-blog-tags"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate multiple tags with commas.</p>
          </div>
          <div>
            <Label>Cover Image</Label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} data-testid="input-blog-image" />
            <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="Or enter URL" className="mt-1" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="published" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4 accent-primary rounded" data-testid="input-blog-published" />
            <Label htmlFor="published">Published</Label>
          </div>
          <Button type="submit" className="w-full" disabled={uploading} data-testid="button-save-entry">
            {uploading ? "Uploading..." : "Save Entry"}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
