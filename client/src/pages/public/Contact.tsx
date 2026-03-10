import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input, Textarea, Button, Label } from "@/components/ui/core";
import { useCreateContactMessage } from "@/hooks/use-contact";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, Mail, MapPin, Send, MessageCircle } from "lucide-react";
import { SeoHead } from "@/components/seometa/SeoHead";

export default function Contact() {
  const { mutateAsync: sendMessage, isPending } = useCreateContactMessage();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(form);
      toast({
        title: t("contact.toast.success.title"),
        description: t("contact.toast.success.desc"),
      });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: t("contact.toast.error.title"),
        description: t("contact.toast.error.desc"),
        variant: "destructive",
      });
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
              <MessageCircle size={14} /> {t("contact.badge")}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-contact-heading">
              {t("contact.heading")}
              <span className="gradient-text">{t("contact.heading.highlight")}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              {t("contact.description")}
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 bg-card border border-border/60 rounded-xl soft-shadow" data-testid="card-contact-email">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t("contact.email")}
                  </p>
                  <a
                    href="mailto:iamchoirilfk@outlook.co.id"
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    iamchoirilfk@outlook.co.id
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-card border border-border/60 rounded-xl soft-shadow" data-testid="card-contact-location">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t("contact.location")}
                  </p>
                  <p className="font-semibold">
                    {t("contact.locationValue")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 soft-shadow-lg">
              <h2 className="font-serif text-xl font-bold mb-6">{t("contact.form.title")}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">{t("contact.form.name")}</Label>
                  <Input
                    id="name"
                    required
                    placeholder={t("contact.form.name.placeholder")}
                    className="rounded-lg"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">{t("contact.form.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder={t("contact.form.email.placeholder")}
                    className="rounded-lg"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-sm font-medium">{t("contact.form.subject")}</Label>
                  <Input
                    id="subject"
                    required
                    placeholder={t("contact.form.subject.placeholder")}
                    className="rounded-lg"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    data-testid="input-subject"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm font-medium">{t("contact.form.message")}</Label>
                  <Textarea
                    id="message"
                    required
                    placeholder={t("contact.form.message.placeholder")}
                    className="rounded-lg min-h-[120px]"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    data-testid="input-message"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-xl h-11 font-semibold shadow-lg shadow-primary/25"
                  disabled={isPending}
                  data-testid="button-submit-contact"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Send size={16} /> {t("contact.form.submit")}
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
