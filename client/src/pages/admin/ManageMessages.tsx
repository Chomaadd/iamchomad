import { AdminLayout } from "@/components/layout/AdminLayout";
import { useContactMessages, useMarkMessageRead, useDeleteMessage } from "@/hooks/use-contact";
import { Button } from "@/components/ui/core";
import { Check, Trash2, MailOpen, Mail as MailIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManageMessages() {
  const { data: messages } = useContactMessages();
  const { mutateAsync: markRead } = useMarkMessageRead();
  const { mutateAsync: deleteMsg } = useDeleteMessage();
  const { toast } = useToast();

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id);
      toast({ title: "Marked as read." });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this message?")) {
      try {
        await deleteMsg(id);
        toast({ title: "Message deleted." });
      } catch {
        toast({ title: "Error", variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold">Inquiries</h1>
      </div>

      <div className="space-y-4">
        {messages?.map(msg => (
          <div key={msg.id} className={`p-6 border-2 transition-colors ${msg.read ? 'border-border bg-card' : 'border-primary bg-primary/5'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                {msg.read ? <MailOpen size={20} className="text-muted-foreground" /> : <MailIcon size={20} className="text-primary" />}
                <div>
                  <h3 className="font-bold text-lg">{msg.subject}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{msg.name} ({msg.email})</p>
                </div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {new Date(msg.createdAt || Date.now()).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-background border-2 border-border p-4 mb-4 font-serif text-lg leading-relaxed">
              {msg.message}
            </div>
            
            <div className="flex justify-end space-x-4">
              {!msg.read && (
                <Button variant="outline" onClick={() => handleMarkRead(msg.id)} className="gap-2 text-xs h-8 px-3 py-0">
                  <Check size={14} /> Mark Read
                </Button>
              )}
              <Button variant="ghost" onClick={() => handleDelete(msg.id)} className="gap-2 text-xs h-8 px-3 py-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        ))}

        {messages?.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-border text-muted-foreground font-serif italic">
            Inbox is empty.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
