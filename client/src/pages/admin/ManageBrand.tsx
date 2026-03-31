import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useBrandItems, useCreateBrandItem, useUpdateBrandItem, useDeleteBrandItem } from "@/hooks/use-brand";
import { Button, Input, Textarea, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2, ExternalLink, Image as ImageIcon, Star, Grid3X3, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";

export default function ManageBrand() {
  const { data: items } = useBrandItems();
  const { mutateAsync: createItem } = useCreateBrandItem();
  const { mutateAsync: updateItem } = useUpdateBrandItem();
  const { mutateAsync: deleteItem } = useDeleteBrandItem();
  const { toast } = useToast();
  const { confirm: showConfirm, ConfirmDialog } = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    imageUrl: "",
    link: "",
    featured: false,
  });

  const [uploading, setUploading] = useState(false);

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
    setForm({ title: "", description: "", category: "", imageUrl: "", link: "", featured: false });
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description, category: item.category || "", imageUrl: item.imageUrl || "", link: item.link || "", featured: item.featured });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateItem({ id: editingId, data: form });
        toast({ title: "Asset updated." });
      } else {
        await createItem(form);
        toast({ title: "Asset created." });
      }
      setModalOpen(false);
    } catch {
      toast({ title: "Error saving asset", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await showConfirm({ title: "Delete asset?", description: "This action cannot be undone.", confirmLabel: "Delete" });
    if (ok) {
      try {
        await deleteItem(id);
        toast({ title: "Asset deleted." });
      } catch {
        toast({ title: "Error deleting asset", variant: "destructive" });
      }
    }
  };

  const featured = items?.filter(i => i.featured) ?? [];
  const regular = items?.filter(i => !i.featured) ?? [];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Portfolio</p>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-brand-title">Brand Assets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items?.length || 0} assets
            {featured.length > 0 && <span className="text-amber-500 dark:text-amber-400 ml-2">· {featured.length} featured</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="button-view-grid"
            >
              <Grid3X3 size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="button-view-list"
            >
              <List size={15} />
            </button>
          </div>
          <Button onClick={openCreate} className="gap-2" data-testid="button-new-brand">
            <Plus size={16} /> New Asset
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {(!items || items.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ImageIcon size={28} className="text-muted-foreground/40" />
          </div>
          <p className="font-medium text-sm">No brand assets yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Click "New Asset" to add your first one</p>
        </div>
      )}

      {/* Featured section */}
      {featured.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Featured</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
            {featured.map(item => (
              <AssetCard key={item.id} item={item} viewMode={viewMode} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Regular section */}
      {regular.length > 0 && (
        <div>
          {featured.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">All Assets</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
            {regular.map(item => (
              <AssetCard key={item.id} item={item} viewMode={viewMode} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Asset" : "New Asset"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Title</Label>
              <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Asset name" data-testid="input-brand-title" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Logo, UI" data-testid="input-brand-category" />
            </div>
            <div>
              <Label>External Link</Label>
              <Input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://..." data-testid="input-brand-link" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="min-h-[80px]" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe this asset..." data-testid="input-brand-description" />
          </div>
          <div>
            <Label>Asset Image</Label>
            <div className="space-y-2">
              {form.imageUrl && (
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                  <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} data-testid="input-brand-image" />
                {uploading ? "Uploading…" : "Upload image from file"}
              </label>
              <Input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="Or paste image URL..." className="text-xs" />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
            <input
              type="checkbox"
              id="featured"
              checked={form.featured}
              onChange={e => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 accent-primary rounded"
              data-testid="input-brand-featured"
            />
            <div>
              <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Mark as Featured</label>
              <p className="text-xs text-muted-foreground">Featured assets are highlighted in the gallery</p>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={uploading} data-testid="button-save-brand">
            {uploading ? "Uploading…" : editingId ? "Save Changes" : "Create Asset"}
          </Button>
        </form>
      </Modal>
      <ConfirmDialog />
    </AdminLayout>
  );
}

function AssetCard({ item, viewMode, onEdit, onDelete }: { item: any; viewMode: "grid" | "list"; onEdit: (i: any) => void; onDelete: (id: string) => void }) {
  if (viewMode === "list") {
    return (
      <div
        className="group flex items-center gap-4 border border-border rounded-xl bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
        data-testid={`card-brand-${item.id}`}
      >
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-muted-foreground/30" /></div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{item.title}</h3>
            {item.featured && <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />}
          </div>
          {item.category && <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{item.category}</p>}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 flex-1 hidden md:block">{item.description}</p>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <ExternalLink size={14} />
            </a>
          )}
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors" data-testid={`button-edit-brand-${item.id}`}><Edit2 size={13} /></button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors" data-testid={`button-delete-brand-${item.id}`}><Trash2 size={13} /></button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group border border-border rounded-2xl bg-card overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-300"
      data-testid={`card-brand-${item.id}`}
    >
      {/* Image */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={36} className="text-muted-foreground/20" /></div>
        }
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-sm">
              <ExternalLink size={13} />
            </a>
          )}
          <button onClick={() => onEdit(item)}
            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-sm"
            data-testid={`button-edit-brand-${item.id}`}>
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(item.id)}
            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-red-600 hover:bg-white transition-colors shadow-sm"
            data-testid={`button-delete-brand-${item.id}`}>
            <Trash2 size={13} />
          </button>
        </div>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {item.featured && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              <Star size={9} className="fill-white" /> Featured
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{item.title}</h3>
            {item.category && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                {item.category}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}
