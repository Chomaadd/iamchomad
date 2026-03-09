import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useResumeItems, useCreateResumeItem, useUpdateResumeItem, useDeleteResumeItem } from "@/hooks/use-resume";
import { Button, Input, Textarea, Label, Modal } from "@/components/ui/core";
import { Plus, Edit2, Trash2, Briefcase, GraduationCap, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ResumeItem } from "@shared/schema";

const typeConfig = {
  experience: { label: "Experience", icon: Briefcase, color: "text-blue-600 bg-blue-500/10" },
  education: { label: "Education", icon: GraduationCap, color: "text-emerald-600 bg-emerald-500/10" },
  skill: { label: "Skill", icon: Lightbulb, color: "text-purple-600 bg-purple-500/10" },
};

export default function ManageResume() {
  const { data: items } = useResumeItems();
  const { mutateAsync: createItem } = useCreateResumeItem();
  const { mutateAsync: updateItem } = useUpdateResumeItem();
  const { mutateAsync: deleteItem } = useDeleteResumeItem();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"experience" | "education" | "skill">("experience");

  const [form, setForm] = useState({
    type: "experience" as "experience" | "education" | "skill",
    title: "",
    subtitle: "",
    description: "",
    startDate: "",
    endDate: "",
    order: 0,
    tags: "" as string,
  });

  const openCreate = (type: "experience" | "education" | "skill") => {
    setEditingId(null);
    setForm({ type, title: "", subtitle: "", description: "", startDate: "", endDate: "", order: 0, tags: "" });
    setModalOpen(true);
  };

  const openEdit = (item: ResumeItem) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      title: item.title,
      subtitle: item.subtitle || "",
      description: item.description || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      order: item.order || 0,
      tags: (item.tags || []).join(", "),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: form.type,
      title: form.title,
      subtitle: form.subtitle || null,
      description: form.description || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      order: Number(form.order) || 0,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };
    try {
      if (editingId) {
        await updateItem({ id: editingId, data: payload });
        toast({ title: "Resume item updated." });
      } else {
        await createItem(payload);
        toast({ title: "Resume item added." });
      }
      setModalOpen(false);
    } catch (error) {
      toast({ title: "Error saving item", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this resume item?")) {
      try {
        await deleteItem(id);
        toast({ title: "Item deleted." });
      } catch (error) {
        toast({ title: "Error deleting item", variant: "destructive" });
      }
    }
  };

  const filteredItems = items?.filter(i => i.type === activeTab) || [];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold" data-testid="text-resume-admin-title">Resume / CV</h1>
          <p className="text-sm text-muted-foreground mt-1">{items?.length || 0} items total</p>
        </div>
        <Button onClick={() => openCreate(activeTab)} className="gap-2" data-testid="button-add-resume-item">
          <Plus size={16} /> Add {typeConfig[activeTab].label}
        </Button>
      </div>

      <div className="flex gap-1 mb-6 border border-border rounded-lg p-1 bg-muted/30 w-fit">
        {(["experience", "education", "skill"] as const).map((type) => {
          const config = typeConfig[type];
          const Icon = config.icon;
          const count = items?.filter(i => i.type === type).length || 0;
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === type
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid={`tab-${type}`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{config.label}</span>
              <span className="text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <div
              key={item.id}
              className="group flex items-start gap-4 border border-border rounded-lg p-4 bg-card hover:border-primary/40 transition-all"
              data-testid={`card-resume-item-${item.id}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">#{item.order}</span>
                </div>
                {item.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>}
                {(item.startDate || item.endDate) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {[item.startDate, item.endDate].filter(Boolean).join(" — ")}
                  </p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors" data-testid={`button-edit-resume-${item.id}`}><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors" data-testid={`button-delete-resume-${item.id}`}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-lg text-muted-foreground text-sm italic">
            No {typeConfig[activeTab].label.toLowerCase()} items yet.
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? `Edit ${typeConfig[form.type].label}` : `Add ${typeConfig[form.type].label}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type</Label>
            <select
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value as any})}
              className="flex w-full border border-input bg-background px-4 py-2.5 text-sm rounded-md focus:outline-none focus:border-primary transition-all"
              data-testid="select-resume-type"
            >
              <option value="experience">Experience</option>
              <option value="education">Education</option>
              <option value="skill">Skill</option>
            </select>
          </div>
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder={form.type === 'experience' ? 'e.g. Software Developer' : form.type === 'education' ? 'e.g. Computer Science' : 'e.g. Frontend Development'} data-testid="input-resume-title" />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} placeholder={form.type === 'experience' ? 'e.g. Company Name' : form.type === 'education' ? 'e.g. University Name' : 'e.g. Category'} data-testid="input-resume-subtitle" />
          </div>
          {form.type !== 'skill' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} placeholder="e.g. Jan 2020" data-testid="input-resume-start" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} placeholder="e.g. Present" data-testid="input-resume-end" />
              </div>
            </div>
          )}
          <div>
            <Label>Description</Label>
            <Textarea className="min-h-[80px]" value={form.description} onChange={e => setForm({...form, description: e.target.value})} data-testid="input-resume-description" />
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="e.g. React, TypeScript, Node.js" data-testid="input-resume-tags" />
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})} data-testid="input-resume-order" />
          </div>
          <Button type="submit" className="w-full" data-testid="button-save-resume">
            Save {typeConfig[form.type].label}
          </Button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
