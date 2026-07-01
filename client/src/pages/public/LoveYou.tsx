import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Lock, Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// ============================================================
// EDIT THIS SECTION untuk custom foto & kata-kata 💌
// ============================================================

const GATE_TITLE = "Untuk Kamu, Sayang";
const GATE_SUBTITLE = "Halaman ini cuma bisa dibuka oleh satu orang di dunia... kamu. Masukkan tanggal jadian kita ya 🥰";

const INTRO_TITLE = "Halo, Cinta ✨";
const INTRO_MESSAGE = `Kalau kamu baca ini, artinya kamu berhasil masuk ke tempat kecil yang aku buat khusus buat kamu.
Aku cuma mau kamu tahu, betapa bersyukurnya aku punya kamu di hidup aku.
Setiap hari bareng kamu itu kayak bonus yang aku syukurin terus-terusan.

Ini bukan hadiah mewah, cuma kumpulan kata jujur dari hati aku. Scroll pelan-pelan ya 💕`;

// Ganti array ini dengan foto kalian berdua (taruh file di client/src/assets lalu import, atau pakai URL)
const PHOTOS: { src: string; caption: string }[] = [
  // { src: fotoSatu, caption: "Momen favorit aku sama kamu" },
];

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  successMessage: string;
};

// Ganti pertanyaan ini sesuai kenangan asli kalian berdua
const QUIZ: QuizQuestion[] = [
  {
    question: "Pertama kali kita ketemu itu di mana?",
    options: ["Ganti dengan pilihan A", "Ganti dengan pilihan B (jawaban benar)", "Ganti dengan pilihan C"],
    correctIndex: 1,
    successMessage: "Yes! Aku masih ingat banget momen itu 😍",
  },
  {
    question: "Apa makanan favorit kita kalau lagi jalan bareng?",
    options: ["Ganti dengan pilihan A (jawaban benar)", "Ganti dengan pilihan B", "Ganti dengan pilihan C"],
    correctIndex: 0,
    successMessage: "Bener! Kamu emang paling ngerti soal ini 🥹",
  },
  {
    question: "Kalau aku sedih, apa yang biasanya kamu lakuin?",
    options: ["Ganti dengan pilihan A", "Ganti dengan pilihan B", "Ganti dengan pilihan C (jawaban benar)"],
    correctIndex: 2,
    successMessage: "Itu dia. Makasih selalu ada buat aku ❤️",
  },
];

const FINAL_QUESTION = "Maukah kamu terus jalan bareng aku, sampai kapanpun itu?";
const FINAL_SUCCESS_TITLE = "Yeay! 🎉";
const FINAL_SUCCESS_MESSAGE =
  "Makasih banyak buat selalu ada, sayang. Aku sayang kamu lebih dari kata-kata yang bisa aku tulis di sini. Ini baru permulaan dari banyak hal baik yang akan kita lewati bersama 💖";
const FINAL_NO_TEASE = "Eh jangan gitu dong 🥺 coba pencet lagi...";

const SLUG_NOTE_FOOTER = "dibuat dengan sepenuh hati oleh Madrols, khusus untuk kamu berdua 🤍";

// ============================================================

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

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/love/verify", { password });
      const data = await res.json();
      if (data.valid) {
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
    if (quizIndex < QUIZ.length - 1) {
      setQuizIndex((i) => i + 1);
    } else {
      setStage("final");
    }
  };

  const handleYes = () => {
    setStage("celebrate");
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950 dark:via-neutral-950 dark:to-rose-950 relative overflow-hidden">
      <FloatingHearts />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          {stage === "gate" && (
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-gate"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mb-5">
                <Lock className="w-7 h-7 text-rose-500" />
              </div>
              <h1 className="text-2xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-2" data-testid="text-gate-title">
                {GATE_TITLE}
              </h1>
              <p className="text-sm text-rose-700/80 dark:text-rose-300/80 mb-6" data-testid="text-gate-subtitle">
                {GATE_SUBTITLE}
              </p>
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
                {error && (
                  <p className="text-sm text-rose-500" data-testid="text-gate-error">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium py-3 transition-colors flex items-center justify-center gap-2"
                  data-testid="button-unlock"
                >
                  {loading ? "Membuka..." : "Buka"}
                  <Heart className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {stage === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-intro"
            >
              <Sparkles className="w-8 h-8 text-rose-400 mb-4" />
              <h1 className="text-3xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-4" data-testid="text-intro-title">
                {INTRO_TITLE}
              </h1>
              <p className="text-rose-800/90 dark:text-rose-200/90 whitespace-pre-line leading-relaxed mb-8" data-testid="text-intro-message">
                {INTRO_MESSAGE}
              </p>
              <button
                onClick={() => setStage(PHOTOS.length > 0 ? "photos" : "quiz")}
                className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 transition-colors flex items-center justify-center gap-2"
                data-testid="button-continue-intro"
              >
                Lanjut <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {stage === "photos" && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-photos"
            >
              <h2 className="text-2xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-5">
                Momen Kita 📸
              </h2>
              <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
                {PHOTOS.map((p, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <img src={p.src} alt={p.caption} className="w-full aspect-[4/3] object-cover" />
                    <p className="text-sm text-rose-700/80 dark:text-rose-300/80 mt-2">{p.caption}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStage("quiz")}
                className="w-full mt-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 transition-colors flex items-center justify-center gap-2"
                data-testid="button-continue-photos"
              >
                Lanjut <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {stage === "quiz" && (
            <motion.div
              key={`quiz-${quizIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="max-w-lg w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-quiz"
            >
              <p className="text-xs uppercase tracking-wide text-rose-400 mb-2">
                Kuis Kenangan {quizIndex + 1}/{QUIZ.length}
              </p>
              <h2 className="text-xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-6" data-testid="text-quiz-question">
                {QUIZ[quizIndex].question}
              </h2>
              <div className="space-y-3 mb-4">
                {QUIZ[quizIndex].options.map((opt, i) => {
                  const isCorrect = i === QUIZ[quizIndex].correctIndex;
                  const isSelected = selected === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      disabled={selected !== null}
                      className={`w-full text-left rounded-xl border py-3 px-4 transition-colors ${
                        isSelected && isCorrect
                          ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                          : isSelected && !isCorrect
                          ? "border-rose-300 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300"
                          : "border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      }`}
                      data-testid={`button-quiz-option-${i}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {showQuizFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-rose-600 dark:text-rose-300 mb-4"
                    data-testid="text-quiz-feedback"
                  >
                    {selected === QUIZ[quizIndex].correctIndex
                      ? QUIZ[quizIndex].successMessage
                      : "Hehe gapapa, yang penting kita di sini bareng terus 😌"}
                  </motion.div>
                )}
              </AnimatePresence>
              {showQuizFeedback && (
                <button
                  onClick={handleNextQuiz}
                  className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 transition-colors flex items-center justify-center gap-2"
                  data-testid="button-next-quiz"
                >
                  Lanjut <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}

          {stage === "final" && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-final"
            >
              <Heart className="w-10 h-10 text-rose-500 mx-auto mb-5 fill-rose-500" />
              <h2 className="text-2xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-8" data-testid="text-final-question">
                {FINAL_QUESTION}
              </h2>
              <div className="relative flex items-center justify-center gap-4 h-14">
                <button
                  onClick={handleYes}
                  className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-8 transition-colors"
                  data-testid="button-final-yes"
                >
                  Iya, mau!
                </button>
                <motion.button
                  animate={{ x: noBtnPos.x, y: noBtnPos.y }}
                  onMouseEnter={dodgeNoButton}
                  onClick={dodgeNoButton}
                  className="rounded-xl border border-rose-300 dark:border-rose-700 text-rose-500 font-medium py-3 px-8"
                  data-testid="button-final-no"
                >
                  Nggak
                </motion.button>
              </div>
              <p className="text-xs text-rose-400 mt-4">{FINAL_NO_TEASE}</p>
            </motion.div>
          )}

          {stage === "celebrate" && (
            <motion.div
              key="celebrate"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg w-full bg-white/90 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-rose-200/50 dark:border-rose-800/30"
              data-testid="stage-celebrate"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="text-5xl mb-4"
              >
                💖
              </motion.div>
              <h2 className="text-3xl font-serif font-semibold text-rose-900 dark:text-rose-100 mb-4" data-testid="text-celebrate-title">
                {FINAL_SUCCESS_TITLE}
              </h2>
              <p className="text-rose-800/90 dark:text-rose-200/90 leading-relaxed mb-6" data-testid="text-celebrate-message">
                {FINAL_SUCCESS_MESSAGE}
              </p>
              <button
                onClick={() => {
                  setStage("intro");
                  setQuizIndex(0);
                  setSelected(null);
                  setShowQuizFeedback(false);
                }}
                className="text-sm text-rose-400 hover:text-rose-500 flex items-center gap-1 mx-auto"
                data-testid="button-replay"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Baca lagi dari awal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-rose-400/70 z-10" data-testid="text-footer-note">
        {SLUG_NOTE_FOOTER}
      </p>
    </div>
  );
}

function FloatingHearts() {
  const hearts = Array.from({ length: 12 });
  return (
    <div className="absolute inset-0 pointer-events-none">
      {hearts.map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-300/40 dark:text-rose-700/30"
          style={{ left: `${(i * 8.3) % 100}%`, fontSize: `${12 + (i % 4) * 6}px` }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 12 + (i % 5) * 3,
            repeat: Infinity,
            delay: i * 1.3,
            ease: "linear",
          }}
        >
          <Heart className="fill-current" />
        </motion.div>
      ))}
    </div>
  );
}
