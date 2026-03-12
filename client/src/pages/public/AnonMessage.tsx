import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertCircle, Share2, Copy, Check } from "lucide-react";
import { SiWhatsapp, SiInstagram } from "react-icons/si";
import { SeoHead } from "@/components/seometa/SeoHead";

const MAX_CHARS = 1000;
const PAGE_URL = "https://iamchomad.my.id/pesan";
const SHARE_TEXT = `Kirim pesan anonim ke aku — identitasmu dijamin rahasia! 🤫\n${PAGE_URL}`;

function shareToWhatsApp() {
  window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`, "_blank");
}

async function shareToInstagram(onCopied: () => void) {
  if (navigator.share) {
    try {
      await navigator.share({ title: "Pesan Anonim", text: SHARE_TEXT, url: PAGE_URL });
      return;
    } catch {}
  }
  await navigator.clipboard.writeText(PAGE_URL);
  onCopied();
}

export default function AnonMessage() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const remaining = MAX_CHARS - message.length;
  const pct = (message.length / MAX_CHARS) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/anon-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setMessage("");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <SeoHead
        title="Pesan Anonim"
        description="Punya sesuatu yang ingin kamu sampaikan? Kirim pesan anonim untuk Choiril Ahmad — tanpa nama, tanpa jejak, identitasmu 100% dijaga."
        url="/pesan"
        image="https://iamchomad.my.id/logo.png"
        cardType="summary"
      />

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-[#f8f5ff] via-background to-[#eef2ff] dark:from-[#0f0a1e] dark:via-background dark:to-[#0a0f1e]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeInOut" }}
              className="text-5xl mb-4 select-none"
            >
              🤫
            </motion.div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
              Pesan <span className="text-primary">Anonim</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Tulis apa saja untuk{" "}
              <span className="font-semibold text-foreground">Choiril Ahmad</span> —<br />
              identitasmu <span className="font-semibold text-foreground">100% rahasia</span>.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-card border border-border rounded-3xl p-8 text-center shadow-lg"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                  className="text-5xl mb-4"
                >
                  🎉
                </motion.div>
                <h2 className="text-xl font-bold font-serif mb-1">Pesan Terkirim!</h2>
                <p className="text-sm text-muted-foreground mb-7">
                  Terima kasih! Pesanmu sudah diterima dengan aman.
                </p>

                <div className="space-y-3 mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ajak teman kirim pesan anonim juga?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={shareToWhatsApp}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all"
                      data-testid="button-share-wa"
                    >
                      <SiWhatsapp size={16} />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => shareToInstagram(handleCopied)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all"
                      data-testid="button-share-ig"
                    >
                      {copied ? <Check size={16} /> : <SiInstagram size={16} />}
                      {copied ? "Link Disalin!" : "Instagram"}
                    </button>
                  </div>
                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-muted-foreground"
                    >
                      Link disalin! Paste di bio atau story Instagram kamu 📋
                    </motion.p>
                  )}
                </div>

                <button
                  onClick={() => setStatus("idle")}
                  className="text-sm font-medium text-primary hover:underline underline-offset-4 transition-all"
                  data-testid="button-send-another"
                >
                  Kirim pesan lain →
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onSubmit={handleSubmit}
                className="bg-card border border-border rounded-3xl p-6 shadow-lg space-y-4"
              >
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tulis pesanmu di sini... 💬"
                    maxLength={MAX_CHARS}
                    rows={6}
                    required
                    disabled={status === "sending"}
                    className="w-full resize-none rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all disabled:opacity-50"
                    data-testid="textarea-anon-message"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <div className="relative w-5 h-5">
                      <svg viewBox="0 0 20 20" className="w-full h-full -rotate-90">
                        <circle cx="10" cy="10" r="8" fill="none" strokeWidth="2" className="stroke-border" />
                        <circle
                          cx="10" cy="10" r="8" fill="none" strokeWidth="2"
                          strokeDasharray={`${2 * Math.PI * 8}`}
                          strokeDashoffset={`${2 * Math.PI * 8 * (1 - pct / 100)}`}
                          className={`transition-all ${pct > 90 ? "stroke-destructive" : "stroke-primary"}`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    {remaining < 100 && (
                      <span className={`text-[10px] font-mono ${remaining < 50 ? "text-destructive" : "text-muted-foreground"}`}>
                        {remaining}
                      </span>
                    )}
                  </div>
                </div>

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-xl"
                  >
                    <AlertCircle size={14} />
                    <span>Gagal mengirim. Coba lagi.</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={!message.trim() || status === "sending"}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                  data-testid="button-submit-anon-message"
                >
                  {status === "sending" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Kirim Anonim
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  🔒 Identitasmu tidak akan diketahui siapapun
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={shareToWhatsApp}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#25D366] transition-colors"
              data-testid="button-share-wa-bottom"
            >
              <SiWhatsapp size={13} />
              Bagikan ke WA
            </button>
            <span className="text-border">·</span>
            <button
              onClick={() => shareToInstagram(handleCopied)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#e6683c] transition-colors"
              data-testid="button-share-ig-bottom"
            >
              <SiInstagram size={13} />
              {copied ? "Link disalin!" : "Bagikan ke IG"}
            </button>
            <span className="text-border">·</span>
            <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              iamchomad.my.id
            </a>
          </div>
        </motion.div>
      </div>
    </>
  );
}
