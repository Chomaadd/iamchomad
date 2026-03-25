import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useResumeItems } from "@/hooks/use-resume";
import { useLanguage } from "@/hooks/use-language";
import { Download, Briefcase, GraduationCap, Lightbulb, Calendar, MapPin, FileText, Mail, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from "qrcode.react";
import type { ResumeItem } from "@shared/schema";
import { SeoHead } from "@/components/seometa/SeoHead";

export default function Resume() {
  const { data: items, isLoading } = useResumeItems();
  const { t } = useLanguage();

  const experience = items?.filter(i => i.type === "experience") || [];
  const education = items?.filter(i => i.type === "education") || [];
  const skills = items?.filter(i => i.type === "skill") || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Resume"
        description="Professional resume of Choiril Ahmad — experience, education, and skills as an Entrepreneur & Software Developer."
        url="/resume"
      />

      {/* Print CSS injected into head */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .screen-only { display: none !important; }
          .print-only { display: block !important; }
          .print-only-flex { display: flex !important; }
          .print-only-grid { display: grid !important; }
        }
        @media screen {
          .print-only,
          .print-only-flex,
          .print-only-grid { display: none !important; }
        }
      `}</style>

      {/* ── SCREEN-ONLY: Navbar & screen layout ── */}
      <div className="screen-only">
        <Navbar />
      </div>

      <main className="screen-only max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
                <FileText size={14} /> {t("resume.badge")}
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-resume-title">
                Choiril Ahmad
              </h1>
              <p className="text-base text-muted-foreground mt-2 max-w-xl">
                {t("resume.subtitle")}
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {t("resume.location")}</span>
                <span>iamchoirilfk@gmail.com</span>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              data-testid="button-download-resume"
            >
              <Download size={16} />
              <span className="hidden sm:inline">{t("resume.savePdf")}</span>
            </button>
          </div>
        </motion.header>

        {isLoading ? (
          <div className="space-y-12">
            {[{ color: "bg-blue-500/10" }, { color: "bg-emerald-500/10" }].map((section, s) => (
              <div key={s}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl ${section.color} shrink-0`} />
                  <Skeleton className="h-7 w-40" />
                </div>
                <div className="space-y-0">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center pt-2">
                        <Skeleton className="w-3 h-3 rounded-full shrink-0" />
                        {i < 2 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-8 flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-3 w-28" />
                        <div className="space-y-1.5 mt-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-4/5" />
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <Skeleton className="h-4 w-14 rounded-full" />
                          <Skeleton className="h-4 w-16 rounded-full" />
                          <Skeleton className="h-4 w-12 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 shrink-0" />
                <Skeleton className="h-7 w-32" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border/60 rounded-xl p-4 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex gap-1.5 mt-2">
                      <Skeleton className="h-4 w-14 rounded-full" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                      <Skeleton className="h-4 w-12 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {experience.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Briefcase size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold">{t("resume.experience")}</h2>
                </div>
                <div className="space-y-0">
                  {experience.map((item, i) => (
                    <ResumeEntry key={item.id} item={item} isLast={i === experience.length - 1} color="blue" />
                  ))}
                </div>
              </motion.section>
            )}

            {education.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <GraduationCap size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold">{t("resume.education")}</h2>
                </div>
                <div className="space-y-0">
                  {education.map((item, i) => (
                    <ResumeEntry key={item.id} item={item} isLast={i === education.length - 1} color="emerald" />
                  ))}
                </div>
              </motion.section>
            )}

            {skills.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Lightbulb size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold">{t("resume.skills")}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {skills.map((item) => (
                    <div key={item.id} className="bg-card border border-border/60 rounded-xl p-4 hover-lift soft-shadow transition-all" data-testid={`card-skill-${item.id}`}>
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      {item.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>}
                      {item.description && <p className="text-xs text-muted-foreground mt-2">{item.description}</p>}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-semibold rounded-full">{tag}</span>
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
                <p className="font-serif text-xl font-bold">{t("resume.empty.title")}</p>
                <p className="text-sm text-muted-foreground mt-2">{t("resume.empty.desc")}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="screen-only">
        <Footer />
      </div>

      {/* ══════════════════════════════════════════
          PRINT-ONLY: Elegant two-column PDF layout
          ══════════════════════════════════════════ */}
      <div
        className="print-only"
        style={{
          width: "210mm",
          minHeight: "297mm",
          margin: "0",
          padding: "0",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          color: "#1a1a2e",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* ── LEFT SIDEBAR ── */}
        <div
          style={{
            width: "68mm",
            minHeight: "297mm",
            backgroundColor: "#1a1a2e",
            color: "#ffffff",
            padding: "12mm 8mm 10mm 8mm",
            display: "flex",
            flexDirection: "column",
            gap: "8mm",
            flexShrink: 0,
          }}
        >
          {/* Initials avatar */}
          <div style={{ textAlign: "center", paddingBottom: "6mm", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
            <div
              style={{
                width: "20mm",
                height: "20mm",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 4mm",
                fontSize: "18pt",
                fontWeight: "bold",
                color: "#ffffff",
                letterSpacing: "1px",
              }}
            >
              CA
            </div>
            <div style={{ fontSize: "14pt", fontWeight: "bold", letterSpacing: "0.5px", lineHeight: 1.2 }}>Choiril Ahmad</div>
            <div style={{ fontSize: "7.5pt", color: "rgba(255,255,255,0.6)", marginTop: "2mm", letterSpacing: "0.5px", lineHeight: 1.4 }}>
              Frontend Developer &<br />Visual Designer
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{
              fontSize: "6pt",
              fontFamily: "'Arial', sans-serif",
              fontWeight: "bold",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "4mm",
            }}>
              Contact
            </div>
            {[
              { icon: "📍", text: "Indonesia" },
              { icon: "✉", text: "iamchoirilfk@gmail.com" },
              { icon: "🌐", text: "iamchomad.my.id" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "3mm", marginBottom: "3mm" }}>
                <span style={{ fontSize: "7pt", marginTop: "0.5mm", flexShrink: 0 }}>{c.icon}</span>
                <span style={{ fontSize: "7.5pt", color: "rgba(255,255,255,0.75)", lineHeight: 1.4, wordBreak: "break-all" }}>{c.text}</span>
              </div>
            ))}
          </div>

          {/* Skills sidebar */}
          {skills.length > 0 && (
            <div>
              <div style={{
                fontSize: "6pt",
                fontFamily: "'Arial', sans-serif",
                fontWeight: "bold",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "4mm",
              }}>
                Skills
              </div>
              {skills.map((item) => (
                <div key={item.id} style={{ marginBottom: "4mm" }}>
                  <div style={{ fontSize: "8pt", fontWeight: "bold", color: "#ffffff", marginBottom: "1.5mm" }}>{item.title}</div>
                  {item.subtitle && (
                    <div style={{ fontSize: "7pt", color: "rgba(255,255,255,0.55)", marginBottom: "1.5mm", fontFamily: "'Arial', sans-serif" }}>{item.subtitle}</div>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5mm" }}>
                      {item.tags.map((tag, ti) => (
                        <span key={ti} style={{
                          fontSize: "6pt",
                          fontFamily: "'Arial', sans-serif",
                          backgroundColor: "rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.75)",
                          padding: "1mm 2.5mm",
                          borderRadius: "20px",
                          border: "1px solid rgba(255,255,255,0.15)",
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* QR Code at bottom */}
          <div style={{ marginTop: "auto", textAlign: "center", paddingTop: "6mm", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{
              display: "inline-block",
              padding: "2mm",
              backgroundColor: "#ffffff",
              borderRadius: "4px",
              marginBottom: "2mm",
            }}>
              <QRCodeSVG
                value="https://iamchomad.my.id/links"
                size={52}
                bgColor="#ffffff"
                fgColor="#1a1a2e"
                level="M"
              />
            </div>
            <div style={{ fontSize: "6pt", color: "rgba(255,255,255,0.4)", fontFamily: "'Arial', sans-serif", letterSpacing: "0.3px" }}>
              iamchomad.my.id
            </div>
          </div>
        </div>

        {/* ── RIGHT MAIN CONTENT ── */}
        <div style={{ flex: 1, padding: "12mm 10mm 10mm 10mm", display: "flex", flexDirection: "column", gap: "8mm" }}>

          {/* Header strip */}
          <div style={{ borderBottom: "2px solid #1a1a2e", paddingBottom: "6mm" }}>
            <div style={{
              fontSize: "6pt",
              fontFamily: "'Arial', sans-serif",
              fontWeight: "bold",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#666",
              marginBottom: "2mm",
            }}>
              Curriculum Vitæ
            </div>
            <div style={{ fontSize: "22pt", fontWeight: "bold", letterSpacing: "-0.5px", lineHeight: 1.1, color: "#1a1a2e" }}>
              Choiril Ahmad
            </div>
            <div style={{ fontSize: "9.5pt", color: "#555", marginTop: "1.5mm", fontStyle: "italic", fontFamily: "'Arial', sans-serif" }}>
              Frontend Developer & Visual Designer · Building digital products, brands, and experiences.
            </div>
          </div>

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <PrintSectionHeading title="Experience" />
              <div>
                {experience.map((item, i) => (
                  <PrintEntry key={item.id} item={item} isLast={i === experience.length - 1} />
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <PrintSectionHeading title="Education" />
              <div>
                {education.map((item, i) => (
                  <PrintEntry key={item.id} item={item} isLast={i === education.length - 1} />
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div style={{ marginTop: "auto", paddingTop: "4mm", borderTop: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "6.5pt", color: "#aaa", fontFamily: "'Arial', sans-serif", textAlign: "center", letterSpacing: "0.3px" }}>
              References available upon request · iamchoirilfk@gmail.com · iamchomad.my.id
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Screen layout sub-components ── */
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
        <div className={`w-3 h-3 rounded-full ${dotColors[color] || "bg-primary"} shrink-0 ring-4 ring-background`} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>
      <div className="pb-8 min-w-0">
        <h3 className="font-semibold">{item.title}</h3>
        {item.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{item.subtitle}</p>}
        {dateRange && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
            <Calendar size={12} />{dateRange}
          </p>
        )}
        {item.description && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.description}</p>}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-semibold rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Print-only sub-components ── */
function PrintSectionHeading({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: "4mm", display: "flex", alignItems: "center", gap: "3mm" }}>
      <div style={{
        fontSize: "7pt",
        fontFamily: "'Arial', sans-serif",
        fontWeight: "bold",
        letterSpacing: "2.5px",
        textTransform: "uppercase",
        color: "#1a1a2e",
        whiteSpace: "nowrap",
      }}>
        {title}
      </div>
      <div style={{ flex: 1, height: "1.5px", backgroundColor: "#1a1a2e", opacity: 0.15 }} />
    </div>
  );
}

function PrintEntry({ item, isLast }: { item: ResumeItem; isLast: boolean }) {
  const dateRange = [item.startDate, item.endDate].filter(Boolean).join(" – ") || "";

  return (
    <div style={{
      marginBottom: isLast ? "0" : "5mm",
      paddingBottom: isLast ? "0" : "5mm",
      borderBottom: isLast ? "none" : "1px solid #f0f0f0",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4mm" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "9.5pt", fontWeight: "bold", color: "#1a1a2e", lineHeight: 1.3 }}>{item.title}</div>
          {item.subtitle && (
            <div style={{ fontSize: "8pt", color: "#555", fontStyle: "italic", fontFamily: "'Arial', sans-serif", marginTop: "0.5mm" }}>{item.subtitle}</div>
          )}
        </div>
        {dateRange && (
          <div style={{
            fontSize: "7pt",
            fontFamily: "'Arial', sans-serif",
            color: "#888",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginTop: "1mm",
          }}>
            {dateRange}
          </div>
        )}
      </div>

      {item.description && (
        <div style={{ fontSize: "7.5pt", color: "#555", marginTop: "2mm", lineHeight: 1.6, fontFamily: "'Arial', sans-serif" }}>
          {item.description}
        </div>
      )}

      {item.tags && item.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5mm", marginTop: "2.5mm" }}>
          {item.tags.map((tag, i) => (
            <span key={i} style={{
              fontSize: "6pt",
              fontFamily: "'Arial', sans-serif",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              padding: "0.8mm 2.5mm",
              borderRadius: "20px",
              border: "1px solid #e5e7eb",
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
