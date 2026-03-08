import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useBrandItems, useCreateBrandItem, useUpdateBrandItem, useDeleteBrandItem } from "@/hooks/use-brand";
import { Button, Input, Textarea, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2 } from "lucide-react";
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Brand Assets</h1>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} /> New Assets
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items?.map(item => (
          <div key={item.id} className="border-2 border-border bg-card overflow-hidden group">
            {item.imageUrl && (
              <div className="aspect-video bg-muted border-b-2 border-border">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover grayscale" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-serif font-bold text-xl">{item.title}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{item.category}</p>
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t-2 border-border">
                <button onClick={() => openEdit(item)} className="p-2 border-2 border-border hover:bg-primary hover:text-primary-foreground"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 border-2 border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Asset" : "New Asset"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="min-h-[80px]" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <Label>Asset Image</Label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} />
            <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="Or enter URL" />
          </div>
          <div>
            <Label>External Link</Label>
            <Input value={form.link} onChange={e => setForm({...form, link: e.target.value})} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 accent-primary" />
            <Label htmlFor="featured">Featured</Label>
          </div>
          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? "Uploading..." : "Save Asset"}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
