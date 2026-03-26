import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor, renderRichContent } from "@/components/ui/rich-text-editor";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, Plus, Pencil, Trash2, ChevronRight,
  Eye, EyeOff, Star, ArrowLeft, Layers, FileText,
  Upload, ImageIcon, RotateCcw,
} from "lucide-react";
import Cropper from "react-easy-crop";
import type { NovelStory, NovelSeason, NovelChapter } from "@shared/schema";

type View = "stories" | "seasons" | "chapters" | "write";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── Canvas Crop Helper ─────────────────────────────────────────────────────
async function getCroppedBlob(imageSrc: string, croppedAreaPixels: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0, 0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Canvas is empty")), "image/jpeg", 0.9);
  });
}

// ── Cover Upload + Crop ────────────────────────────────────────────────────
function CoverUploadCrop({
  value, onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleConfirmCrop = async () => {
    if (!rawSrc || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(rawSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", blob, `cover-${Date.now()}.jpg`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onChange(url);
      setCropOpen(false);
      setRawSrc(null);
      toast({ title: "Sampul berhasil diupload!" });
    } catch {
      toast({ title: "Gagal upload sampul", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 items-center flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          data-testid="button-upload-cover"
        >
          <Upload size={14} className="mr-1.5" /> Upload Sampul
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onChange("")}
            data-testid="button-remove-cover"
          >
            <RotateCcw size={14} className="mr-1.5" /> Hapus
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          data-testid="input-cover-file"
        />
      </div>

      {value ? (
        <div className="mt-2 relative w-24">
          <img
            src={value}
            alt="Sampul"
            className="w-24 aspect-[2/3] object-cover rounded-lg border border-border"
          />
        </div>
      ) : (
        <div
          className="mt-2 w-24 aspect-[2/3] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          data-testid="cover-placeholder"
        >
          <ImageIcon size={20} className="text-muted-foreground mb-1" />
          <span className="text-[10px] text-muted-foreground">2:3</span>
        </div>
      )}

      {/* Fallback: manual URL input */}
      <div className="mt-2">
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="atau paste URL gambar..."
          className="text-xs h-8"
          data-testid="input-story-cover-url"
        />
      </div>

      {/* Crop Dialog */}
      <Dialog open={cropOpen} onOpenChange={open => { if (!open) { setCropOpen(false); setRawSrc(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Sampul</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-72 bg-black rounded-lg overflow-hidden">
            {rawSrc && (
              <Cropper
                image={rawSrc}
                crop={crop}
                zoom={zoom}
                aspect={2 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-10">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary"
                data-testid="slider-crop-zoom"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">{zoom.toFixed(1)}x</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCropOpen(false); setRawSrc(null); }}>Batal</Button>
            <Button onClick={handleConfirmCrop} disabled={uploading} data-testid="button-confirm-crop">
              {uploading ? "Mengupload..." : "Gunakan Gambar Ini"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Story Form ────────────────────────────────────────────────────────────
function StoryForm({
  initial, onSave, onCancel,
}: {
  initial?: Partial<NovelStory>;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    coverUrl: initial?.coverUrl ?? "",
    category: initial?.category ?? "novel",
    status: initial?.status ?? "ongoing",
    tags: (initial?.tags ?? []).join(", "),
    published: initial?.published ?? false,
    featured: initial?.featured ?? false,
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const parsedTags = form.tags.split(",").map(t => t.trim()).filter(Boolean);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Judul *</label>
        <Input
          value={form.title}
          onChange={e => { set("title", e.target.value); if (!initial?.slug) set("slug", slugify(e.target.value)); }}
          placeholder="Judul cerita"
          data-testid="input-story-title"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Slug *</label>
        <Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="url-cerita" data-testid="input-story-slug" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Deskripsi</label>
        <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Sinopsis cerita..." data-testid="input-story-description" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Sampul</label>
        <CoverUploadCrop value={form.coverUrl} onChange={v => set("coverUrl", v)} />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Tags</label>
        <Input
          value={form.tags}
          onChange={e => set("tags", e.target.value)}
          placeholder="cth: Action, Romance, Isekai (pisahkan dengan koma)"
          data-testid="input-story-tags"
        />
        {parsedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {parsedTags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Kategori</label>
          <Select value={form.category} onValueChange={v => set("category", v)}>
            <SelectTrigger data-testid="select-story-category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="novel">Novel</SelectItem>
              <SelectItem value="komik">Komik</SelectItem>
              <SelectItem value="cerpen">Cerpen</SelectItem>
              <SelectItem value="puisi">Puisi</SelectItem>
              <SelectItem value="lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select value={form.status} onValueChange={v => set("status", v)}>
            <SelectTrigger data-testid="select-story-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="hiatus">Hiatus</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} className="rounded" data-testid="checkbox-story-published" />
          Publikasikan
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} className="rounded" data-testid="checkbox-story-featured" />
          Unggulan
        </label>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel-story">Batal</Button>
        <Button onClick={() => onSave({ ...form, tags: parsedTags })} disabled={!form.title || !form.slug} data-testid="button-save-story">Simpan</Button>
      </DialogFooter>
    </div>
  );
}

// ── Season Form ───────────────────────────────────────────────────────────
function SeasonForm({ storyId, initial, onSave, onCancel }: {
  storyId: string;
  initial?: Partial<NovelSeason>;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    seasonNumber: initial?.seasonNumber ?? 1,
  });
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Nomor Season *</label>
        <Input type="number" min={1} value={form.seasonNumber} onChange={e => setForm(f => ({ ...f, seasonNumber: Number(e.target.value) }))} data-testid="input-season-number" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Judul Season *</label>
        <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="cth: Awal Mula" data-testid="input-season-title" />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel-season">Batal</Button>
        <Button onClick={() => onSave({ ...form, storyId })} disabled={!form.title} data-testid="button-save-season">Simpan</Button>
      </DialogFooter>
    </div>
  );
}

// ── Chapter Write ─────────────────────────────────────────────────────────
function ChapterWrite({ chapter, storyId, seasonId, onBack }: {
  chapter?: NovelChapter;
  storyId: string;
  seasonId: string;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: chapter?.title ?? "",
    chapterNumber: chapter?.chapterNumber ?? 1,
    content: chapter ? renderRichContent(chapter.content) : "",
    published: chapter?.published ?? false,
  });

  const save = useMutation({
    mutationFn: (data: any) => chapter
      ? apiRequest("PUT", `/api/novel/chapters/${chapter.id}`, data)
      : apiRequest("POST", "/api/novel/chapters", { ...data, storyId, seasonId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/novel/seasons", seasonId, "chapters"] });
      toast({ title: "Berhasil disimpan!" });
      onBack();
    },
    onError: () => toast({ title: "Gagal menyimpan", variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2" data-testid="button-back-from-write">
        <ArrowLeft size={16} /> Kembali ke daftar bab
      </button>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">No. Bab *</label>
          <Input type="number" min={1} value={form.chapterNumber} onChange={e => setForm(f => ({ ...f, chapterNumber: Number(e.target.value) }))} data-testid="input-chapter-number" />
        </div>
        <div className="flex items-end pb-0.5">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="rounded" data-testid="checkbox-chapter-published" />
            Publikasikan
          </label>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Judul Bab *</label>
        <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Judul bab" data-testid="input-chapter-title" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Isi Cerita *</label>
        <RichTextEditor
          value={form.content}
          onChange={html => setForm(f => ({ ...f, content: html }))}
          placeholder="Tulis isi cerita di sini... Gunakan toolbar untuk bold, italic, list, dan lainnya."
          minHeight={450}
        />
        {(() => {
          const text = form.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          const words = text ? text.split(" ").filter(Boolean).length : 0;
          return <p className="text-xs text-muted-foreground mt-1">{words} kata · ~{Math.max(1, Math.ceil(words / 200))} menit baca</p>;
        })()}
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onBack} data-testid="button-discard-chapter">Batal</Button>
        <Button onClick={() => save.mutate(form)} disabled={!form.title || !form.content || save.isPending} data-testid="button-save-chapter">
          {save.isPending ? "Menyimpan..." : "Simpan Bab"}
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function ManageNovel() {
  const { toast } = useToast();
  const [view, setView] = useState<View>("stories");
  const [selectedStory, setSelectedStory] = useState<NovelStory | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<NovelSeason | null>(null);
  const [editingChapter, setEditingChapter] = useState<NovelChapter | undefined>(undefined);

  const [storyDialog, setStoryDialog] = useState<{ open: boolean; story?: NovelStory }>({ open: false });
  const [seasonDialog, setSeasonDialog] = useState<{ open: boolean; season?: NovelSeason }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; name: string } | null>(null);

  const { data: stories, isLoading: storiesLoading } = useQuery<NovelStory[]>({
    queryKey: ["/api/novel/stories/all"],
  });

  const { data: seasons, isLoading: seasonsLoading } = useQuery<NovelSeason[]>({
    queryKey: ["/api/novel/stories", selectedStory?.id, "seasons"],
    queryFn: () => fetch(`/api/novel/stories/${selectedStory!.id}/seasons`).then(r => r.json()),
    enabled: !!selectedStory?.id,
  });

  const { data: chapters, isLoading: chaptersLoading } = useQuery<NovelChapter[]>({
    queryKey: ["/api/novel/seasons", selectedSeason?.id, "chapters"],
    queryFn: () => fetch(`/api/novel/seasons/${selectedSeason!.id}/chapters/all`).then(r => r.json()),
    enabled: !!selectedSeason?.id,
  });

  const createStory = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/novel/stories", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/novel/stories/all"] }); setStoryDialog({ open: false }); toast({ title: "Cerita berhasil dibuat!" }); },
    onError: () => toast({ title: "Gagal membuat cerita", variant: "destructive" }),
  });

  const updateStory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/novel/stories/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/novel/stories/all"] }); setStoryDialog({ open: false }); toast({ title: "Cerita diperbarui!" }); },
    onError: () => toast({ title: "Gagal memperbarui", variant: "destructive" }),
  });

  const deleteStory = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/novel/stories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/novel/stories/all"] }); setDeleteDialog(null); toast({ title: "Cerita dihapus!" }); },
    onError: () => toast({ title: "Gagal menghapus", variant: "destructive" }),
  });

  const createSeason = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/novel/seasons", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/novel/stories", selectedStory?.id, "seasons"] }); setSeasonDialog({ open: false }); toast({ title: "Season berhasil dibuat!" }); },
    onError: () => toast({ title: "Gagal membuat season", variant: "destructive" }),
  });

  const updateSeason = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/novel/seasons/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/novel/stories", selectedStory?.id, "seasons"] }); setSeasonDialog({ open: false }); toast({ title: "Season diperbarui!" }); },
    onError: () => toast({ title: "Gagal memperbarui season", variant: "destructive" }),
  });

  const deleteSeason = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/novel/seasons/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/novel/stories", selectedStory?.id, "seasons"] }); setDeleteDialog(null); toast({ title: "Season dihapus!" }); },
    onError: () => toast({ title: "Gagal menghapus season", variant: "destructive" }),
  });

  const deleteChapter = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/novel/chapters/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/novel/seasons", selectedSeason?.id, "chapters"] }); setDeleteDialog(null); toast({ title: "Bab dihapus!" }); },
    onError: () => toast({ title: "Gagal menghapus bab", variant: "destructive" }),
  });

  const toggleChapterPublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) => apiRequest("PUT", `/api/novel/chapters/${id}`, { published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/novel/seasons", selectedSeason?.id, "chapters"] }),
  });

  const handleDelete = () => {
    if (!deleteDialog) return;
    if (deleteDialog.type === "story") deleteStory.mutate(deleteDialog.id);
    if (deleteDialog.type === "season") deleteSeason.mutate(deleteDialog.id);
    if (deleteDialog.type === "chapter") deleteChapter.mutate(deleteDialog.id);
  };

  if (view === "write" && selectedSeason) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <ChapterWrite
            chapter={editingChapter}
            storyId={selectedStory!.id}
            seasonId={selectedSeason.id}
            onBack={() => { setEditingChapter(undefined); setView("chapters"); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Breadcrumb Nav */}
        <div className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Link href="/admin"><span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Dashboard</span></Link>
          <ChevronRight size={14} className="text-muted-foreground" />
          <button onClick={() => { setView("stories"); setSelectedStory(null); setSelectedSeason(null); }} className={view === "stories" ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"} data-testid="breadcrumb-stories">
            Novel & Cerita
          </button>
          {selectedStory && (
            <>
              <ChevronRight size={14} className="text-muted-foreground" />
              <button onClick={() => { setView("seasons"); setSelectedSeason(null); }} className={view === "seasons" ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"} data-testid="breadcrumb-seasons">
                {selectedStory.title}
              </button>
            </>
          )}
          {selectedSeason && (
            <>
              <ChevronRight size={14} className="text-muted-foreground" />
              <span className="font-semibold text-foreground">Season {selectedSeason.seasonNumber}</span>
            </>
          )}
        </div>

        {/* ── STORIES VIEW ── */}
        {view === "stories" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen size={22} /> Novel & Cerita
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Kelola semua cerita kamu</p>
              </div>
              <Button onClick={() => setStoryDialog({ open: true })} data-testid="button-add-story">
                <Plus size={16} className="mr-1.5" /> Tambah Cerita
              </Button>
            </div>

            {storiesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : !stories?.length ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl">
                <BookOpen size={36} className="mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground">Belum ada cerita. Buat cerita pertamamu!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stories.map(story => (
                  <div key={story.id} className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors" data-testid={`card-story-${story.id}`}>
                    <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {story.coverUrl
                        ? <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-muted-foreground" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-foreground truncate">{story.title}</span>
                        {story.featured && <Star size={12} className="text-yellow-500 flex-shrink-0" fill="currentColor" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{story.category}</span>
                        <span>·</span>
                        <span className={`px-1.5 py-0.5 rounded-full font-medium ${story.status === "ongoing" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : story.status === "completed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                          {story.status}
                        </span>
                        <span>·</span>
                        <span className={story.published ? "text-green-600" : "text-muted-foreground"}>{story.published ? "Published" : "Draft"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedStory(story); setView("seasons"); }} data-testid={`button-manage-seasons-${story.id}`}>
                        <Layers size={14} className="mr-1" /> Season
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setStoryDialog({ open: true, story })} data-testid={`button-edit-story-${story.id}`}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteDialog({ open: true, type: "story", id: story.id, name: story.title })} data-testid={`button-delete-story-${story.id}`}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SEASONS VIEW ── */}
        {view === "seasons" && selectedStory && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedStory.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">Kelola season cerita ini</p>
              </div>
              <Button onClick={() => setSeasonDialog({ open: true })} data-testid="button-add-season">
                <Plus size={16} className="mr-1.5" /> Tambah Season
              </Button>
            </div>

            {seasonsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : !seasons?.length ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl">
                <Layers size={36} className="mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground">Belum ada season. Tambahkan season pertama!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {seasons.map(season => (
                  <div key={season.id} className="flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors" data-testid={`card-season-${season.id}`}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{season.seasonNumber}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Season {season.seasonNumber}</p>
                      <p className="text-sm text-muted-foreground">{season.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedSeason(season); setView("chapters"); }} data-testid={`button-manage-chapters-${season.id}`}>
                        <FileText size={14} className="mr-1" /> Bab
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setSeasonDialog({ open: true, season })} data-testid={`button-edit-season-${season.id}`}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteDialog({ open: true, type: "season", id: season.id, name: `Season ${season.seasonNumber}` })} data-testid={`button-delete-season-${season.id}`}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CHAPTERS VIEW ── */}
        {view === "chapters" && selectedSeason && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Season {selectedSeason.seasonNumber} — {selectedSeason.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">Kelola bab untuk season ini</p>
              </div>
              <Button onClick={() => { setEditingChapter(undefined); setView("write"); }} data-testid="button-add-chapter">
                <Plus size={16} className="mr-1.5" /> Tulis Bab Baru
              </Button>
            </div>

            {chaptersLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : !chapters?.length ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl">
                <FileText size={36} className="mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground">Belum ada bab. Mulai menulis!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chapters.map(ch => (
                  <div key={ch.id} className="flex items-center gap-3 p-3.5 border border-border rounded-xl hover:bg-muted/30 transition-colors" data-testid={`card-chapter-${ch.id}`}>
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-muted-foreground">{ch.chapterNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{ch.title}</p>
                      <p className="text-xs text-muted-foreground">{(ch.content ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length} kata</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleChapterPublish.mutate({ id: ch.id, published: !ch.published })}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${ch.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                        data-testid={`button-toggle-publish-${ch.id}`}
                      >
                        {ch.published ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <Button size="icon" variant="ghost" onClick={() => { setEditingChapter(ch); setView("write"); }} data-testid={`button-edit-chapter-${ch.id}`}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteDialog({ open: true, type: "chapter", id: ch.id, name: ch.title })} data-testid={`button-delete-chapter-${ch.id}`}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Story Dialog ── */}
        <Dialog open={storyDialog.open} onOpenChange={open => setStoryDialog({ open })}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{storyDialog.story ? "Edit Cerita" : "Tambah Cerita Baru"}</DialogTitle>
            </DialogHeader>
            <StoryForm
              initial={storyDialog.story}
              onSave={(data) => storyDialog.story
                ? updateStory.mutate({ id: storyDialog.story.id, data })
                : createStory.mutate(data)
              }
              onCancel={() => setStoryDialog({ open: false })}
            />
          </DialogContent>
        </Dialog>

        {/* ── Season Dialog ── */}
        <Dialog open={seasonDialog.open} onOpenChange={open => setSeasonDialog({ open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{seasonDialog.season ? "Edit Season" : "Tambah Season Baru"}</DialogTitle>
            </DialogHeader>
            {selectedStory && (
              <SeasonForm
                storyId={selectedStory.id}
                initial={seasonDialog.season}
                onSave={(data) => seasonDialog.season
                  ? updateSeason.mutate({ id: seasonDialog.season.id, data })
                  : createSeason.mutate(data)
                }
                onCancel={() => setSeasonDialog({ open: false })}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm Dialog ── */}
        <Dialog open={!!deleteDialog?.open} onOpenChange={() => setDeleteDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">
              Yakin ingin menghapus <strong className="text-foreground">"{deleteDialog?.name}"</strong>? Tindakan ini tidak bisa dibatalkan.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog(null)} data-testid="button-cancel-delete">Batal</Button>
              <Button variant="destructive" onClick={handleDelete} data-testid="button-confirm-delete">Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
