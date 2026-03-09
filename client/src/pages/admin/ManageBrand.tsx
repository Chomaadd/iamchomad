import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useBrandItems, useCreateBrandItem, useUpdateBrandItem, useDeleteBrandItem } from "@/hooks/use-brand";
import { Button, Input, Textarea, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2, ExternalLink, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManageBrand() {
  const { data: items } = useBrandItems();
  const { mutateAsync: createItem } = useCreateBrandItem();
  const { mutateAsync: updateItem } = useUpdateBrandItem();
  const { mutateAsync: deleteItem } = useDeleteBrandItem();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    imageUrl: "",
    link: "",
    featured: false
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
    setForm({
      title: item.title,
      description: item.description,
      category: item.category || "",
      imageUrl: item.imageUrl || "",
      link: item.link || "",
      featured: item.featured
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateItem({ id: editingId, data: form });
        toast({ title: "Asset updated successfully." });
      } else {
        await createItem(form);
        toast({ title: "Asset created successfully." });
      }
      setModalOpen(false);
    } catch (error) {
      toast({ title: "Error saving asset", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteItem(id);
        toast({ title: "Asset deleted." });
      } catch (error) {
        toast({ title: "Error deleting asset", variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-brand-title">Brand Assets</h1>
          <p className="text-sm text-muted-foreground mt-1">{items?.length || 0} assets</p>
        </div>
        <Button onClick={openCreate} className="gap-2" data-testid="button-new-brand">
          <Plus size={16} /> New Asset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items?.map(item => (
          <div key={item.id} className="group border border-border rounded-lg bg-card overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all duration-200" data-testid={`card-brand-${item.id}`}>
            <div className="aspect-video bg-muted relative overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Image size={32} className="text-muted-foreground/30" /></div>
              )}
              {item.featured && (
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded">Featured</span>
              )}
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="absolute top-3 right-3 p-1.5 bg-card/90 backdrop-blur-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  {item.category && <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{item.category}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors" data-testid={`button-edit-brand-${item.id}`}><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors" data-testid={`button-delete-brand-${item.id}`}><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {items?.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground text-sm italic mt-4">
          No brand assets yet.
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Asset" : "New Asset"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} data-testid="input-brand-title" />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} data-testid="input-brand-category" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="min-h-[80px]" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} data-testid="input-brand-description" />
          </div>
          <div>
            <Label>Asset Image</Label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} data-testid="input-brand-image" />
            <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="Or enter URL" className="mt-1" />
          </div>
          <div>
            <Label>External Link</Label>
            <Input value={form.link} onChange={e => setForm({...form, link: e.target.value})} data-testid="input-brand-link" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 accent-primary rounded" data-testid="input-brand-featured" />
            <Label htmlFor="featured">Featured</Label>
          </div>
          <Button type="submit" className="w-full" disabled={uploading} data-testid="button-save-brand">
            {uploading ? "Uploading..." : "Save Asset"}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
