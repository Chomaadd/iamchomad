import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Heart, Plus, Trash2, Loader2, Upload, Music, Image, Clock, FileText, MessageSquare } from "lucide-react";

type Photo = { url: string; caption: string };
type QuizQuestion = { question: string; options: string[]; correctIndex: number; successMessage: string };

const DEFAULT_TEXTS = {
  gateTitle: "Untuk Kamu, Sayang",
  gateSubtitle: "Halaman ini cuma bisa dibuka oleh satu orang di dunia... kamu. Masukkan tanggal jadian kita ya 🥰",
  introTitle: "Halo, Cinta ✨",
  introMessage: "Kalau kamu baca ini, artinya kamu berhasil masuk ke tempat kecil yang aku buat khusus buat kamu.\nAku cuma mau kamu tahu, betapa bersyukurnya aku punya kamu di hidup aku.",
  finalQuestion: "Maukah kamu terus jalan bareng aku, sampai kapanpun itu?",
  finalSuccessTitle: "Yeay! 🎉",
  finalSuccessMessage: "Makasih banyak buat selalu ada, sayang. Aku sayang kamu lebih dari kata-kata yang bisa aku tulis di sini.",
  finalNoTease: "Eh jangan gitu dong 🥺 coba pencet lagi...",
  footerNote: "dibuat dengan sepenuh hati oleh Madrols, khusus untuk kamu berdua 🤍",
};

export default function ManageLove() {
  const { toast } = useToast();

  const { data: cfg, isLoading } = useQuery<any>({ queryKey: ["/api/love/config"] });
  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"] });

  const [texts, setTexts] = useState({
    gateTitle: "", gateSubtitle: "", introTitle: "", introMessage: "",
    finalQuestion: "", finalSuccessTitle: "", finalSuccessMessage: "",
    finalNoTease: "", footerNote: "",
  });
  const [musicUrl, setMusicUrl] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [sessionExpiryHours, setSessionExpiryHours] = useState<number | "">(24);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (cfg) {
      setTexts({
        gateTitle: cfg.gateTitle || DEFAULT_TEXTS.gateTitle,
        gateSubtitle: cfg.gateSubtitle || DEFAULT_TEXTS.gateSubtitle,
        introTitle: cfg.introTitle || DEFAULT_TEXTS.introTitle,
        introMessage: cfg.introMessage || DEFAULT_TEXTS.introMessage,
        finalQuestion: cfg.finalQuestion || DEFAULT_TEXTS.finalQuestion,
        finalSuccessTitle: cfg.finalSuccessTitle || DEFAULT_TEXTS.finalSuccessTitle,
        finalSuccessMessage: cfg.finalSuccessMessage || DEFAULT_TEXTS.finalSuccessMessage,
        finalNoTease: cfg.finalNoTease || DEFAULT_TEXTS.finalNoTease,
        footerNote: cfg.footerNote || DEFAULT_TEXTS.footerNote,
      });
      setMusicUrl(cfg.musicUrl || "");
      setMusicTitle(cfg.musicTitle || "");
      setPhotos(cfg.photos || []);
      setQuiz(cfg.quiz?.length > 0 ? cfg.quiz : []);
    }
    if (settings) {
      setSessionExpiryHours(settings.loveSessionExpiryHours ?? 24);
    }
  }, [cfg, settings]);

  const { mutateAsync: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/love/config", {
        loveGateTitle: texts.gateTitle,
        loveGateSubtitle: texts.gateSubtitle,
        loveIntroTitle: texts.introTitle,
        loveIntroMessage: texts.introMessage,
        loveFinalQuestion: texts.finalQuestion,
        loveFinalSuccessTitle: texts.finalSuccessTitle,
        loveFinalSuccessMessage: texts.finalSuccessMessage,
        loveFinalNoTease: texts.finalNoTease,
        loveFooterNote: texts.footerNote,
        loveMusicUrl: musicUrl,
        loveMusicTitle: musicTitle,
        loveSessionExpiryHours: sessionExpiryHours === "" ? null : Number(sessionExpiryHours),
        lovePhotos: JSON.stringify(photos),
        loveQuiz: JSON.stringify(quiz),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/love/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "💾 Tersimpan!", description: "Halaman cinta sudah diperbarui." });
    },
    onError: () => toast({ title: "Gagal menyimpan", variant: "destructive" }),
  });

  const uploadFile = async (file: File, onDone: (url: string, extra?: any) => void) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    onDone(data.url, data);
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("music");
    try {
      await uploadFile(file, (url) => {
        setMusicUrl(url);
        if (!musicTitle) setMusicTitle(file.name.replace(/\.[^.]+$/, ""));
      });
      toast({ title: "🎵 Musik berhasil diupload!" });
    } catch {
      toast({ title: "Upload gagal", variant: "destructive" });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(`photo-${idx ?? "new"}`);
    try {
      await uploadFile(file, (url) => {
        if (idx !== undefined) {
          setPhotos(p => p.map((ph, i) => i === idx ? { ...ph, url } : ph));
        } else {
          setPhotos(p => [...p, { url, caption: "" }]);
        }
      });
      toast({ title: "📸 Foto berhasil diupload!" });
    } catch {
      toast({ title: "Upload gagal", variant: "destructive" });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const addQuizQuestion = () => setQuiz(q => [...q, {
    question: "", options: ["", "", ""], correctIndex: 0, successMessage: ""
  }]);
  const removeQuizQuestion = (i: number) => setQuiz(q => q.filter((_, idx) => idx !== i));
  const updateQuiz = (i: number, field: keyof QuizQuestion, value: any) =>
    setQuiz(q => q.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  const updateQuizOption = (qi: number, oi: number, val: string) =>
    setQuiz(q => q.map((item, idx) => idx === qi ? { ...item, options: item.options.map((o, oidx) => oidx === oi ? val : o) } : item));

  if (isLoading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-rose-400" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Halaman Cinta 💌</h1>
              <p className="text-sm text-muted-foreground">Kelola konten halaman <code className="text-rose-500">/i-love-you</code></p>
            </div>
          </div>
          <button
            onClick={() => save()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors disabled:opacity-50"
            data-testid="button-save-love"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Simpan Semua
          </button>
        </div>

        {/* Session Expiry */}
        <Section icon={<Clock className="w-4 h-4" />} title="Session Expiry" desc="Halaman akan terkunci lagi setelah beberapa jam">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={sessionExpiryHours}
              onChange={e => setSessionExpiryHours(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 24"
              className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              data-testid="input-session-expiry"
            />
            <span className="text-sm text-muted-foreground">jam (0 = tidak pernah kunci)</span>
          </div>
        </Section>

        {/* Gate */}
        <Section icon={<FileText className="w-4 h-4" />} title="Halaman Password" desc="Teks yang muncul sebelum si doi masukin password">
          <Field label="Judul">
            <input value={texts.gateTitle} onChange={e => setTexts(t => ({ ...t, gateTitle: e.target.value }))}
              className={inputCls} data-testid="input-gate-title" />
          </Field>
          <Field label="Subjudul">
            <textarea value={texts.gateSubtitle} onChange={e => setTexts(t => ({ ...t, gateSubtitle: e.target.value }))}
              rows={2} className={textareaCls} data-testid="input-gate-subtitle" />
          </Field>
        </Section>

        {/* Intro */}
        <Section icon={<MessageSquare className="w-4 h-4" />} title="Halaman Intro" desc="Surat pembuka yang muncul setelah password benar">
          <Field label="Judul">
            <input value={texts.introTitle} onChange={e => setTexts(t => ({ ...t, introTitle: e.target.value }))}
              className={inputCls} data-testid="input-intro-title" />
          </Field>
          <Field label="Pesan (bisa multi-baris)">
            <textarea value={texts.introMessage} onChange={e => setTexts(t => ({ ...t, introMessage: e.target.value }))}
              rows={6} className={textareaCls} data-testid="input-intro-message" />
          </Field>
        </Section>

        {/* Music */}
        <Section icon={<Music className="w-4 h-4" />} title="Musik Romantis" desc="Otomatis diputar saat halaman terbuka setelah password">
          <Field label="Judul Lagu">
            <input value={musicTitle} onChange={e => setMusicTitle(e.target.value)}
              placeholder="Nama lagu..." className={inputCls} data-testid="input-music-title" />
          </Field>
          <Field label="Upload File Audio">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-dashed border-rose-300 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors text-sm text-muted-foreground">
                {uploading === "music" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading === "music" ? "Mengupload..." : "Pilih file MP3/audio"}
                <input type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} data-testid="input-music-upload" />
              </label>
              {musicUrl && (
                <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  <Music className="w-3.5 h-3.5" />
                  Musik sudah diset
                  <button onClick={() => setMusicUrl("")} className="text-muted-foreground hover:text-destructive ml-1">✕</button>
                </div>
              )}
            </div>
            {musicUrl && (
              <audio controls src={musicUrl} className="mt-2 w-full h-10 rounded-lg" />
            )}
          </Field>
        </Section>

        {/* Photos */}
        <Section icon={<Image className="w-4 h-4" />} title="Foto Kenangan" desc="Galeri foto yang muncul setelah intro (opsional)">
          <div className="space-y-3">
            {photos.map((photo, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-xl border border-border bg-muted/30">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  {photo.url
                    ? <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                  }
                </div>
                <div className="flex-1 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-rose-400 transition-colors text-xs text-muted-foreground w-fit">
                    {uploading === `photo-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Ganti foto
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, i)} />
                  </label>
                  <input
                    value={photo.caption}
                    onChange={e => setPhotos(p => p.map((ph, idx) => idx === i ? { ...ph, caption: e.target.value } : ph))}
                    placeholder="Caption foto..."
                    className={inputCls + " text-sm"}
                  />
                </div>
                <button onClick={() => setPhotos(p => p.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-border hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 cursor-pointer transition-colors text-sm text-muted-foreground">
              {uploading?.startsWith("photo-new") ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tambah Foto
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e)} data-testid="input-photo-add" />
            </label>
          </div>
        </Section>

        {/* Quiz */}
        <Section icon={<MessageSquare className="w-4 h-4" />} title="Kuis Kenangan" desc="Pertanyaan multiple choice sebelum halaman akhir">
          <div className="space-y-4">
            {quiz.map((q, qi) => (
              <div key={qi} className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Pertanyaan {qi + 1}</span>
                  <button onClick={() => removeQuizQuestion(qi)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Field label="Pertanyaan">
                  <input value={q.question} onChange={e => updateQuiz(qi, "question", e.target.value)}
                    placeholder="Pertama kali kita ketemu di mana?" className={inputCls} />
                </Field>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Pilihan Jawaban</label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correctIndex === oi}
                        onChange={() => updateQuiz(qi, "correctIndex", oi)}
                        className="accent-rose-500"
                        title="Tandai sebagai jawaban benar"
                      />
                      <input value={opt} onChange={e => updateQuizOption(qi, oi, e.target.value)}
                        placeholder={`Pilihan ${oi + 1}${q.correctIndex === oi ? " (jawaban benar)" : ""}`}
                        className={inputCls + " flex-1 text-sm"} />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">● Klik radio button di kiri untuk tandai jawaban benar</p>
                </div>
                <Field label="Pesan saat jawaban benar">
                  <input value={q.successMessage} onChange={e => updateQuiz(qi, "successMessage", e.target.value)}
                    placeholder="Yes! Aku masih ingat banget momen itu 😍" className={inputCls} />
                </Field>
              </div>
            ))}
            <button onClick={addQuizQuestion} data-testid="button-add-quiz"
              className="flex items-center gap-2 w-full py-3 rounded-xl border border-dashed border-border hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors text-sm text-muted-foreground justify-center">
              <Plus className="w-4 h-4" /> Tambah Pertanyaan
            </button>
          </div>
        </Section>

        {/* Final */}
        <Section icon={<Heart className="w-4 h-4" />} title="Halaman Akhir & Perayaan" desc="Pertanyaan akhir dan pesan setelah si doi klik 'Iya'">
          <Field label="Pertanyaan Akhir">
            <input value={texts.finalQuestion} onChange={e => setTexts(t => ({ ...t, finalQuestion: e.target.value }))}
              className={inputCls} data-testid="input-final-question" />
          </Field>
          <Field label="Judul Perayaan">
            <input value={texts.finalSuccessTitle} onChange={e => setTexts(t => ({ ...t, finalSuccessTitle: e.target.value }))}
              className={inputCls} data-testid="input-final-success-title" />
          </Field>
          <Field label="Pesan Perayaan">
            <textarea value={texts.finalSuccessMessage} onChange={e => setTexts(t => ({ ...t, finalSuccessMessage: e.target.value }))}
              rows={4} className={textareaCls} data-testid="input-final-success-message" />
          </Field>
          <Field label="Teks goda tombol 'Tidak'">
            <input value={texts.finalNoTease} onChange={e => setTexts(t => ({ ...t, finalNoTease: e.target.value }))}
              className={inputCls} data-testid="input-final-no-tease" />
          </Field>
        </Section>

        {/* Footer */}
        <Section icon={<FileText className="w-4 h-4" />} title="Catatan Footer" desc="Teks kecil di bagian paling bawah halaman">
          <Field label="Footer note">
            <input value={texts.footerNote} onChange={e => setTexts(t => ({ ...t, footerNote: e.target.value }))}
              className={inputCls} data-testid="input-footer-note" />
          </Field>
        </Section>

        <div className="pb-8 flex justify-end">
          <button
            onClick={() => save()}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4 fill-white" />}
            Simpan Semua Perubahan
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function Section({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">{icon}</div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition-shadow";
const textareaCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition-shadow resize-none";
