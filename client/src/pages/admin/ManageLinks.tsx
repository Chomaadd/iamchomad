import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useLinkItems, useCreateLinkItem, useUpdateLinkItem, useDeleteLinkItem } from "@/hooks/use-links";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-settings";
import { Button, Input, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Upload, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LinkIcon, LinkIconPreview } from "@/lib/social-icons";
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
  const { data: settings } = useSiteSettings();
  const { mutateAsync: createLink } = useCreateLinkItem();
  const { mutateAsync: updateLink } = useUpdateLinkItem();
  const { mutateAsync: deleteLink } = useDeleteLinkItem();
  const { mutateAsync: updateSettings } = useUpdateSiteSettings();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profile, setProfile] = useState({
    linksAvatarUrl: "",
    linksName: "",
    linksBio: "",
  });

  useEffect(() => {
    if (settings) {
      setProfile({
        linksAvatarUrl: settings.linksAvatarUrl || "",
        linksName: settings.linksName || "",
        linksBio: settings.linksBio || "",
      });
    }
  }, [settings]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProfile(prev => ({ ...prev, linksAvatarUrl: data.url }));
      toast({ title: "Foto berhasil diupload." });
    } catch {
      toast({ title: "Upload gagal.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateSettings({
        linksAvatarUrl: profile.linksAvatarUrl || null,
        linksName: profile.linksName || null,
        linksBio: profile.linksBio || null,
      });
      toast({ title: "Profil halaman Links disimpan." });
    } catch {
      toast({ title: "Gagal menyimpan profil.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

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
          <p className="text-sm text-muted-foreground mt-1">
            {sorted.length} link{sorted.length !== 1 ? "s" : ""} ·{" "}
            <a href="/links" target="_blank" className="underline underline-offset-2 hover:text-foreground transition-colors">
              View page ↗
            </a>
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2" data-testid="button-add-link">
          <Plus size={16} /> Add Link
        </Button>
      </div>

      <div className="mb-8 border border-border rounded-xl p-5 bg-card space-y-5">
        <h2 className="text-base font-semibold">Profil Halaman</h2>

        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
              {profile.linksAvatarUrl ? (
                <img src={profile.linksAvatarUrl} alt="Avatar" className="w-full h-full object-cover" data-testid="img-profile-preview" />
              ) : (
                <User size={28} className="text-muted-foreground" />
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-md"
              title="Upload foto"
              data-testid="button-upload-avatar"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              data-testid="input-avatar-upload"
            />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <Label>Nama</Label>
              <Input
                placeholder="Choiril Ahmad"
                value={profile.linksName}
                onChange={e => setProfile(p => ({ ...p, linksName: e.target.value }))}
                data-testid="input-profile-name"
              />
            </div>
            <div>
              <Label>Bio / Deskripsi</Label>
              <Input
                placeholder="Frontend Developer & Visual Designer"
                value={profile.linksBio}
                onChange={e => setProfile(p => ({ ...p, linksBio: e.target.value }))}
                data-testid="input-profile-bio"
              />
            </div>
            <div>
              <Label>URL Foto <span className="text-xs text-muted-foreground">(atau masukkan URL langsung)</span></Label>
              <Input
                placeholder="https://..."
                value={profile.linksAvatarUrl}
                onChange={e => setProfile(p => ({ ...p, linksAvatarUrl: e.target.value }))}
                data-testid="input-profile-avatar-url"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full" data-testid="button-save-profile">
          {savingProfile ? <><Loader2 size={14} className="animate-spin mr-2" />Menyimpan...</> : "Simpan Profil"}
        </Button>
      </div>

      <div className="space-y-3">
        {sorted.map((link) => (
          <div
            key={link.id}
            className={`group flex items-center gap-4 border rounded-xl p-4 bg-card transition-all duration-200 ${
              link.isActive
                ? "border-border hover:border-primary/40 hover:shadow-sm"
                : "border-dashed border-border opacity-50"
            }`}
            data-testid={`card-link-${link.id}`}
          >
            <GripVertical size={16} className="text-muted-foreground/40 shrink-0 cursor-grab" />

            <div className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-muted">
              <LinkIcon url={link.url} emoji={link.icon} size={20} />
            </div>

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
            <Label>URL <span className="text-destructive">*</span></Label>
            <Input
              required
              placeholder="https://instagram.com/username"
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              data-testid="input-link-url"
            />
            {form.url && (
              <div className="mt-2">
                <LinkIconPreview url={form.url} emoji={form.icon} />
              </div>
            )}
          </div>
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
            <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input
              placeholder="Short subtitle below the title"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              data-testid="input-link-description"
            />
          </div>
          <div>
            <Label>
              Custom Emoji <span className="text-xs text-muted-foreground">(kosongkan untuk auto-detect)</span>
            </Label>
            <Input
              placeholder="e.g. 📸 🎵 ✉️"
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
