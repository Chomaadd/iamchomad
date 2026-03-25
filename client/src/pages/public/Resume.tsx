import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useResumeItems } from "@/hooks/use-resume";
import { useSiteSettings } from "@/hooks/use-settings";
import { useLanguage } from "@/hooks/use-language";
import { Download, Briefcase, GraduationCap, Lightbulb, Calendar, MapPin, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from "qrcode.react";
import type { ResumeItem } from "@shared/schema";
import { SeoHead } from "@/components/seometa/SeoHead";

const ACCENT = "#D4A843";
const SIDEBAR_BG = "#232323";
const SIDEBAR_TEXT = "#ffffff";

export default function Resume() {
  const { data: items, isLoading: itemsLoading } = useResumeItems();
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const { t } = useLanguage();

  const isLoading = itemsLoading || settingsLoading;

  const experience = items?.filter(i => i.type === "experience") || [];
  const education = items?.filter(i => i.type === "education") || [];
  const skills = items?.filter(i => i.type === "skill") || [];

  const fullName = settings?.resumeFullName || "Choiril Ahmad";
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const jobTitle = settings?.resumeTitle || "Frontend Developer & Visual Designer";
  const about = settings?.resumeAbout || "";
  const photoUrl = settings?.resumePhotoUrl || "";
  const birthDate = settings?.resumeBirthDate || "";
  const nationality = settings?.resumeNationality || "";
  const phone = settings?.resumePhone || "";
  const address = settings?.resumeAddress || "Indonesia";
  const email = settings?.resumeEmail || "iamchoirilfk@gmail.com";
  const website = settings?.resumeWebsite || "iamchomad.my.id";

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

      <style>{`
        @media print {
          @page { margin: 0; size: A4; }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .screen-only { display: none !important; }
          .print-only { display: flex !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      {/* ── SCREEN LAYOUT ── */}
      <div className="screen-only">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
                  <FileText size={14} /> {t("resume.badge")}
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-resume-title">
                  {fullName}
                </h1>
                <p className="text-base text-muted-foreground mt-2 max-w-xl">{jobTitle}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {address}</span>
                  <span>{email}</span>
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
              {[{ color: "bg-blue-500/10" }, { color: "bg-emerald-500/10" }].map((s, si) => (
                <div key={si}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl ${s.color} shrink-0`} />
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
                          <Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-36" /><Skeleton className="h-3 w-28" />
                          <div className="space-y-1.5 mt-2"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
                  <div className="space-y-0">{experience.map((item, i) => <ResumeEntry key={item.id} item={item} isLast={i === experience.length - 1} color="blue" />)}</div>
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
                  <div className="space-y-0">{education.map((item, i) => <ResumeEntry key={item.id} item={item} isLast={i === education.length - 1} color="emerald" />)}</div>
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
                            {item.tags.map((tag, i) => <span key={i} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-semibold rounded-full">{tag}</span>)}
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
        <Footer />
      </div>

      {/* ══════════════════════════════════════════
          PRINT-ONLY: Template-style two-column PDF
          ══════════════════════════════════════════ */}
      <div
        className="print-only"
        style={{
          width: "210mm",
          minHeight: "297mm",
          margin: 0,
          padding: 0,
          flexDirection: "row",
          fontFamily: "'Arial', 'Helvetica', sans-serif",
          color: "#232323",
          backgroundColor: "#ffffff",
        }}
      >
        {/* ── LEFT SIDEBAR ── */}
        <div style={{
          width: "72mm",
          minHeight: "297mm",
          backgroundColor: SIDEBAR_BG,
          color: SIDEBAR_TEXT,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          {/* Photo */}
          <div style={{
            width: "100%",
            height: "75mm",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#3a3a3a",
          }}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "36pt", fontWeight: "bold", color: "rgba(255,255,255,0.2)",
                letterSpacing: "2px",
              }}>
                {(firstName[0] || "") + (lastName[0] || "")}
              </div>
            )}
            {/* Accent bar at bottom of photo */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: ACCENT }} />
          </div>

          <div style={{ padding: "7mm 7mm 8mm 7mm", display: "flex", flexDirection: "column", gap: "6mm", flex: 1 }}>

            {/* About Me */}
            {about && (
              <div>
                <div style={{ fontSize: "8.5pt", fontWeight: "bold", letterSpacing: "1.5px", textTransform: "uppercase", color: ACCENT, marginBottom: "3mm" }}>
                  About Me
                </div>
                <div style={{ fontSize: "7.5pt", color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>
                  {about}
                </div>
              </div>
            )}

            {/* Personal Info */}
            {(birthDate || nationality) && (
              <div>
                <div style={{ fontSize: "8.5pt", fontWeight: "bold", letterSpacing: "1.5px", textTransform: "uppercase", color: ACCENT, marginBottom: "3mm" }}>
                  Personal Info
                </div>
                {birthDate && (
                  <div style={{ marginBottom: "2.5mm" }}>
                    <div style={{ fontSize: "6pt", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", marginBottom: "0.5mm" }}>DATE OF BIRTH</div>
                    <div style={{ fontSize: "7.5pt", color: "rgba(255,255,255,0.8)" }}>{birthDate}</div>
                  </div>
                )}
                {nationality && (
                  <div style={{ marginBottom: "2.5mm" }}>
                    <div style={{ fontSize: "6pt", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", marginBottom: "0.5mm" }}>NATIONALITY</div>
                    <div style={{ fontSize: "7.5pt", color: "rgba(255,255,255,0.8)" }}>{nationality}</div>
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <div style={{ fontSize: "8.5pt", fontWeight: "bold", letterSpacing: "1.5px", textTransform: "uppercase", color: ACCENT, marginBottom: "3mm" }}>
                  Skills
                </div>
                {skills.map((item) => (
                  <div key={item.id} style={{ marginBottom: "3.5mm" }}>
                    <div style={{ fontSize: "8pt", fontWeight: "bold", color: "#fff", marginBottom: "1.5mm" }}>{item.title}</div>
                    {item.subtitle && <div style={{ fontSize: "7pt", color: "rgba(255,255,255,0.5)", marginBottom: "1.5mm" }}>{item.subtitle}</div>}
                    {item.tags && item.tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5mm" }}>
                        {item.tags.map((tag, ti) => (
                          <span key={ti} style={{
                            fontSize: "6pt", padding: "0.8mm 2mm",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.7)",
                            borderRadius: "20px",
                            border: "1px solid rgba(255,255,255,0.15)",
                          }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Contact */}
            <div style={{ marginTop: "auto" }}>
              <div style={{ fontSize: "8.5pt", fontWeight: "bold", letterSpacing: "1.5px", textTransform: "uppercase", color: ACCENT, marginBottom: "3mm" }}>
                Contact
              </div>
              {[
                { label: address },
                { label: phone },
                { label: email },
                { label: website },
              ].filter(c => c.label).map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "2.5mm", marginBottom: "2.5mm" }}>
                  <div style={{ width: "1.5mm", height: "1.5mm", borderRadius: "50%", backgroundColor: ACCENT, marginTop: "2mm", flexShrink: 0 }} />
                  <span style={{ fontSize: "7.5pt", color: "rgba(255,255,255,0.72)", lineHeight: 1.4, wordBreak: "break-all" }}>{c.label}</span>
                </div>
              ))}
            </div>

            {/* QR */}
            <div style={{ textAlign: "center", paddingTop: "5mm", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "inline-block", padding: "2mm", backgroundColor: "#fff", borderRadius: "4px", marginBottom: "1.5mm" }}>
                <QRCodeSVG value={`https://${website}`} size={46} bgColor="#ffffff" fgColor={SIDEBAR_BG} level="M" />
              </div>
              <div style={{ fontSize: "6pt", color: "rgba(255,255,255,0.35)", letterSpacing: "0.3px" }}>{website}</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT MAIN CONTENT ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Name + Title header */}
          <div style={{
            padding: "10mm 9mm 7mm 9mm",
            borderBottom: `3px solid ${ACCENT}`,
            position: "relative",
          }}>
            {/* Accent corner block */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: "18mm", height: "18mm",
              backgroundColor: ACCENT, opacity: 0.15,
            }} />
            <div style={{ fontSize: "10pt", fontWeight: "300", letterSpacing: "4px", textTransform: "uppercase", color: "#888", marginBottom: "1mm" }}>
              {firstName}
            </div>
            <div style={{ fontSize: "24pt", fontWeight: "900", letterSpacing: "-0.5px", lineHeight: 1.05, color: SIDEBAR_BG, textTransform: "uppercase" }}>
              {lastName || firstName}
            </div>
            <div style={{ fontSize: "8.5pt", letterSpacing: "2px", textTransform: "uppercase", color: ACCENT, marginTop: "2.5mm", fontWeight: "600" }}>
              {jobTitle}
            </div>
          </div>

          {/* Sections */}
          <div style={{ padding: "7mm 9mm 8mm 9mm", flex: 1, display: "flex", flexDirection: "column", gap: "6mm" }}>

            {/* Experience */}
            {experience.length > 0 && (
              <div>
                <PrintSection title="Experience" accent={ACCENT} />
                {experience.map((item, i) => (
                  <PrintEntry key={item.id} item={item} isLast={i === experience.length - 1} accent={ACCENT} />
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <PrintSection title="Education" accent={ACCENT} />
                {education.map((item, i) => (
                  <PrintEntry key={item.id} item={item} isLast={i === education.length - 1} accent={ACCENT} />
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: "auto", paddingTop: "4mm", borderTop: "1px solid #eee" }}>
              <div style={{ fontSize: "6pt", color: "#bbb", textAlign: "center", letterSpacing: "0.3px" }}>
                References available upon request · {email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Screen layout sub-component ── */
function ResumeEntry({ item, isLast, color }: { item: ResumeItem; isLast: boolean; color: string }) {
  const dateRange = [item.startDate, item.endDate].filter(Boolean).join(" — ") || "";
  const dotColors: Record<string, string> = { blue: "bg-blue-500", emerald: "bg-emerald-500", purple: "bg-purple-500" };
  return (
    <div className="flex gap-4" data-testid={`card-resume-${item.id}`}>
      <div className="flex flex-col items-center pt-2">
        <div className={`w-3 h-3 rounded-full ${dotColors[color] || "bg-primary"} shrink-0 ring-4 ring-background`} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>
      <div className="pb-8 min-w-0">
        <h3 className="font-semibold">{item.title}</h3>
        {item.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{item.subtitle}</p>}
        {dateRange && <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5"><Calendar size={12} />{dateRange}</p>}
        {item.description && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.description}</p>}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.tags.map((tag, i) => <span key={i} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-semibold rounded-full">{tag}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Print-only sub-components ── */
function PrintSection({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3mm", marginBottom: "4mm" }}>
      <div style={{ width: "3px", height: "12pt", backgroundColor: accent, borderRadius: "2px", flexShrink: 0 }} />
      <div style={{ fontSize: "9pt", fontWeight: "900", letterSpacing: "2px", textTransform: "uppercase", color: "#232323" }}>
        {title}
      </div>
      <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
    </div>
  );
}

function PrintEntry({ item, isLast, accent }: { item: ResumeItem; isLast: boolean; accent: string }) {
  const dateRange = [item.startDate, item.endDate].filter(Boolean).join(" – ") || "";
  return (
    <div style={{ display: "flex", gap: "3.5mm", marginBottom: isLast ? "0" : "4mm", paddingBottom: isLast ? "0" : "4mm" }}>
      {/* Dot */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "1mm" }}>
        <div style={{ width: "3mm", height: "3mm", borderRadius: "50%", backgroundColor: accent, flexShrink: 0 }} />
        {!isLast && <div style={{ width: "1px", flex: 1, backgroundColor: "#e5e7eb", marginTop: "1.5mm" }} />}
      </div>
      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "3mm" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "8.5pt", fontWeight: "bold", color: "#232323", lineHeight: 1.3 }}>{item.title}</div>
            {item.subtitle && <div style={{ fontSize: "7.5pt", color: "#777", fontStyle: "italic", marginTop: "0.5mm" }}>{item.subtitle}</div>}
          </div>
          {dateRange && (
            <div style={{ fontSize: "6.5pt", color: accent, fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0, marginTop: "1mm", letterSpacing: "0.3px" }}>
              {dateRange}
            </div>
          )}
        </div>
        {item.description && (
          <div style={{ fontSize: "7pt", color: "#666", marginTop: "1.5mm", lineHeight: 1.65 }}>{item.description}</div>
        )}
        {item.tags && item.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5mm", marginTop: "2mm" }}>
            {item.tags.map((tag, i) => (
              <span key={i} style={{
                fontSize: "5.5pt", padding: "0.5mm 2mm",
                backgroundColor: "#f8f8f8", color: "#555",
                borderRadius: "20px", border: "1px solid #e5e7eb",
              }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
