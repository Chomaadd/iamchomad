import { useState, useEffect, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useLinkItems, useCreateLinkItem, useUpdateLinkItem, useDeleteLinkItem } from "@/hooks/use-links";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-settings";
import { Button, Input, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Upload, User, Loader2, CropIcon, ZoomIn, ZoomOut, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import { LinkIcon, LinkIconPreview } from "@/lib/social-icons";
import type { LinkItem } from "@shared/schema";

const emptyForm = {
  title: "",
  url: "",
  description: "",
  icon: "",
  order: 0,
  isActive: true,
  borderColor: "",
  textColor: "",
};

const BORDER_OPTIONS = [
  { value: "default",     label: "Rounded",     preview: "rounded-2xl border border-gray-300 dark:border-gray-600" },
  { value: "pill",        label: "Pill",        preview: "rounded-full border border-gray-300 dark:border-gray-600" },
  { value: "sharp",       label: "Sharp",       preview: "rounded-md border border-gray-300 dark:border-gray-600" },
  { value: "dashed",      label: "Dashed",      preview: "rounded-2xl border-2 border-dashed border-gray-400 dark:border-gray-500" },
  { value: "glow",        label: "Glow",        preview: "rounded-2xl border-0 shadow-lg shadow-black/20" },
  { value: "transparent", label: "Transparent", preview: "rounded-2xl border-0 bg-transparent" },
  { value: "outline",     label: "Outline",     preview: "rounded-2xl border-2 border-gray-500 dark:border-gray-300 bg-transparent" },
  { value: "double",      label: "Double",      preview: "rounded-2xl border border-gray-300 dark:border-gray-600 outline outline-2 outline-offset-2 outline-gray-200 dark:outline-gray-700" },
  { value: "dotted",      label: "Dotted",      preview: "rounded-2xl border-2 border-dotted border-gray-400 dark:border-gray-500" },
  { value: "neon",        label: "Neon",        preview: "rounded-2xl border border-primary/50 shadow-[0_0_10px_2px_hsl(var(--primary)/0.3)]" },
];

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  const size = Math.min(pixelCrop.width, pixelCrop.height, 800);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, size, size);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error("Canvas empty"))), "image/jpeg", 0.92);
  });
}

export default function ManageLinks() {
  const { data: links } = useLinkItems();
  const { data: settings } = useSiteSettings();
  const { mutateAsync: createLink } = useCreateLinkItem();
  const { mutateAsync: updateLink } = useUpdateLinkItem();
  const { mutateAsync: deleteLink } = useDeleteLinkItem();
  const { mutateAsync: updateSettings } = useUpdateSiteSettings();
  const { toast } = useToast();
  const { confirm: showConfirm, ConfirmDialog } = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    linksAvatarUrl: "",
    linksName: "",
    linksBio: "",
    linksBackgroundUrl: "",
    linksBorderStyle: "default",
  });

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);
  const [uploadingCrop, setUploadingCrop] = useState(false);

  useEffect(() => {
    if (settings) {
      setProfile({
        linksAvatarUrl: settings.linksAvatarUrl || "",
        linksName: settings.linksName || "",
        linksBio: settings.linksBio || "",
        linksBackgroundUrl: settings.linksBackgroundUrl || "",
        linksBorderStyle: settings.linksBorderStyle || "default",
      });
    }
  }, [settings]);

  const onCropComplete = useCallback((_: unknown, pixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    setUploadingCrop(true);
    try {
      const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const newUrl = data.url as string;
      await updateSettings({ linksAvatarUrl: newUrl });
      setProfile(prev => ({ ...prev, linksAvatarUrl: newUrl }));
      setCropSrc(null);
      toast({ title: "Profile photo saved." });
    } catch {
      toast({ title: "Failed to upload photo.", variant: "destructive" });
    } finally {
      setUploadingCrop(false);
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const newUrl = data.url as string;
      await updateSettings({ linksBackgroundUrl: newUrl });
      setProfile(prev => ({ ...prev, linksBackgroundUrl: newUrl }));
      toast({ title: "Background image saved." });
    } catch {
      toast({ title: "Failed to upload background.", variant: "destructive" });
    } finally {
      setUploadingBg(false);
      e.target.value = "";
    }
  };

  const handleRemoveBg = async () => {
    try {
      await updateSettings({ linksBackgroundUrl: null });
      setProfile(prev => ({ ...prev, linksBackgroundUrl: "" }));
      toast({ title: "Background removed." });
    } catch {
      toast({ title: "Failed to remove background.", variant: "destructive" });
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateSettings({
        linksAvatarUrl: profile.linksAvatarUrl || null,
        linksName: profile.linksName || null,
        linksBio: profile.linksBio || null,
        linksBackgroundUrl: profile.linksBackgroundUrl || null,
        linksBorderStyle: profile.linksBorderStyle || null,
      });
      toast({ title: "Links page profile saved." });
    } catch {
      toast({ title: "Failed to save profile.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (link: LinkItem) => {
    setEditingId(link.id);
    setForm({ title: link.title, url: link.url, description: link.description || "", icon: link.icon || "", order: link.order, isActive: link.isActive, borderColor: link.borderColor || "", textColor: link.textColor || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, description: form.description || null, icon: form.icon || null, borderColor: form.borderColor || null, textColor: form.textColor || null };
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
    const ok = await showConfirm({ title: "Delete link?", description: "This action cannot be undone.", confirmLabel: "Delete" });
    if (ok) {
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

  const handleBorderChange = async (val: string) => {
    setProfile(prev => ({ ...prev, linksBorderStyle: val }));
    try {
      await updateSettings({ linksBorderStyle: val });
    } catch {}
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

      {/* ── Page Profile ── */}
      <div className="mb-8 border border-border rounded-xl p-5 bg-card space-y-6">
        <h2 className="text-base font-semibold">Page Profile</h2>

        {/* Avatar + Name/Bio */}
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
              title="Upload & crop photo"
              data-testid="button-upload-avatar"
            >
              <CropIcon size={12} />
            </label>
            <input ref={fileInputRef} id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} data-testid="input-avatar-upload" />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <Label>Name</Label>
              <Input placeholder="Choiril Ahmad" value={profile.linksName} onChange={e => setProfile(p => ({ ...p, linksName: e.target.value }))} data-testid="input-profile-name" />
            </div>
            <div>
              <Label>Bio / Description</Label>
              <Input placeholder="Frontend Developer & Visual Designer" value={profile.linksBio} onChange={e => setProfile(p => ({ ...p, linksBio: e.target.value }))} data-testid="input-profile-bio" />
            </div>
            <div>
              <Label>Photo URL <span className="text-xs text-muted-foreground">(or enter URL directly)</span></Label>
              <Input placeholder="https://..." value={profile.linksAvatarUrl} onChange={e => setProfile(p => ({ ...p, linksAvatarUrl: e.target.value }))} data-testid="input-profile-avatar-url" />
            </div>
          </div>
        </div>

        {/* ── Background Image ── */}
        <div>
          <Label className="mb-2 block">Background Image</Label>
          <div className="flex items-start gap-3">
            {/* Preview */}
            <div
              className="w-24 h-16 rounded-xl border border-border overflow-hidden shrink-0 bg-muted flex items-center justify-center"
              style={profile.linksBackgroundUrl ? { backgroundImage: `url(${profile.linksBackgroundUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              {!profile.linksBackgroundUrl && <ImageIcon size={20} className="text-muted-foreground/40" />}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <label
                  htmlFor="bg-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium cursor-pointer hover:bg-accent transition-colors"
                  data-testid="button-upload-bg"
                >
                  {uploadingBg ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploadingBg ? "Uploading..." : "Upload Image"}
                </label>
                <input ref={bgInputRef} id="bg-upload" type="file" accept="image/*" className="hidden" onChange={handleBgUpload} data-testid="input-bg-upload" />
                {profile.linksBackgroundUrl && (
                  <button
                    onClick={handleRemoveBg}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
                    data-testid="button-remove-bg"
                  >
                    <X size={13} /> Remove
                  </button>
                )}
              </div>
              <Input
                placeholder="Or paste image URL..."
                value={profile.linksBackgroundUrl}
                onChange={e => setProfile(p => ({ ...p, linksBackgroundUrl: e.target.value }))}
                className="text-xs"
                data-testid="input-bg-url"
              />
            </div>
          </div>
        </div>

        {/* ── Border Style ── */}
        <div>
          <Label className="mb-3 block">Link Card Border Style</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {BORDER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleBorderChange(opt.value)}
                data-testid={`button-border-${opt.value}`}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  profile.linksBorderStyle === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
              >
                {/* Visual preview */}
                <div className={`w-full h-6 bg-muted ${opt.preview}`} />
                <span className="text-[10px] font-semibold text-muted-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full" data-testid="button-save-profile">
          {savingProfile ? <><Loader2 size={14} className="animate-spin mr-2" />Saving...</> : "Save Profile"}
        </Button>
      </div>

      {/* ── Link List ── */}
      <div className="space-y-3">
        {sorted.map((link) => (
          <div
            key={link.id}
            className={`group flex items-center gap-4 border rounded-xl p-4 bg-card transition-all duration-200 ${
              link.isActive ? "border-border hover:border-primary/40 hover:shadow-sm" : "border-dashed border-border opacity-50"
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
              {link.description && <p className="text-xs text-muted-foreground/70 truncate">{link.description}</p>}
            </div>
            <div className="text-xs font-mono text-muted-foreground shrink-0 hidden sm:block">#{link.order}</div>
            <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => handleToggleActive(link)} className="p-2 rounded-md hover:bg-accent transition-colors" title={link.isActive ? "Hide" : "Show"} data-testid={`button-toggle-link-${link.id}`}>
                {link.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => openEdit(link)} className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors" data-testid={`button-edit-link-${link.id}`}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(link.id)} className="p-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors" data-testid={`button-delete-link-${link.id}`}>
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

      {/* Crop Modal */}
      <Modal isOpen={!!cropSrc} onClose={() => setCropSrc(null)} title="Crop Profile Photo">
        <div className="space-y-4">
          <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ height: 320 }}>
            {cropSrc && (
              <Cropper image={cropSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            )}
          </div>
          <div className="flex items-center gap-3 px-1">
            <ZoomOut size={16} className="text-muted-foreground shrink-0" />
            <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1 accent-primary cursor-pointer" data-testid="slider-crop-zoom" />
            <ZoomIn size={16} className="text-muted-foreground shrink-0" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setCropSrc(null)} disabled={uploadingCrop}>Cancel</Button>
            <Button className="flex-1" onClick={handleCropConfirm} disabled={uploadingCrop} data-testid="button-confirm-crop">
              {uploadingCrop ? <><Loader2 size={14} className="animate-spin mr-2" />Saving...</> : "Use Photo"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Link Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Link" : "Add Link"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>URL <span className="text-destructive">*</span></Label>
            <Input required placeholder="https://instagram.com/username" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} data-testid="input-link-url" />
            {form.url && <div className="mt-2"><LinkIconPreview url={form.url} emoji={form.icon} /></div>}
          </div>
          <div>
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input required placeholder="e.g. Instagram" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} data-testid="input-link-title" />
          </div>
          <div>
            <Label>Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input placeholder="Short subtitle below the title" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} data-testid="input-link-description" />
          </div>
          <div>
            <Label>Custom Emoji <span className="text-xs text-muted-foreground">(leave empty for auto-detect)</span></Label>
            <Input placeholder="e.g. 📸 🎵 ✉️" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} data-testid="input-link-icon" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Border Color <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="color"
                  value={form.borderColor || "#cccccc"}
                  onChange={e => setForm({ ...form, borderColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-card"
                  data-testid="input-link-border-color"
                />
                <Input
                  placeholder="#hex or color name"
                  value={form.borderColor}
                  onChange={e => setForm({ ...form, borderColor: e.target.value })}
                  className="text-xs"
                  data-testid="input-link-border-color-text"
                />
                {form.borderColor && (
                  <button type="button" onClick={() => setForm({ ...form, borderColor: "" })} className="text-muted-foreground hover:text-foreground text-xs shrink-0" title="Clear">✕</button>
                )}
              </div>
            </div>
            <div>
              <Label>Text Color <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  type="color"
                  value={form.textColor || "#000000"}
                  onChange={e => setForm({ ...form, textColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5 bg-card"
                  data-testid="input-link-text-color"
                />
                <Input
                  placeholder="#hex or color name"
                  value={form.textColor}
                  onChange={e => setForm({ ...form, textColor: e.target.value })}
                  className="text-xs"
                  data-testid="input-link-text-color-text"
                />
                {form.textColor && (
                  <button type="button" onClick={() => setForm({ ...form, textColor: "" })} className="text-muted-foreground hover:text-foreground text-xs shrink-0" title="Clear">✕</button>
                )}
              </div>
            </div>
          </div>
          <div>
            <Label>Order</Label>
            <Input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} data-testid="input-link-order" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="link-active" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary rounded" data-testid="input-link-active" />
            <Label htmlFor="link-active">Visible to public</Label>
          </div>
          <Button type="submit" className="w-full" data-testid="button-save-link">
            {editingId ? "Save Changes" : "Add Link"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog />
    </AdminLayout>
  );
}
