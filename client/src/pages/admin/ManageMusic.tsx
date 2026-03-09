import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useMusicTracks, useCreateMusicTrack, useUpdateMusicTrack, useDeleteMusicTrack } from "@/hooks/use-music";
import { Button, Input, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2, Loader2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManageMusic() {
  const { data: tracks } = useMusicTracks();
  const { mutateAsync: createTrack } = useCreateMusicTrack();
  const { mutateAsync: updateTrack } = useUpdateMusicTrack();
  const { mutateAsync: deleteTrack } = useDeleteMusicTrack();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    artist: "",
    audioUrl: "",
    albumArt: "",
    duration: "",
    isAutoPlay: false
  });

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
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
      
      setForm(prev => {
        const next = { ...prev, [field]: data.url };
        if (data.duration && field === "audioUrl") {
          next.duration = data.duration;
        }
        return next;
      });
      
      toast({ title: "File uploaded successfully" });
    } catch (error) {
        console.error("Upload error:", error);
        toast({ title: "Upload failed", variant: "destructive" });
      } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", artist: "", audioUrl: "", albumArt: "", duration: "", isAutoPlay: false });
    setModalOpen(true);
  };

  const openEdit = (track: any) => {
    setEditingId(track.id);
    setForm({
      title: track.title,
      artist: track.artist,
      audioUrl: track.audioUrl,
      albumArt: track.albumArt || "",
      duration: track.duration || "",
      isAutoPlay: track.isAutoPlay || false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTrack({ id: editingId, data: { ...form, isAutoPlay: Boolean(form.isAutoPlay) } });
        toast({ title: "Track updated successfully." });
      } else {
        await createTrack({ ...form, isAutoPlay: Boolean(form.isAutoPlay) });
        toast({ title: "Track added successfully." });
      }
      setModalOpen(false);
    } catch (error) {
      toast({ title: "Error saving track", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this track?")) {
      try {
        await deleteTrack(id);
        toast({ title: "Track deleted." });
      } catch (error) {
        toast({ title: "Error deleting track", variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-music-title">Sound Library</h1>
          <p className="text-sm text-muted-foreground mt-1">{tracks?.length || 0} tracks</p>
        </div>
        <Button onClick={openCreate} className="gap-2" data-testid="button-add-track">
          <Plus size={16} /> Add Track
        </Button>
      </div>

      <div className="space-y-3">
        {tracks?.map((track, i) => (
          <div
            key={track.id}
            className="group flex items-center gap-4 border border-border rounded-lg p-4 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
            data-testid={`card-track-${track.id}`}
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
              {track.albumArt ? (
                <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play size={16} className="text-muted-foreground" />
                </div>
              )}
              {track.isAutoPlay && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate">{track.title}</p>
                {track.isAutoPlay && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-primary/10 text-primary rounded">Auto</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{track.artist}</p>
            </div>

            <div className="text-xs font-mono text-muted-foreground tabular-nums shrink-0 hidden sm:block">
              {track.duration || "--:--"}
            </div>

            <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => openEdit(track)} className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors" data-testid={`button-edit-track-${track.id}`}><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(track.id)} className="p-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors" data-testid={`button-delete-track-${track.id}`}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {tracks?.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground text-sm italic">
            No tracks uploaded yet.
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Track" : "Add Track"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Track Title</Label>
            <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} data-testid="input-track-title" />
          </div>
          <div>
            <Label>Artist</Label>
            <Input required value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} data-testid="input-track-artist" />
          </div>
          <div>
            <Label>Audio File</Label>
            <Input type="file" accept="audio/*" onChange={e => handleFileUpload(e, "audioUrl")} data-testid="input-track-audio" />
            <Input required value={form.audioUrl} onChange={e => setForm({...form, audioUrl: e.target.value})} placeholder="Or enter URL" className="mt-1" />
          </div>
          <div>
            <Label>Album Art</Label>
            <Input type="file" accept="image/*" onChange={e => handleFileUpload(e, "albumArt")} data-testid="input-track-art" />
            <Input value={form.albumArt} onChange={e => setForm({...form, albumArt: e.target.value})} placeholder="Or enter URL" className="mt-1" />
          </div>
          <div>
            <Label>Duration</Label>
            <Input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="Auto-detected or enter manually (e.g. 3:45)" data-testid="input-track-duration" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="autoplay" checked={form.isAutoPlay} onChange={e => setForm({...form, isAutoPlay: e.target.checked})} className="w-4 h-4 accent-primary rounded" data-testid="input-track-autoplay" />
            <Label htmlFor="autoplay">Set as Autoplay Song</Label>
          </div>
          <Button type="submit" className="w-full" disabled={uploading} data-testid="button-save-track">
            {uploading ? <Loader2 className="animate-spin" /> : "Save Track"} 
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
