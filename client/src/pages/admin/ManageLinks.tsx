import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useLinkItems, useCreateLinkItem, useUpdateLinkItem, useDeleteLinkItem } from "@/hooks/use-links";
import { Button, Input, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2, ExternalLink, GripVertical, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LinkItem } from "@shared/schema";

const emptyForm = {
  title: "",
  url: "",
  description: "",
  icon: "",
  order: 0,
  isActive: true,
};

export default function ManageLinks() {
  const { data: links } = useLinkItems();
  const { mutateAsync: createLink } = useCreateLinkItem();
  const { mutateAsync: updateLink } = useUpdateLinkItem();
  const { mutateAsync: deleteLink } = useDeleteLinkItem();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (link: LinkItem) => {
    setEditingId(link.id);
    setForm({
      title: link.title,
      url: link.url,
      description: link.description || "",
      icon: link.icon || "",
      order: link.order,
      isActive: link.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        description: form.description || null,
        icon: form.icon || null,
      };
      if (editingId) {
        await updateLink({ id: editingId, data: payload });
        toast({ title: "Link updated." });
      } else {
        await createLink(payload);
        toast({ title: "Link added." });
      }
      setModalOpen(false);
    } catch {
      toast({ title: "Error saving link", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this link?")) {
      try {
        await deleteLink(id);
        toast({ title: "Link deleted." });
      } catch {
        toast({ title: "Error deleting link", variant: "destructive" });
      }
    }
  };

  const handleToggleActive = async (link: LinkItem) => {
    try {
      await updateLink({ id: link.id, data: { isActive: !link.isActive } });
      toast({ title: link.isActive ? "Link hidden." : "Link visible." });
    } catch {
      toast({ title: "Error updating link", variant: "destructive" });
    }
  };

  const sorted = [...(links ?? [])].sort((a, b) => a.order - b.order);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-links-title">Links</h1>
          <p className="text-sm text-muted-foreground mt-1">{sorted.length} link{sorted.length !== 1 ? "s" : ""} · <a href="/links" target="_blank" className="underline underline-offset-2 hover:text-foreground transition-colors">View page ↗</a></p>
        </div>
        <Button onClick={openCreate} className="gap-2" data-testid="button-add-link">
          <Plus size={16} /> Add Link
        </Button>
      </div>

      <div className="space-y-3">
        {sorted.map((link) => (
          <div
            key={link.id}
            className={`group flex items-center gap-4 border rounded-xl p-4 bg-card transition-all duration-200 ${link.isActive ? "border-border hover:border-primary/40 hover:shadow-sm" : "border-dashed border-border opacity-50"}`}
            data-testid={`card-link-${link.id}`}
          >
            <GripVertical size={16} className="text-muted-foreground/40 shrink-0 cursor-grab" />

            {link.icon ? (
              <span className="text-2xl shrink-0">{link.icon}</span>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <ExternalLink size={14} className="text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{link.title}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{link.url}</p>
              {link.description && (
                <p className="text-xs text-muted-foreground/70 truncate">{link.description}</p>
              )}
            </div>

            <div className="text-xs font-mono text-muted-foreground shrink-0 hidden sm:block">
              #{link.order}
            </div>

            <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => handleToggleActive(link)}
                className="p-2 rounded-md hover:bg-accent transition-colors"
                title={link.isActive ? "Hide" : "Show"}
                data-testid={`button-toggle-link-${link.id}`}
              >
                {link.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={() => openEdit(link)}
                className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                data-testid={`button-edit-link-${link.id}`}
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDelete(link.id)}
                className="p-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                data-testid={`button-delete-link-${link.id}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground text-sm italic">
            No links added yet. Click "Add Link" to get started.
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Link" : "Add Link"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input
              required
              placeholder="e.g. Instagram"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              data-testid="input-link-title"
            />
          </div>
          <div>
            <Label>URL <span className="text-destructive">*</span></Label>
            <Input
              required
              type="url"
              placeholder="https://..."
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              data-testid="input-link-url"
            />
          </div>
          <div>
            <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input
              placeholder="Short subtitle below the title"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              data-testid="input-link-description"
            />
          </div>
          <div>
            <Label>Icon / Emoji <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input
              placeholder="e.g. 📸 or 🎵"
              value={form.icon}
              onChange={e => setForm({ ...form, icon: e.target.value })}
              data-testid="input-link-icon"
            />
          </div>
          <div>
            <Label>Order</Label>
            <Input
              type="number"
              value={form.order}
              onChange={e => setForm({ ...form, order: Number(e.target.value) })}
              data-testid="input-link-order"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="link-active"
              checked={form.isActive}
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-primary rounded"
              data-testid="input-link-active"
            />
            <Label htmlFor="link-active">Visible to public</Label>
          </div>
          <Button type="submit" className="w-full" data-testid="button-save-link">
            {editingId ? "Save Changes" : "Add Link"}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
