import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input, Textarea, Button, Label } from "@/components/ui/core";
import { useCreateContactMessage } from "@/hooks/use-contact";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, MapPin, Send, MessageCircle } from "lucide-react";

export default function Contact() {
  const { mutateAsync: sendMessage, isPending } = useCreateContactMessage();
  const { toast } = useToast();

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
        title: "Message Sent",
        description: "Your transmission has been received.",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
              <MessageCircle size={14} /> Get in Touch
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-contact-heading">
              Let's work
              <span className="gradient-text"> together.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              Have a project in mind or just want to say hello? I'm currently
              open for new opportunities.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 bg-card border border-border/60 rounded-xl soft-shadow" data-testid="card-contact-email">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Email
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
                    Location
                  </p>
                  <p className="font-semibold">
                    North Sumatra, Pematangsiantar City, ID.
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
              <h2 className="font-serif text-xl font-bold mb-6">Send a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Your name"
                    className="rounded-lg"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="rounded-lg"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                  <Input
                    id="subject"
                    required
                    placeholder="What's this about?"
                    className="rounded-lg"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    data-testid="input-subject"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                  <Textarea
                    id="message"
                    required
                    placeholder="Tell me about your project..."
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
                      <Send size={16} /> Send Message
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
