import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useEffect } from "react";
import {
  Bold, Italic, UnderlineIcon, List, ListOrdered,
  Heading2, Heading3, Quote, AlignLeft, AlignCenter,
  AlignRight, Highlighter, Undo, Redo, Minus,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis di sini...",
  minHeight = 300,
  className = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[inherit] prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-strong:font-bold prose-em:italic focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

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
      </div>

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
