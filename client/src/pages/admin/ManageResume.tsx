import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useResumeItems, useCreateResumeItem, useUpdateResumeItem, useDeleteResumeItem } from "@/hooks/use-resume";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-settings";
import { Button, Input, Textarea, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2, Briefcase, GraduationCap, Lightbulb, User, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ResumeItem } from "@shared/schema";

const typeConfig = {
  experience: { label: "Experience", icon: Briefcase, color: "text-blue-600 bg-blue-500/10" },
  education: { label: "Education", icon: GraduationCap, color: "text-emerald-600 bg-emerald-500/10" },
  skill: { label: "Skill", icon: Lightbulb, color: "text-purple-600 bg-purple-500/10" },
};

export default function ManageResume() {
  const { data: items } = useResumeItems();
  const { data: settings } = useSiteSettings();
  const { mutateAsync: createItem } = useCreateResumeItem();
  const { mutateAsync: updateItem } = useUpdateResumeItem();
  const { mutateAsync: deleteItem } = useDeleteResumeItem();
  const { mutateAsync: updateSettings, isPending: savingProfile } = useUpdateSiteSettings();
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "experience" | "education" | "skill">("profile");

  const [form, setForm] = useState({
    type: "experience" as "experience" | "education" | "skill",
    title: "",
    subtitle: "",
    description: "",
    startDate: "",
    endDate: "",
    order: 0,
    tags: "" as string,
  });

  const [profile, setProfile] = useState({
    resumeFullName: "",
    resumeTitle: "",
    resumeAbout: "",
    resumePhotoUrl: "",
    resumeBirthDate: "",
    resumeBirthPlace: "",
    resumeReligion: "",
    resumeGender: "",
    resumeMarriagestatus: "",
    resumeNationality: "",
    resumePhone: "",
    resumeAddress: "",
    resumeEmail: "",
    resumeWebsite: "",
  });

  useEffect(() => {
    if (settings) {
      setProfile({
        resumeFullName: settings.resumeFullName || "",
        resumeTitle: settings.resumeTitle || "",
        resumeAbout: settings.resumeAbout || "",
        resumePhotoUrl: settings.resumePhotoUrl || "",
        resumeBirthDate: settings.resumeBirthDate || "",
        resumeBirthPlace: settings.resumeBirthPlace || "",
        resumeReligion: settings.resumeReligion || "",
        resumeGender: settings.resumeGender || "",
        resumeMarriagestatus: settings.resumeMarriagestatus || "",
        resumeNationality: settings.resumeNationality || "",
        resumePhone: settings.resumePhone || "",
        resumeAddress: settings.resumeAddress || "",
        resumeEmail: settings.resumeEmail || "",
        resumeWebsite: settings.resumeWebsite || "",
      });
    }
  }, [settings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        resumeFullName: profile.resumeFullName || null,
        resumeTitle: profile.resumeTitle || null,
        resumeAbout: profile.resumeAbout || null,
        resumePhotoUrl: profile.resumePhotoUrl || null,
        resumeBirthDate: profile.resumeBirthDate || null,
        resumeBirthPlace: profile.resumeBirthPlace || "",
        resumeReligion: profile.resumeReligion || "",
        resumeGender: profile.resumeGender || "",
        resumeMarriagestatus: profile.resumeMarriagestatus || "",
        resumeNationality: profile.resumeNationality || null, 
        resumePhone: profile.resumePhone || null,
        resumeAddress: profile.resumeAddress || null,
        resumeEmail: profile.resumeEmail || null,
        resumeWebsite: profile.resumeWebsite || null,
      });
      toast({ title: "Profile info saved!" });
    } catch {
      toast({ title: "Error saving profile", variant: "destructive" });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProfile(p => ({ ...p, resumePhotoUrl: data.url }));
      toast({ title: "Foto berhasil diupload!" });
    } catch {
      toast({ title: "Gagal upload foto", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const openCreate = (type: "experience" | "education" | "skill") => {
    setEditingId(null);
    setForm({ type, title: "", subtitle: "", description: "", startDate: "", endDate: "", order: 0, tags: "" });
    setModalOpen(true);
  };

  const openEdit = (item: ResumeItem) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      title: item.title,
      subtitle: item.subtitle || "",
      description: item.description || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      order: item.order || 0,
      tags: (item.tags || []).join(", "),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: form.type,
      title: form.title,
      subtitle: form.subtitle || null,
      description: form.description || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      order: Number(form.order) || 0,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };
    try {
      if (editingId) {
        await updateItem({ id: editingId, data: payload });
        toast({ title: "Resume item updated." });
      } else {
        await createItem(payload);
        toast({ title: "Resume item added." });
      }
      setModalOpen(false);
    } catch {
      toast({ title: "Error saving item", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this resume item?")) {
      try {
        await deleteItem(id);
        toast({ title: "Item deleted." });
      } catch {
        toast({ title: "Error deleting item", variant: "destructive" });
      }
    }
  };

  const filteredItems = activeTab !== "profile" ? (items?.filter(i => i.type === activeTab) || []) : [];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-resume-admin-title">Resume / CV</h1>
          <p className="text-sm text-muted-foreground mt-1">{items?.length || 0} items total</p>
        </div>
        {activeTab !== "profile" && (
          <Button onClick={() => openCreate(activeTab as any)} className="gap-2" data-testid="button-add-resume-item">
            <Plus size={16} /> Add {typeConfig[activeTab as keyof typeof typeConfig].label}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border border-border rounded-lg p-1 bg-muted/30 w-fit flex-wrap">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "profile" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid="tab-profile"
        >
          <User size={16} />
          <span className="hidden sm:inline">Profile Info</span>
        </button>
        {(["experience", "education", "skill"] as const).map((type) => {
          const config = typeConfig[type];
          const Icon = config.icon;
          const count = items?.filter(i => i.type === type).length || 0;
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === type ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${type}`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{config.label}</span>
              <span className="text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Profile Info Panel */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <User size={14} /> Identitas Diri
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input
                    value={profile.resumeFullName}
                    onChange={e => setProfile({ ...profile, resumeFullName: e.target.value })}
                    placeholder="e.g. Choiril Ahmad"
                    data-testid="input-resume-fullname"
                  />
                </div>
                <div>
                  <Label>Jabatan / Profesi</Label>
                  <Input
                    value={profile.resumeTitle}
                    onChange={e => setProfile({ ...profile, resumeTitle: e.target.value })}
                    placeholder="e.g. Frontend Developer"
                    data-testid="input-resume-jobtitle"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tanggal Lahir</Label>
                  <Input
                    value={profile.resumeBirthDate}
                    onChange={e => setProfile({ ...profile, resumeBirthDate: e.target.value })}
                    placeholder="e.g. 15 Maret 1995"
                    data-testid="input-resume-birthdate"
                  />
                </div>
                <div>
                  <Label>Tempat Lahir</Label>
                  <Input
                    value={profile.resumeBirthPlace}
                    onChange={e => setProfile({ ...profile, resumeBirthPlace: e.target.value })}
                    placeholder="e.g. Batam, Indonesia"
                    data-testid="input-resume-birthplace"
                  />
                </div>
                <div>
                  <Label>Agama</Label>
                  <Input
                    value={profile.resumeReligion}
                    onChange={e => setProfile({ ...profile, resumeReligion: e.target.value })}
                    placeholder="e.g. Islam"
                    data-testid="input-resume-religion"
                  />
                </div>
                <div>
                  <Label>Jenis Kelamin</Label>
                  <Input
                    value={profile.resumeGender}
                    onChange={e => setProfile({ ...profile, resumeGender: e.target.value })}
                    placeholder="e.g. Laki-laki"
                    data-testid="input-resume-gender"
                  />
                </div>
                <div>
                  <Label>Status Perkawinan</Label>
                  <Input
                    value={profile.resumeMarriagestatus}
                    onChange={e => setProfile({ ...profile, resumeMarriagestatus: e.target.value })}
                    placeholder="e.g. Menikah"
                    data-testid="input-resume-marriagestatus"
                  />
                </div>
                <div>
                  <Label>Kewarganegaraan</Label>
                  <Input
                    value={profile.resumeNationality}
                    onChange={e => setProfile({ ...profile, resumeNationality: e.target.value })}
                    placeholder="e.g. Indonesia"
                    data-testid="input-resume-nationality"
                  />
                </div>
              </div>
              <div>
                <Label>Tentang Saya (About Me)</Label>
                <Textarea
                  className="min-h-[100px]"
                  value={profile.resumeAbout}
                  onChange={e => setProfile({ ...profile, resumeAbout: e.target.value })}
                  placeholder="Ceritakan sedikit tentang dirimu untuk ditampilkan di CV..."
                  data-testid="input-resume-about"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              Kontak & Foto
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Foto Profil</Label>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  data-testid="input-resume-photo-file"
                />
                <div className="flex items-center gap-3 mt-1.5">
                  {profile.resumePhotoUrl ? (
                    <div className="relative group shrink-0">
                      <img src={profile.resumePhotoUrl} alt="preview" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                      <button
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, resumePhotoUrl: "" }))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid="button-remove-photo"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center shrink-0">
                      <User size={20} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-border rounded-md text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                      data-testid="button-upload-photo"
                    >
                      <Upload size={14} />
                      {uploadingPhoto ? "Mengupload..." : "Upload Foto dari File"}
                    </button>
                    <Input
                      value={profile.resumePhotoUrl}
                      onChange={e => setProfile({ ...profile, resumePhotoUrl: e.target.value })}
                      placeholder="atau paste URL foto..."
                      data-testid="input-resume-photo"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profile.resumeEmail}
                    onChange={e => setProfile({ ...profile, resumeEmail: e.target.value })}
                    placeholder="kamu@gmail.com"
                    data-testid="input-resume-email"
                  />
                </div>
                <div>
                  <Label>Nomor HP / WhatsApp</Label>
                  <Input
                    value={profile.resumePhone}
                    onChange={e => setProfile({ ...profile, resumePhone: e.target.value })}
                    placeholder="e.g. +62 812-xxxx-xxxx"
                    data-testid="input-resume-phone"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Alamat</Label>
                  <Input
                    value={profile.resumeAddress}
                    onChange={e => setProfile({ ...profile, resumeAddress: e.target.value })}
                    placeholder="e.g. Jakarta, Indonesia"
                    data-testid="input-resume-address"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={profile.resumeWebsite}
                    onChange={e => setProfile({ ...profile, resumeWebsite: e.target.value })}
                    placeholder="e.g. iamchomad.my.id"
                    data-testid="input-resume-website"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={savingProfile} data-testid="button-save-profile">
            {savingProfile ? "Menyimpan..." : "Simpan Profile Info"}
          </Button>
        </form>
      )}

      {/* Resume Items List */}
      {activeTab !== "profile" && (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            return (
              <div
                key={item.id}
                className="group flex items-start gap-4 border border-border rounded-lg p-4 bg-card hover:border-primary/40 transition-all"
                data-testid={`card-resume-item-${item.id}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <span className="text-[10px] text-muted-foreground font-mono">#{item.order}</span>
                  </div>
                  {item.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>}
                  {(item.startDate || item.endDate) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {[item.startDate, item.endDate].filter(Boolean).join(" — ")}
                    </p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors" data-testid={`button-edit-resume-${item.id}`}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors" data-testid={`button-delete-resume-${item.id}`}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground text-sm italic">
              No {typeConfig[activeTab as keyof typeof typeConfig].label.toLowerCase()} items yet.
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? `Edit ${typeConfig[form.type].label}` : `Add ${typeConfig[form.type].label}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type</Label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as any })}
              className="flex w-full border border-input bg-background px-4 py-2.5 text-sm rounded-md focus:outline-none focus:border-primary transition-all"
              data-testid="select-resume-type"
            >
              <option value="experience">Experience</option>
              <option value="education">Education</option>
              <option value="skill">Skill</option>
            </select>
          </div>
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={form.type === "experience" ? "e.g. Software Developer" : form.type === "education" ? "e.g. Computer Science" : "e.g. Frontend Development"} data-testid="input-resume-title" />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder={form.type === "experience" ? "e.g. Company Name" : form.type === "education" ? "e.g. University Name" : "e.g. Category"} data-testid="input-resume-subtitle" />
          </div>
          {form.type !== "skill" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} placeholder="e.g. Jan 2020" data-testid="input-resume-start" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} placeholder="e.g. Present" data-testid="input-resume-end" />
              </div>
            </div>
          )}
          <div>
            <Label>Description</Label>
            <Textarea className="min-h-[80px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} data-testid="input-resume-description" />
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="e.g. React, TypeScript, Node.js" data-testid="input-resume-tags" />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} data-testid="input-resume-order" />
          </div>
          <Button type="submit" className="w-full" data-testid="button-save-resume">
            Save {typeConfig[form.type].label}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
