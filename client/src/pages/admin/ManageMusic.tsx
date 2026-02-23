import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useMusicTracks, useCreateMusicTrack, useUpdateMusicTrack, useDeleteMusicTrack } from "@/hooks/use-music";
import { Button, Input, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManageMusic() {
  const { data: tracks } = useMusicTracks();
  const { mutateAsync: createTrack } = useCreateMusicTrack();
  const { mutateAsync: updateTrack } = useUpdateMusicTrack();
  const { mutateAsync: deleteTrack } = useDeleteMusicTrack();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
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
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm(prev => ({ ...prev, [field]: data.url }));
      toast({ title: "File uploaded successfully" });
    } catch (error) {
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
        await updateTrack({ id: editingId, data: form });
        toast({ title: "Track updated successfully." });
      } else {
        await createTrack(form);
        toast({ title: "Track added successfully." });
      }
      setModalOpen(false);
    } catch (error) {
      toast({ title: "Error saving track", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Sound Library</h1>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} /> Add Track
        </Button>
      </div>

      <div className="border-2 border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground font-bold uppercase tracking-widest border-b-2 border-border">
            <tr>
              <th className="p-4">Track</th>
              <th className="p-4">Artist</th>
              <th className="p-4">Duration</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {tracks?.map(track => (
              <tr key={track.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4 font-serif font-bold text-lg flex items-center gap-3">
                  {track.albumArt && <img src={track.albumArt} alt="Art" className="w-8 h-8 grayscale" />}
                  {track.title}
                </td>
                <td className="p-4 text-muted-foreground">{track.artist}</td>
                <td className="p-4 font-mono">{track.duration || "—"}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEdit(track)} className="p-2 border-2 border-border hover:bg-primary hover:text-primary-foreground transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(track.id)} className="p-2 border-2 border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Track" : "Add Track"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Track Title</Label>
            <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <Label>Artist</Label>
            <Input required value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
          </div>
          <div>
            <Label>Audio File</Label>
            <Input type="file" accept="audio/*" onChange={e => handleFileUpload(e, "audioUrl")} />
            <Input required value={form.audioUrl} onChange={e => setForm({...form, audioUrl: e.target.value})} placeholder="Or enter URL" />
          </div>
          <div>
            <Label>Album Art</Label>
            <Input type="file" accept="image/*" onChange={e => handleFileUpload(e, "albumArt")} />
            <Input value={form.albumArt} onChange={e => setForm({...form, albumArt: e.target.value})} placeholder="Or enter URL" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="autoplay" checked={form.isAutoPlay} onChange={e => setForm({...form, isAutoPlay: e.target.checked})} className="w-4 h-4" />
            <Label htmlFor="autoplay">Set as Autoplay Song</Label>
          </div>
          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : "Save Track"}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
