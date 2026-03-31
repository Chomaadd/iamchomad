import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, Upload, Trash2, Globe, User, ImageIcon, Search, Settings as SettingsIcon } from "lucide-react";
import type { SiteSettings } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Form state
  const [siteTitle, setSiteTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [adminAvatarUrl, setAdminAvatarUrl] = useState<string | null>(null);
  const [aboutImageUrl, setAboutImageUrl] = useState<string | null>(null);

  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);

  // Crop state
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [aboutCropSrc, setAboutCropSrc] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);

  const { data: currentSettings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (currentSettings && !initialized) {
      setSiteTitle(currentSettings.siteTitle ?? "");
      setMetaDescription(currentSettings.metaDescription ?? "");
      setMetaKeywords(currentSettings.metaKeywords ?? "");
      setOgImageUrl(currentSettings.ogImageUrl ?? "");
      setAdminAvatarUrl(currentSettings.adminAvatarUrl ?? null);
      setAboutImageUrl(currentSettings.aboutImageUrl ?? null);
      setInitialized(true);
    }
  }, [currentSettings, initialized]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<SiteSettings>) =>
      apiRequest("PUT", "/api/settings", payload).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings have been saved!" });
      setSaving(false);
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
      setSaving(false);
    },
  });

  const handleSave = () => {
    setSaving(true);
    saveMutation.mutate({
      ...currentSettings,
      siteTitle: siteTitle || null,
      metaDescription: metaDescription || null,
      metaKeywords: metaKeywords || null,
      ogImageUrl: ogImageUrl || null,
      adminAvatarUrl,
      aboutImageUrl,
    });
  };

  const uploadImage = async (blob: Blob, field: "avatar" | "about") => {
    const setter = field === "avatar" ? setUploadingAvatar : setUploadingAbout;
    setter(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, "image.jpg");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const newUrl: string = data.url;

      if (field === "avatar") {
        setAdminAvatarUrl(newUrl);
        await apiRequest("PUT", "/api/settings", {
          ...currentSettings,
          adminAvatarUrl: newUrl,
        });
      } else {
        setAboutImageUrl(newUrl);
        await apiRequest("PUT", "/api/settings", {
          ...currentSettings,
          aboutImageUrl: newUrl,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Photo saved successfully!" });
    } catch {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleAboutFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAboutCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (aboutInputRef.current) aboutInputRef.current.value = "";
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Crop Modals */}
      {avatarCropSrc && (
        <ImageCropModal
          imageSrc={avatarCropSrc}
          cropShape="round"
          aspectRatio={1}
          onCropDone={blob => { setAvatarCropSrc(null); uploadImage(blob, "avatar"); }}
          onCancel={() => setAvatarCropSrc(null)}
        />
      )}
      {aboutCropSrc && (
        <ImageCropModal
          imageSrc={aboutCropSrc}
          cropShape="rect"
          aspectRatio={3 / 4}
          onCropDone={blob => { setAboutCropSrc(null); uploadImage(blob, "about"); }}
          onCancel={() => setAboutCropSrc(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Admin</p>
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          data-testid="button-save-settings"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save
        </button>
      </div>

      <div className="space-y-6">
        {/* Site Identity */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Website Identity</h2>
              <p className="text-xs text-muted-foreground">Website name that appears in browser tab & branding</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Website Name
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={e => setSiteTitle(e.target.value)}
              placeholder="Choiril Ahmad — Portfolio"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              data-testid="input-site-title"
            />
            <p className="text-xs text-muted-foreground/70">
              Example: "Choiril Ahmad — Portfolio" or "Mad — iamchomad.my.id"
            </p>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Search size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">SEO & Social Sharing</h2>
              <p className="text-xs text-muted-foreground">Controls how this website appears in search results and when shared</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={e => setMetaDescription(e.target.value)}
                placeholder="Personal website of Choiril Ahmad — Entrepreneur & Software Developer crafting digital experiences with precision and purpose."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                data-testid="input-meta-description"
              />
              <p className="text-xs text-muted-foreground/70">
                Shown in Google search results. Recommended: 120–160 characters. Currently: {metaDescription.length} chars.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Keywords
              </label>
              <input
                type="text"
                value={metaKeywords}
                onChange={e => setMetaKeywords(e.target.value)}
                placeholder="Choiril Ahmad, portfolio, software developer, entrepreneur, Indonesia"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                data-testid="input-meta-keywords"
              />
              <p className="text-xs text-muted-foreground/70">
                Comma-separated keywords. Helps search engines understand your content.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Social Share Image URL (OG Image)
              </label>
              <input
                type="text"
                value={ogImageUrl}
                onChange={e => setOgImageUrl(e.target.value)}
                placeholder="https://iamchomad.my.id/og-thumb.png"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                data-testid="input-og-image-url"
              />
              <p className="text-xs text-muted-foreground/70">
                Image shown when website is shared on WhatsApp, Telegram, Twitter, etc. Recommended size: 1200×630px.
              </p>
              {ogImageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-border max-w-xs">
                  <img src={ogImageUrl} alt="OG preview" className="w-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Avatar = Home Hero Photo */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Main Profile Photo</h2>
              <p className="text-xs text-muted-foreground">Appears in admin sidebar & hero photo on Home page</p>
            </div>
          </div>

          <div className="flex items-start gap-6 flex-wrap">
            {/* Preview */}
            <div className="shrink-0 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Preview</p>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                {adminAvatarUrl ? (
                  <img src={adminAvatarUrl} alt="Admin avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-muted-foreground font-serif">C</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/60 text-center max-w-[96px]">
                Sidebar & Home
              </p>
            </div>

            {/* Actions */}
            <div className="flex-1 min-w-[200px] flex flex-col gap-3 justify-center">
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileSelect} data-testid="input-avatar-file" />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-60"
                data-testid="button-upload-avatar"
              >
                {uploadingAvatar ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploadingAvatar ? "Uploading..." : "Upload & Crop Photos"}
              </button>
              {adminAvatarUrl && (
                <button
                  onClick={async () => {
                    setAdminAvatarUrl(null);
                    await apiRequest("PUT", "/api/settings", { ...currentSettings, adminAvatarUrl: null });
                    queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
                    toast({ title: "Profile photo deleted." });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-all"
                  data-testid="button-remove-avatar"
                >
                  <Trash2 size={15} /> Delete Photos
                </button>
              )}
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                Upload a photo to replace the "C" in the sidebar. The same image will automatically appear on the main page.
              </p>
            </div>
          </div>
        </div>

        {/* About Page Image */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ImageIcon size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">About Page Photo</h2>
              <p className="text-xs text-muted-foreground">The large image that appears on the /about page</p>
            </div>
          </div>

          <div className="flex items-start gap-6 flex-wrap">
            {/* Preview */}
            <div className="shrink-0 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Preview</p>
              <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                {aboutImageUrl ? (
                  <img src={aboutImageUrl} alt="About page image" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground/40">
                    <ImageIcon size={20} />
                    <span className="text-[9px]">iamchomad.png</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/60 text-center max-w-[96px]">
                About Pages
              </p>
            </div>

            {/* Actions */}
            <div className="flex-1 min-w-[200px] flex flex-col gap-3 justify-center">
              <input ref={aboutInputRef} type="file" accept="image/*" className="hidden" onChange={handleAboutFileSelect} data-testid="input-about-file" />
              <button
                onClick={() => aboutInputRef.current?.click()}
                disabled={uploadingAbout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all disabled:opacity-60"
                data-testid="button-upload-about"
              >
                {uploadingAbout ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploadingAbout ? "Uploading..." : "Upload & Crop Photos"}
              </button>
              {aboutImageUrl && (
                <button
                  onClick={async () => {
                    setAboutImageUrl(null);
                    await apiRequest("PUT", "/api/settings", { ...currentSettings, aboutImageUrl: null });
                    queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
                    toast({ title: "About photo deleted." });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-all"
                  data-testid="button-remove-about"
                >
                  <Trash2 size={15} /> Delete Photos
                </button>
              )}
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                Upload a portrait photo for the About page. If it's blank, the default image will be used.
              </p>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 flex items-start gap-3">
          <SettingsIcon size={16} className="text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground/80 mb-1">Other settings are scattered on each page.</p>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              Resume Information → page <span className="font-medium text-foreground/60">Resume</span> · 
              Avatar Link-in-Bio → page <span className="font-medium text-foreground/60">Links</span> · 
              Availability Status → also on the Resume page.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
