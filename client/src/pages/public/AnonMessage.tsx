import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { SeoHead } from "@/components/seometa/SeoHead";

const MAX_CHARS = 1000;

export default function AnonMessage() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const remaining = MAX_CHARS - message.length;

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

  return (
    <>
      <SeoHead
        title="Kirim Pesan Anonim — Choiril Ahmad"
        description="Kirim pesan anonim untuk Choiril Ahmad. Identitasmu tetap rahasia."
        url="https://iamchomad.my.id/pesan"
      />

      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
              <Lock size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Pesan Anonim</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Tulis apa saja — pendapat, pertanyaan, atau cerita.<br />
              Identitasmu <span className="font-semibold text-foreground">tidak akan diketahui</span>.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm"
              >
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold font-serif mb-2">Pesan Terkirim!</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Terima kasih. Pesanmu sudah sampai dengan aman dan anonim.
                </p>
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tulis pesanmu di sini..."
                    maxLength={MAX_CHARS}
                    rows={6}
                    required
                    disabled={status === "sending"}
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all disabled:opacity-50"
                    data-testid="textarea-anon-message"
                  />
                  <span className={`absolute bottom-3 right-3 text-xs font-mono ${remaining < 50 ? "text-destructive" : "text-muted-foreground"}`}>
                    {remaining}
                  </span>
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle size={14} />
                    <span>Gagal mengirim. Coba lagi.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!message.trim() || status === "sending"}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  🔒 Tidak ada data pribadi yang tersimpan
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <a href="/" className="hover:text-foreground transition-colors underline underline-offset-4">
              iamchomad.my.id
            </a>
          </p>
        </motion.div>
      </div>
    </>
  );
}
