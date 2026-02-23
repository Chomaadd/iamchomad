import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input, Textarea, Button, Label } from "@/components/ui/core";
import { useCreateContactMessage } from "@/hooks/use-contact";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Contact() {
  const { mutateAsync: sendMessage, isPending } = useCreateContactMessage();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(form);
      toast({ title: "Message Sent", description: "Your transmission has been received." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="font-serif text-6xl md:text-8xl font-bold mb-8 leading-none">Inquiries.</h1>
            <p className="text-xl text-muted-foreground mb-12">
              Available for freelance opportunities, consultations, and collaborative endeavors worldwide.
            </p>
            
            <div className="space-y-8 border-l-2 border-primary pl-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Direct</p>
                <a href="mailto:hello@elegance.com" className="font-serif text-2xl hover:underline">hello@elegance.com</a>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Location</p>
                <p className="font-serif text-2xl">New York, NY</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="border-2 border-primary p-8 md:p-12 editorial-shadow bg-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    required 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    required 
                    value={form.subject} 
                    onChange={e => setForm({...form, subject: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    required 
                    value={form.message} 
                    onChange={e => setForm({...form, message: e.target.value})} 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Transmit"}
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
