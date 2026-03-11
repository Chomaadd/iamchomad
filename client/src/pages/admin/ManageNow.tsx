import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNowItems, useCreateNowItem, useUpdateNowItem, useDeleteNowItem } from "@/hooks/use-now";
import { Button, Input, Textarea, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { NowItem } from "@shared/schema";

const CATEGORIES = [
  { value: "project", label: "🔨 Building" },
  { value: "reading", label: "📚 Reading" },
  { value: "listening", label: "🎵 Listening" },
  { value: "watching", label: "🎬 Watching" },
  { value: "note", label: "💭 Thoughts" },
];

const CATEGORY_LABELS: Record<string, string> = {
  project: "🔨 Building",
  reading: "📚 Reading",
  listening: "🎵 Listening",
  watching: "🎬 Watching",
  note: "💭 Thoughts",
};

export default function ManageNow() {
  const { data: items = [] } = useNowItems();
  const { mutateAsync: createItem } = useCreateNowItem();
  const { mutateAsync: updateItem } = useUpdateNowItem();
  const { mutateAsync: deleteItem } = useDeleteNowItem();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const defaultForm = {
    category: "project" as NowItem["category"],
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    emoji: "",
    order: 0,
    isActive: true,
  };
  const [form, setForm] = useState(defaultForm);

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
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (item: NowItem) => {
    setEditingId(item.id);
    setForm({
      category: item.category,
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      link: item.link || "",
      emoji: item.emoji || "",
      order: item.order,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateItem({ id: editingId, data: form });
        toast({ title: "Item updated." });
      } else {
        await createItem(form);
        toast({ title: "Item created." });
      }
      setModalOpen(false);
    } catch {
      toast({ title: "Something went wrong.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteItem(id);
      toast({ title: "Item deleted." });
    } catch {
      toast({ title: "Failed to delete.", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Now Page</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage what you're currently up to.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-now">
          <Plus size={16} className="mr-2" /> Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-3xl mb-3">⚡</p>
            <p>No items yet. Add something you're working on!</p>
          </div>
        )}
        {items.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card"
            data-testid={`row-now-${item.id}`}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 text-lg">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                : (item.emoji || CATEGORY_LABELS[item.category]?.charAt(0) || "⚡")
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{CATEGORY_LABELS[item.category]}</span>
                {!item.isActive && <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Hidden</span>}
              </div>
              <p className="font-medium text-sm truncate">{item.title}</p>
              {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                  <ExternalLink size={14} />
                </a>
              )}
              <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-muted transition-colors" data-testid={`button-edit-now-${item.id}`}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors" data-testid={`button-delete-now-${item.id}`}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Item" : "Add Now Item"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Category</Label>
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value as NowItem["category"] }))}
              className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="select-now-category"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Building a portfolio site"
              required
              data-testid="input-now-title"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description..."
              rows={2}
              data-testid="input-now-description"
            />
          </div>
          <div>
            <Label>Custom Emoji (optional)</Label>
            <Input
              value={form.emoji}
              onChange={e => setForm(prev => ({ ...prev, emoji: e.target.value }))}
              placeholder="e.g. 🚀"
              data-testid="input-now-emoji"
            />
          </div>
          <div>
            <Label>Image</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={form.imageUrl}
                onChange={e => setForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
                data-testid="input-now-imageurl"
              />
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <span className="inline-flex items-center px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                  {uploading ? "..." : "Upload"}
                </span>
              </label>
            </div>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="mt-2 w-16 h-16 rounded-lg object-cover" />
            )}
          </div>
          <div>
            <Label>Link (optional)</Label>
            <Input
              value={form.link}
              onChange={e => setForm(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://..."
              data-testid="input-now-link"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={form.order}
                onChange={e => setForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                data-testid="input-now-order"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                  data-testid="checkbox-now-active"
                />
                <span className="text-sm">Visible on Now page</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" data-testid="button-submit-now">
              {editingId ? "Save Changes" : "Add Item"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
