import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Lock, Sparkles, ChevronRight, RotateCcw, Music2, MessageCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

// ── Defaults (used when admin hasn't set custom text) ─────────────────────────
const D = {
  gateTitle: "Untuk Kamu, Sayang",
  gateSubtitle: "Halaman ini cuma bisa dibuka oleh satu orang di dunia... kamu. Masukkan tanggal jadian kita ya 🥰",
  introTitle: "Halo, Cinta ✨",
  introMessage: `Kalau kamu baca ini, artinya kamu berhasil masuk ke tempat kecil yang aku buat khusus buat kamu.\nAku cuma mau kamu tahu, betapa bersyukurnya aku punya kamu di hidup aku.\nSetiap hari bareng kamu itu kayak bonus yang aku syukurin terus-terusan.\n\nIni bukan hadiah mewah, cuma kumpulan kata jujur dari hati aku. Scroll pelan-pelan ya 💕`,
  finalQuestion: "Maukah kamu terus jalan bareng aku, sampai kapanpun itu?",
  finalSuccessTitle: "Yeay! 🎉",
  finalSuccessMessage: "Makasih banyak buat selalu ada, sayang. Aku sayang kamu lebih dari kata-kata yang bisa aku tulis di sini. Ini baru permulaan dari banyak hal baik yang akan kita lewati bersama 💖",
  finalNoTease: "Eh jangan gitu dong 🥺 coba pencet lagi...",
  footerNote: "dibuat dengan sepenuh hati oleh Madrols, khusus untuk kamu berdua 🤍",
};

type Stage = "gate" | "intro" | "photos" | "quiz" | "final" | "celebrate";

export default function LoveYou() {
  const [stage, setStage] = useState<Stage>("gate");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });
  const confettiFired = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);

  // Always fetch fresh — staleTime:0 ensures music/photos show immediately after admin save
  const { data: cfg = {} as any } = useQuery<any>({
    queryKey: ["/api/love/config"],
    staleTime: 0,
  });

  // Resolved text values
  const gateTitle = cfg.gateTitle || D.gateTitle;
  const gateSubtitle = cfg.gateSubtitle || D.gateSubtitle;
  const introTitle = cfg.introTitle || D.introTitle;
  const introMessage = cfg.introMessage || D.introMessage;
  const finalQuestion = cfg.finalQuestion || D.finalQuestion;
  const finalSuccessTitle = cfg.finalSuccessTitle || D.finalSuccessTitle;
  const finalSuccessMessage = cfg.finalSuccessMessage || D.finalSuccessMessage;
  const finalNoTease = cfg.finalNoTease || D.finalNoTease;
  const footerNote = cfg.footerNote || D.footerNote;
  const photos: { url: string; caption: string }[] = Array.isArray(cfg.photos) ? cfg.photos : [];
  const quiz: { question: string; options: string[]; correctIndex: number; successMessage: string }[] = Array.isArray(cfg.quiz) ? cfg.quiz : [];
  const musicUrl: string = cfg.musicUrl || "";
  const musicTitle: string = cfg.musicTitle || "";
  const musicStartTime: number = cfg.musicStartTime ?? 0;
  const musicEndTime: number | null = cfg.musicEndTime ?? null;
  const gateImageUrl: string = cfg.gateImageUrl || "";
  const stickerUrl: string = cfg.stickerUrl || "";
  const whatsappNumber: string = cfg.whatsappNumber || "";

  // Keep audioRef synced with the latest musicUrl/range from server
  useEffect(() => {
    if (!musicUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setMusicPlaying(false);
    }
    const audio = new Audio(musicUrl);
    audio.volume = 0.6;
    audio.preload = "auto";
    // Seek to startTime when ready
    audio.addEventListener("canplay", () => {
      if (audio.currentTime < musicStartTime) audio.currentTime = musicStartTime;
    }, { once: true });
    // Time range enforcement via timeupdate
    const onTimeUpdate = () => {
      if (musicEndTime !== null && audio.currentTime >= musicEndTime) {
        audio.currentTime = musicStartTime;
      }
    };
    // Loop back to startTime when track ends (if no endTime)
    const onEnded = () => {
      audio.currentTime = musicStartTime;
      audio.play().catch(() => {});
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audioRef.current = audio;
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [musicUrl, musicStartTime, musicEndTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio || musicPlaying) return;
    // Seek to startTime before playing (in case canplay event didn't fire yet)
    if (musicStartTime > 0 && audio.currentTime < musicStartTime) {
      audio.currentTime = musicStartTime;
    }
    audio.play().then(() => setMusicPlaying(true)).catch(() => {});
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/love/verify", { password });
      const data = await res.json();
      if (data.valid) {
        // Must call play() here — still within user gesture chain
        // Also create audio on-the-fly if somehow not pre-loaded yet
        if (!audioRef.current && musicUrl) {
          const audio = new Audio(musicUrl);
          audio.loop = true;
          audio.volume = 0.6;
          audioRef.current = audio;
        }
        startMusic();
        setStage("intro");
      } else {
        setError("Hmm, coba lagi ya. Pastiin formatnya bener 💭");
      }
    } catch {
      setError("Ada gangguan, coba lagi sebentar ya.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowQuizFeedback(true);
  };

  const handleNextQuiz = () => {
    setSelected(null);
    setShowQuizFeedback(false);
    if (quizIndex < quiz.length - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      setStage("final");
    }
  };

  const handleYes = () => setStage("celebrate");
  const dodgeNoButton = () => {
    const x = Math.random() * 160 - 80;
    const y = Math.random() * 60 - 30;
    setNoBtnPos({ x, y });
  };

  useEffect(() => {
    if (stage === "celebrate" && !confettiFired.current) {
      confettiFired.current = true;
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ["#ff6b9d", "#ff8fab", "#ffb3c6", "#fff", "#ffd1dc"];
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors });
    }
  }, [stage]);

  const nextAfterIntro = photos.length > 0 ? "photos" : quiz.length > 0 ? "quiz" : "final";
  const nextAfterPhotos = quiz.length > 0 ? "quiz" : "final";

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950 dark:via-neutral-950 dark:to-rose-950 relative overflow-hidden">
      <FloatingHearts />

      {/* Music indicator */}
      {stage !== "gate" && musicUrl && (
        <button
          onClick={toggleMusic}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-rose-200/50 dark:border-rose-800/30 shadow-sm text-xs text-rose-600 dark:text-rose-400 hover:bg-white dark:hover:bg-black/70 transition-colors"
          data-testid="button-music-toggle"
        >
          <Music2 className={`w-3.5 h-3.5 ${musicPlaying ? "animate-pulse" : ""}`} />
          {musicPlaying ? (musicTitle || "♪ Playing") : "▶ Play musik"}
        </button>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          {/* GATE */}
          {stage === "gate" && (
            <motion.div key="gate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-gate">
              {gateImageUrl ? (
                <img src={gateImageUrl} alt="Gate" className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-rose-200 dark:border-rose-800 shadow mb-5" />
              ) : (
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mb-5">
                  <Lock className="w-7 h-7 text-rose-500" />
                </div>
              )}
              <h1 className="text-2xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-2" data-testid="text-gate-title">{gateTitle}</h1>
              <p className="text-sm text-rose-700/80 dark:text-rose-300/80 mb-6" data-testid="text-gate-subtitle">{gateSubtitle}</p>
              <form onSubmit={handleUnlock} className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="DDMMYYYY"
                  className="w-full text-center text-lg tracking-widest rounded-xl border border-rose-200 dark:border-rose-800 bg-white/70 dark:bg-black/30 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-900 dark:text-rose-100"
                  data-testid="input-love-password"
                  autoFocus
                />
                {error && <p className="text-sm text-rose-500" data-testid="text-gate-error">{error}</p>}
                <button type="submit" disabled={loading || !password}
                  className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium py-3 transition-colors flex items-center justify-center gap-2"
                  data-testid="button-unlock">
                  {loading ? "Membuka..." : "Buka"}
                  <Heart className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* INTRO */}
          {stage === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-lg w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-intro">
              <Sparkles className="w-8 h-8 text-rose-400 mb-4" />
              <h1 className="text-3xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-4" data-testid="text-intro-title">{introTitle}</h1>
              <p className="text-rose-800/90 dark:text-rose-200/90 whitespace-pre-line leading-relaxed mb-8" data-testid="text-intro-message">{introMessage}</p>
              <button onClick={() => setStage(nextAfterIntro)}
                className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 transition-colors flex items-center justify-center gap-2"
                data-testid="button-continue-intro">
                Lanjut <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* PHOTOS */}
          {stage === "photos" && photos.length > 0 && (
            <motion.div key="photos" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-lg w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-photos">
              <h2 className="text-2xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-5">Momen Kita 📸</h2>
              <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
                {photos.map((p, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <img src={p.url} alt={p.caption} className="w-full aspect-[4/3] object-cover" />
                    {p.caption && <p className="text-sm text-rose-700/80 dark:text-rose-300/80 mt-2">{p.caption}</p>}
                  </div>
                ))}
              </div>
              <button onClick={() => setStage(nextAfterPhotos)}
                className="w-full mt-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 transition-colors flex items-center justify-center gap-2"
                data-testid="button-continue-photos">
                Lanjut <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* QUIZ */}
          {stage === "quiz" && quiz.length > 0 && (
            <motion.div key={`quiz-${quizIndex}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="max-w-lg w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-quiz">
              <p className="text-xs uppercase tracking-wide text-rose-400 mb-2">Kuis Kenangan {quizIndex + 1}/{quiz.length}</p>
              <h2 className="text-xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-6" data-testid="text-quiz-question">{quiz[quizIndex].question}</h2>
              <div className="space-y-3 mb-4">
                {quiz[quizIndex].options.map((opt, i) => {
                  const isCorrect = i === quiz[quizIndex].correctIndex;
                  const isSelected = selected === i;
                  return (
                    <button key={i} onClick={() => handleQuizAnswer(i)} disabled={selected !== null}
                      className={`w-full text-left rounded-xl border py-3 px-4 transition-colors ${
                        isSelected && isCorrect ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : isSelected && !isCorrect ? "border-rose-300 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300"
                        : "border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      }`}
                      data-testid={`button-quiz-option-${i}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {showQuizFeedback && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-rose-600 dark:text-rose-300 mb-4" data-testid="text-quiz-feedback">
                    {selected === quiz[quizIndex].correctIndex
                      ? quiz[quizIndex].successMessage || "Bener! 😍"
                      : "Hehe gapapa, yang penting kita di sini bareng terus 😌"}
                  </motion.div>
                )}
              </AnimatePresence>
              {showQuizFeedback && (
                <button onClick={handleNextQuiz}
                  className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 transition-colors flex items-center justify-center gap-2"
                  data-testid="button-next-quiz">
                  Lanjut <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}

          {/* FINAL */}
          {stage === "final" && (
            <motion.div key="final" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-final">
              <Heart className="w-10 h-10 text-rose-500 mx-auto mb-5 fill-rose-500" />
              <h2 className="text-2xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-8" data-testid="text-final-question">{finalQuestion}</h2>
              <div className="relative flex items-center justify-center gap-4 h-14">
                <button onClick={handleYes}
                  className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-8 transition-colors"
                  data-testid="button-final-yes">
                  Iya, mau!
                </button>
                <motion.button animate={{ x: noBtnPos.x, y: noBtnPos.y }}
                  onMouseEnter={dodgeNoButton} onClick={dodgeNoButton}
                  className="rounded-xl border border-rose-300 dark:border-rose-700 text-rose-500 font-medium py-3 px-8"
                  data-testid="button-final-no">
                  Nggak
                </motion.button>
              </div>
              <p className="text-xs text-rose-400 mt-4">{finalNoTease}</p>
            </motion.div>
          )}

          {/* CELEBRATE */}
          {stage === "celebrate" && (
            <motion.div key="celebrate" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg w-full bg-white/90 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-celebrate">
              {stickerUrl ? (
                <motion.img
                  src={stickerUrl}
                  alt="stiker"
                  className="w-28 h-28 object-contain mx-auto mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  data-testid="img-sticker"
                />
              ) : (
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="text-5xl mb-4">💖</motion.div>
              )}
              <h2 className="text-3xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-4" data-testid="text-celebrate-title">{finalSuccessTitle}</h2>
              <p className="text-rose-800/90 dark:text-rose-200/90 leading-relaxed mb-6" data-testid="text-celebrate-message">{finalSuccessMessage}</p>
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors mb-5"
                  data-testid="button-whatsapp-share"
                >
                  <MessageCircle className="w-4 h-4" />
                  Kirim pesan ke WhatsApp
                </a>
              )}
              <button onClick={() => { setStage("intro"); setQuizIndex(0); setSelected(null); setShowQuizFeedback(false); confettiFired.current = false; }}
                className="text-sm text-rose-400 hover:text-rose-500 flex items-center gap-1 mx-auto"
                data-testid="button-replay">
                <RotateCcw className="w-3.5 h-3.5" /> Baca lagi dari awal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-rose-400/70 z-10" data-testid="text-footer-note">
        {footerNote}
      </p>
    </div>
  );
}

function FloatingHearts() {
  const hearts = Array.from({ length: 12 });
  return (
    <div className="absolute inset-0 pointer-events-none">
      {hearts.map((_, i) => (
        <motion.div key={i} className="absolute text-rose-300/40 dark:text-rose-700/30"
          style={{ left: `${(i * 8.3) % 100}%`, fontSize: `${12 + (i % 4) * 6}px` }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 12 + (i % 5) * 3, repeat: Infinity, delay: i * 1.3, ease: "linear" }}>
          <Heart className="fill-current" />
        </motion.div>
      ))}
    </div>
  );
}
