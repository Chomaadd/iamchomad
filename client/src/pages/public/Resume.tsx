import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useResumeItems } from "@/hooks/use-resume";
import { Loader2, Download, Briefcase, GraduationCap, Lightbulb, Calendar, MapPin, FileText } from "lucide-react";
import type { ResumeItem } from "@shared/schema";

export default function Resume() {
  const { data: items, isLoading } = useResumeItems();

  const experience = items?.filter(i => i.type === "experience") || [];
  const education = items?.filter(i => i.type === "education") || [];
  const skills = items?.filter(i => i.type === "skill") || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-24 print:py-8 print:px-4">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 print:mb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider print:hidden">
                <FileText size={14} /> Resume
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-resume-title">
                Choiril Ahmad
              </h1>
              <p className="text-base text-muted-foreground mt-2 max-w-xl">
                Entrepreneur & Software Developer crafting digital experiences with precision and purpose.
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> Indonesia</span>
                <span>iamchoirilfk@gmail.com</span>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="shrink-0 print:hidden inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              data-testid="button-download-resume"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Save PDF</span>
            </button>
          </div>
        </motion.header>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-12 print:space-y-8">
            {experience.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-6 print:mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center print:bg-gray-100">
                    <Briefcase size={20} className="text-blue-600 dark:text-blue-400 print:text-gray-700" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold">Experience</h2>
                </div>

                <div className="space-y-0">
                  {experience.map((item, i) => (
                    <ResumeEntry key={item.id} item={item} isLast={i === experience.length - 1} color="blue" />
                  ))}
                </div>
              </motion.section>
            )}

            {education.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-6 print:mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center print:bg-gray-100">
                    <GraduationCap size={20} className="text-emerald-600 dark:text-emerald-400 print:text-gray-700" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold">Education</h2>
                </div>

                <div className="space-y-0">
                  {education.map((item, i) => (
                    <ResumeEntry key={item.id} item={item} isLast={i === education.length - 1} color="emerald" />
                  ))}
                </div>
              </motion.section>
            )}

            {skills.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-6 print:mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center print:bg-gray-100">
                    <Lightbulb size={20} className="text-purple-600 dark:text-purple-400 print:text-gray-700" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold">Skills</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {skills.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card border border-border/60 rounded-xl p-4 hover-lift soft-shadow transition-all print:border-gray-300"
                      data-testid={`card-skill-${item.id}`}
                    >
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      {item.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>}
                      {item.description && <p className="text-xs text-muted-foreground mt-2">{item.description}</p>}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-semibold rounded-full print:border print:border-gray-300 print:text-gray-700 print:bg-gray-50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {!experience.length && !education.length && !skills.length && (
              <div className="text-center py-24 bg-card border border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-primary" />
                </div>
                <p className="font-serif text-xl font-bold">Resume content coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later for updates.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

function ResumeEntry({ item, isLast, color }: { item: ResumeItem; isLast: boolean; color: string }) {
  const dateRange = [item.startDate, item.endDate].filter(Boolean).join(" — ") || "";

  const dotColors: Record<string, string> = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="flex gap-4" data-testid={`card-resume-${item.id}`}>
      <div className="flex flex-col items-center pt-2">
        <div className={`w-3 h-3 rounded-full ${dotColors[color] || "bg-primary"} shrink-0 ring-4 ring-background print:bg-gray-700 print:ring-white`} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1 print:bg-gray-300" />}
      </div>
      <div className={`pb-8 min-w-0`}>
        <h3 className="font-semibold">{item.title}</h3>
        {item.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{item.subtitle}</p>}
        {dateRange && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
            <Calendar size={12} />
            {dateRange}
          </p>
        )}
        {item.description && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.description}</p>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-semibold rounded-full print:border print:border-gray-300 print:text-gray-700">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
