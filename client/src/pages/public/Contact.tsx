import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input, Textarea, Button, Label } from "@/components/ui/core";
import { useCreateContactMessage } from "@/hooks/use-contact";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, Mail, MapPin, Send, MessageCircle, QrCode, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SeoHead } from "@/components/seometa/SeoHead";

export default function Contact() {
  const { mutateAsync: sendMessage, isPending } = useCreateContactMessage();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(form);
      toast({ title: t("contact.toast.success.title"), description: t("contact.toast.success.desc") });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({ title: t("contact.toast.error.title"), description: t("contact.toast.error.desc"), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Contact"
        description="Get in touch with Choiril Ahmad — send a message for collaborations, projects, or just to say hello."
        url="/contact"
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* LEFT COLUMN */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5 uppercase tracking-wider">
              <MessageCircle size={12} /> {t("contact.badge")}
            </div>

            {/* Heading */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight" data-testid="text-contact-heading">
              {t("contact.heading")}
              <span className="gradient-text">{t("contact.heading.highlight")}</span>
            </h1>
            <p className="text-base text-muted-foreground mb-10 max-w-sm leading-relaxed">
              {t("contact.description")}
            </p>

            {/* Info cards */}
            <div className="space-y-3">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="group flex items-center gap-4 p-4 bg-card border border-border/60 rounded-2xl soft-shadow hover:border-primary/30 hover:shadow-md transition-all"
                data-testid="card-contact-email"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{t("contact.email")}</p>
                  <a href="mailto:iamchoirilfk@outlook.co.id" className="font-semibold text-sm hover:text-primary transition-colors truncate block">
                    iamchoirilfk@outlook.co.id
                  </a>
                </div>
                <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="group flex items-center gap-4 p-4 bg-card border border-border/60 rounded-2xl soft-shadow hover:border-primary/30 hover:shadow-md transition-all"
                data-testid="card-contact-location"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{t("contact.location")}</p>
                  <p className="font-semibold text-sm">{t("contact.locationValue")}</p>
                </div>
              </motion.div>

              {/* QR */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.29 }}
                className="flex items-center gap-5 p-4 bg-card border border-border/60 rounded-2xl soft-shadow hover:border-primary/30 hover:shadow-md transition-all"
                data-testid="card-contact-qr"
              >
                <div className="p-2 bg-white dark:bg-white rounded-xl shrink-0 shadow-sm">
                  <QRCodeSVG value="https://iamchomad.my.id/links" size={72} bgColor="#ffffff" fgColor="#18181b" level="M" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <QrCode size={12} className="text-primary" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("contact.qr.label")}</p>
                  </div>
                  <p className="font-semibold text-sm">iamchomad.my.id/links</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("contact.qr.desc")}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN – Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="relative bg-card border border-border/60 rounded-3xl p-7 md:p-9 soft-shadow-lg overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

              <div className="relative">
                <h2 className="font-serif text-xl font-bold mb-1">{t("contact.form.title")}</h2>
                <p className="text-xs text-muted-foreground mb-7">Semua pesan dibaca dan dibalas secara personal.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("contact.form.name")}</Label>
                      <Input
                        id="name"
                        required
                        placeholder={t("contact.form.name.placeholder")}
                        className="rounded-xl h-11 bg-background/50"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        data-testid="input-name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("contact.form.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder={t("contact.form.email.placeholder")}
                        className="rounded-xl h-11 bg-background/50"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("contact.form.subject")}</Label>
                    <Input
                      id="subject"
                      required
                      placeholder={t("contact.form.subject.placeholder")}
                      className="rounded-xl h-11 bg-background/50"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      data-testid="input-subject"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("contact.form.message")}</Label>
                    <Textarea
                      id="message"
                      required
                      placeholder={t("contact.form.message.placeholder")}
                      className="rounded-xl min-h-[130px] bg-background/50 resize-none"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      data-testid="input-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl h-12 font-semibold shadow-lg shadow-primary/20 gap-2"
                    disabled={isPending}
                    data-testid="button-submit-contact"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send size={16} /> {t("contact.form.submit")}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
