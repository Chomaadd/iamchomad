import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { usePosts, useCreatePost, useUpdatePost, useDeletePost } from "@/hooks/use-blog";
import { Button, Input, Textarea, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManageBlog() {
  const { data: posts, isLoading } = usePosts();
  const { mutateAsync: createPost } = useCreatePost();
  const { mutateAsync: updatePost } = useUpdatePost();
  const { mutateAsync: deletePost } = useDeletePost();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    imageUrl: "",
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
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm(prev => ({ ...prev, imageUrl: data.url }));
      toast({ title: "Image uploaded" });
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", slug: "", excerpt: "", content: "", imageUrl: "", published: true });
    setModalOpen(true);
  };

  const openEdit = (post: any) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl || "",
      published: post.published
    });
    setModalOpen(true);
  };

  useEffect(() => {
    if (!editingId && form.title && !form.slug) {
      setForm(form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [form.title, form.slug, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePost({ id: editingId, data: form });
        toast({ title: "Entry updated successfully." });
      } else {
        await createPost(form);
        toast({ title: "Entry created successfully." });
      }
      setModalOpen(false);
    } catch (error) {
      toast({ title: "Error saving entry", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Blog Manager</h1>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} /> New Entry
        </Button>
      </div>

      <div className="border-2 border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground font-bold uppercase tracking-widest border-b-2 border-border">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {posts?.map(post => (
              <tr key={post.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4 font-serif font-bold text-lg">{post.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold uppercase ${post.published ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEdit(post)} className="p-2 border-2 border-border hover:bg-primary hover:text-primary-foreground transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(post.id)} className="p-2 border-2 border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Entry" : "New Entry"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea className="min-h-[80px]" required value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} />
          </div>
          <div>
            <Label>Content (Text/Markdown-ish)</Label>
            <Textarea className="min-h-[200px]" required value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
          </div>
          <div>
            <Label>Cover Image</Label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} />
            <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="Or enter URL" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="published" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4 accent-primary" />
            <Label htmlFor="published">Published</Label>
          </div>
          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? "Uploading..." : "Save Entry"}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}