import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, UnderlineIcon, List, ListOrdered,
  Heading2, Heading3, Quote, AlignLeft, AlignCenter,
  AlignRight, Highlighter, Undo, Redo, Minus,
  Link2, ImageIcon, Youtube as YoutubeIcon, Upload, X, Check, Link2Off, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

function ToolbarButton({
  onClick, active, title, children, disabled,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded text-sm transition-colors disabled:opacity-40 ${
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

type PopupType = "link" | "image-url" | "youtube" | null;

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis di sini...",
  minHeight = 300,
  className = "",
}: RichTextEditorProps) {
  const { toast } = useToast();
  const [popup, setPopup] = useState<{ type: PopupType; url: string }>({ type: null, url: "" });
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popupInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-2 cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full mx-auto my-4" },
        allowBase64: false,
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: { class: "rounded-lg overflow-hidden my-4 mx-auto aspect-video w-full" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[inherit] prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-strong:font-bold prose-em:italic prose-a:text-primary focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    if (popup.type && popupInputRef.current) {
      setTimeout(() => popupInputRef.current?.focus(), 50);
    }
  }, [popup.type]);

  const openPopup = (type: PopupType) => {
    if (type === "link") {
      const existing = editor?.getAttributes("link").href || "";
      setPopup({ type, url: existing });
    } else {
      setPopup({ type, url: "" });
    }
  };

  const closePopup = () => setPopup({ type: null, url: "" });

  const confirmPopup = () => {
    if (!editor || !popup.url.trim()) { closePopup(); return; }
    const url = popup.url.trim();

    if (popup.type === "link") {
      editor.chain().focus().setLink({ href: url.startsWith("http") ? url : `https://${url}` }).run();
    } else if (popup.type === "image-url") {
      editor.chain().focus().setImage({ src: url }).run();
    } else if (popup.type === "youtube") {
      editor.commands.setYoutubeVideo({ src: url });
    }
    closePopup();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
        toast({ title: "Foto berhasil disisipkan!" });
      } else {
        toast({ title: "Gagal mengupload foto", variant: "destructive" });
      }
    } catch {
      toast({ title: "Gagal mengupload foto", variant: "destructive" });
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) {
    return (
      <div className={`border border-border rounded-lg overflow-hidden ${className}`}>
        <div className="flex items-center gap-0.5 p-2 border-b border-border bg-muted/30 flex-wrap">
          <div className="h-7 w-64 rounded bg-muted animate-pulse" />
        </div>
        <div className="px-4 py-3" style={{ minHeight }}>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`h-4 rounded bg-muted animate-pulse ${i === 3 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const groups = [
    {
      items: [
        { icon: <Undo size={15} />, title: "Undo", action: () => editor.chain().focus().undo().run(), active: false },
        { icon: <Redo size={15} />, title: "Redo", action: () => editor.chain().focus().redo().run(), active: false },
      ],
    },
    {
      items: [
        { icon: <Bold size={15} />, title: "Bold (Ctrl+B)", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
        { icon: <Italic size={15} />, title: "Italic (Ctrl+I)", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
        { icon: <UnderlineIcon size={15} />, title: "Underline (Ctrl+U)", action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline") },
        { icon: <Highlighter size={15} />, title: "Highlight", action: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive("highlight") },
      ],
    },
    {
      items: [
        { icon: <Heading2 size={15} />, title: "Heading 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
        { icon: <Heading3 size={15} />, title: "Heading 3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
        { icon: <Quote size={15} />, title: "Kutipan", action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
      ],
    },
    {
      items: [
        { icon: <List size={15} />, title: "Bullet List", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
        { icon: <ListOrdered size={15} />, title: "Numbered List", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
        { icon: <Minus size={15} />, title: "Garis Pemisah", action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
      ],
    },
    {
      items: [
        { icon: <AlignLeft size={15} />, title: "Rata Kiri", action: () => editor.chain().focus().setTextAlign("left").run(), active: editor.isActive({ textAlign: "left" }) },
        { icon: <AlignCenter size={15} />, title: "Tengah", action: () => editor.chain().focus().setTextAlign("center").run(), active: editor.isActive({ textAlign: "center" }) },
        { icon: <AlignRight size={15} />, title: "Rata Kanan", action: () => editor.chain().focus().setTextAlign("right").run(), active: editor.isActive({ textAlign: "right" }) },
      ],
    },
  ];

  const popupPlaceholders: Record<string, string> = {
    "link": "https://contoh.com",
    "image-url": "https://contoh.com/gambar.jpg",
    "youtube": "https://youtube.com/watch?v=...",
  };
  const popupLabels: Record<string, string> = {
    "link": "Tempel link",
    "image-url": "URL foto",
    "youtube": "URL YouTube",
  };

  return (
    <div className={`border border-border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-ring ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 border-b border-border bg-muted/30 flex-wrap">
        {groups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <div className="w-px h-5 bg-border mx-1" />}
            {group.items.map((item, i) => (
              <ToolbarButton key={i} onClick={item.action} active={item.active} title={item.title}>
                {item.icon}
              </ToolbarButton>
            ))}
          </div>
        ))}

        {/* Media group */}
        <div className="flex items-center gap-0.5">
          <div className="w-px h-5 bg-border mx-1" />
          <ToolbarButton
            onClick={() => openPopup("link")}
            active={editor.isActive("link") || popup.type === "link"}
            title="Tambah Link"
          >
            <Link2 size={15} />
          </ToolbarButton>
          {editor.isActive("link") && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              active={false}
              title="Hapus Link"
            >
              <Link2Off size={15} />
            </ToolbarButton>
          )}
          <ToolbarButton
            onClick={() => openPopup("image-url")}
            active={popup.type === "image-url"}
            title="Sisipkan Foto via URL"
          >
            <ImageIcon size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            active={false}
            title="Upload Foto dari Perangkat"
            disabled={imageUploading}
          >
            {imageUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => openPopup("youtube")}
            active={popup.type === "youtube"}
            title="Embed Video YouTube"
          >
            <YoutubeIcon size={15} />
          </ToolbarButton>
        </div>
      </div>

      {/* Popup input row */}
      {popup.type && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20 text-sm">
          <span className="text-muted-foreground text-xs font-medium shrink-0">{popupLabels[popup.type]}:</span>
          <input
            ref={popupInputRef}
            type="url"
            value={popup.url}
            onChange={e => setPopup(p => ({ ...p, url: e.target.value }))}
            onKeyDown={e => { if (e.key === "Enter") confirmPopup(); if (e.key === "Escape") closePopup(); }}
            placeholder={popupPlaceholders[popup.type]}
            className="flex-1 bg-transparent border-b border-border outline-none text-sm py-0.5 placeholder:text-muted-foreground/50"
          />
          <button
            type="button"
            onClick={confirmPopup}
            className="p-1 rounded hover:bg-primary/10 text-primary transition-colors"
            title="Konfirmasi"
          >
            <Check size={15} />
          </button>
          <button
            type="button"
            onClick={closePopup}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
            title="Batal"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Editor area */}
      <div
        className="px-4 py-3 cursor-text"
        style={{ minHeight }}
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export function renderRichContent(content: string): string {
  if (!content) return "";
  if (content.trimStart().startsWith("<")) return content;
  return content
    .split("\n\n")
    .map(para => {
      if (!para.trim()) return "";
      if (para.startsWith("# ")) return `<h2>${para.slice(2)}</h2>`;
      if (para.startsWith("## ")) return `<h3>${para.slice(3)}</h3>`;
      if (para.startsWith("- ")) {
        const items = para.split("\n").filter(l => l.startsWith("- ")).map(l => `<li>${l.slice(2)}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${para.replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("");
}
