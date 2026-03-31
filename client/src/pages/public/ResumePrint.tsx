import { useEffect } from "react";
import { useResumeItems } from "@/hooks/use-resume";
import { useSiteSettings } from "@/hooks/use-settings";
import { QRCodeSVG } from "qrcode.react";
import type { ResumeItem } from "@shared/schema";

const ACCENT = "#D4A843";
const DARK = "#212121";

export default function ResumePrint() {
  const { data: items, isLoading: loadingItems } = useResumeItems();
  const { data: settings, isLoading: loadingSettings } = useSiteSettings();

  const isLoading = loadingItems || loadingSettings;

  const experience = items?.filter(i => i.type === "experience") ?? [];
  const education  = items?.filter(i => i.type === "education")  ?? [];
  const skills     = items?.filter(i => i.type === "skill")      ?? [];

  const fullName   = settings?.resumeFullName  || "Choiril Ahmad";
  const nameParts  = fullName.trim().split(" ");
  const firstName  = nameParts.slice(0, -1).join(" ") || nameParts[0];
  const lastName   = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const jobTitle   = settings?.resumeTitle     || "Frontend Developer";
  const about      = settings?.resumeAbout     || "";
  const photoUrl   = settings?.resumePhotoUrl  || "";
  const birthDate      = settings?.resumeBirthDate      || "";
  const birthPlace     = settings?.resumeBirthPlace     || "";
  const religion       = settings?.resumeReligion       || "";
  const gender         = settings?.resumeGender         || "";
  const marriageStatus = settings?.resumeMarriagestatus || "";
  const nationality    = settings?.resumeNationality    || "";
  const phone      = settings?.resumePhone     || "";
  const address    = settings?.resumeAddress   || "";
  const email      = settings?.resumeEmail     || "";
  const website    = settings?.resumeWebsite   || "";

  useEffect(() => {
    document.title = `CV — ${fullName}`;
  }, [fullName]);

  if (isLoading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"sans-serif", color:"#888" }}>
        Memuat data CV…
      </div>
    );
  }

  return (
    <>
      {/* ── Global styles: only used on this page ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #e5e5e5; }

        /* Print-bar: visible on screen, hidden when printing */
        .cv-print-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          background: #1e1e1e;
          color: #fff;
          font-family: sans-serif;
          font-size: 13px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .cv-print-bar button {
          background: ${ACCENT};
          color: #fff;
          border: none;
          padding: 8px 22px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.5px;
        }

        /* A4 wrapper */
        .cv-page {
          width: 210mm;
          height: 297mm;
          margin: 20px auto;
          display: flex;
          flex-direction: row;
          background: #fff;
          box-shadow: 0 4px 32px rgba(0,0,0,0.18);
          font-family: 'Inter', 'Helvetica Neue', Helvetica, sans-serif;
          overflow: hidden;
        }

        /* ── LEFT SIDEBAR ── */
        .cv-sidebar {
          width: 68mm;
          height: 297mm;
          background-color: ${DARK};
          color: #fff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow: hidden;
        }
        .cv-photo-wrap {
          width: 100%;
          height: 56mm;
          overflow: hidden;
          position: relative;
          background: #333;
          flex-shrink: 0;
        }
        .cv-photo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
        }
        .cv-photo-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32pt;
          font-weight: 900;
          color: rgba(255,255,255,0.12);
          letter-spacing: 3px;
        }
        .cv-photo-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: ${ACCENT};
        }
        .cv-sidebar-body {
          padding: 6mm 6mm 7mm 6mm;
          display: flex;
          flex-direction: column;
          gap: 5mm;
          flex: 1;
        }
        /* Sidebar section label */
        .cv-side-label {
          font-size: 7pt;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: ${ACCENT};
          display: flex;
          align-items: center;
          gap: 2.5mm;
          margin-bottom: 2.5mm;
        }
        .cv-side-label::before {
          content: '';
          width: 8px;
          height: 1.5px;
          background: ${ACCENT};
          flex-shrink: 0;
        }
        .cv-side-text {
          font-size: 7pt;
          color: rgba(255,255,255,0.65);
          line-height: 1.75;
        }
        .cv-side-field-label {
          font-size: 5.5pt;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 0.5mm;
        }
        .cv-side-field-value {
          font-size: 7.5pt;
          font-weight: 600;
          color: rgba(255,255,255,0.82);
          margin-bottom: 2mm;
        }
        /* Skill item */
        .cv-skill-name {
          font-size: 7.5pt;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.8mm;
        }
        .cv-skill-sub {
          font-size: 6pt;
          color: rgba(255,255,255,0.4);
          margin-bottom: 1mm;
        }
        .cv-skill-tags { display: flex; flex-wrap: wrap; gap: 1.2mm; }
        .cv-skill-tag {
          font-size: 5.5pt;
          padding: 0.5mm 2mm;
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
        }
        /* Contact row */
        .cv-contact-row {
          display: flex;
          align-items: flex-start;
          gap: 2mm;
          margin-bottom: 2.2mm;
        }
        .cv-contact-dot {
          width: 2mm; height: 2mm;
          border-radius: 50%;
          background: ${ACCENT};
          margin-top: 1.5mm;
          flex-shrink: 0;
        }
        .cv-contact-text {
          font-size: 7pt;
          color: rgba(255,255,255,0.68);
          line-height: 1.45;
          word-break: break-all;
        }
        /* QR */
        .cv-qr-wrap {
          margin-top: auto;
          padding-top: 4mm;
          border-top: 1px solid rgba(255,255,255,0.07);
          text-align: center;
        }
        .cv-qr-box {
          display: inline-block;
          padding: 2mm;
          background: #fff;
          border-radius: 4px;
          margin-bottom: 1.5mm;
        }
        .cv-qr-url {
          font-size: 5.5pt;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.3px;
        }

        /* ── RIGHT MAIN ── */
        .cv-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        /* Name header */
        .cv-header {
          padding: 9mm 8mm 6mm 8mm;
          border-bottom: 3px solid ${ACCENT};
          position: relative;
          background: #fff;
        }
        .cv-header-corner {
          position: absolute;
          top: 0; right: 0;
          width: 15mm; height: 56mm;
          background: ${ACCENT};
          opacity: 0.07;
        }
        .cv-full-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28pt;
          font-weight: 900;
          letter-spacing: 1px;
          line-height: 1;
          color: ${DARK};
          text-transform: uppercase;
        }
        .cv-job-title {
          font-size: 7.5pt;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: ${ACCENT};
          margin-top: 3mm;
          padding-top: 2.5mm;
          border-top: 1px solid ${ACCENT}40;
          display: inline-block;
        }

        /* Content sections */
        .cv-sections {
          padding: 6mm 8mm 7mm 8mm;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5.5mm;
        }

        /* Section heading */
        .cv-section-head {
          display: flex;
          align-items: center;
          gap: 2.5mm;
          margin-bottom: 3.5mm;
        }
        .cv-section-bar {
          width: 4px;
          height: 13pt;
          background: ${ACCENT};
          border-radius: 2px;
          flex-shrink: 0;
        }
        .cv-section-title {
          font-size: 10pt;
          font-weight: 900;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #1a1a1a;
        }
        .cv-section-line {
          flex: 1;
          height: 1.5px;
          background: #ececec;
        }

        /* Entry */
        .cv-entry {
          display: flex;
          gap: 3.5mm;
          padding-bottom: 3.5mm;
          margin-bottom: 3.5mm;
          border-bottom: 1px solid #f0f0f0;
        }
        .cv-entry:last-child {
          padding-bottom: 0;
          margin-bottom: 0;
          border-bottom: none;
        }
        .cv-entry-dot-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 1.5mm;
        }
        .cv-entry-dot {
          width: 3.5mm; height: 3.5mm;
          border-radius: 50%;
          background: ${ACCENT};
          flex-shrink: 0;
        }
        .cv-entry-line {
          width: 1.5px;
          flex: 1;
          background: #e8e8e8;
          margin-top: 1.5mm;
        }
        .cv-entry-content { flex: 1; }
        .cv-entry-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 3mm;
          margin-bottom: 1mm;
        }
        .cv-entry-title {
          font-size: 9.5pt;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1.25;
          flex: 1;
        }
        .cv-entry-date {
          font-size: 6.5pt;
          color: ${ACCENT};
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
          margin-top: 1.5mm;
          letter-spacing: 0.3px;
        }
        .cv-entry-subtitle {
          font-size: 8pt;
          font-weight: 600;
          color: #555;
          margin-bottom: 1.5mm;
          letter-spacing: 0.1px;
        }
        .cv-entry-desc {
          font-size: 7pt;
          color: #777;
          line-height: 1.7;
          margin-bottom: 1.5mm;
        }
        .cv-entry-tags { display: flex; flex-wrap: wrap; gap: 1.5mm; }
        .cv-entry-tag {
          font-size: 5.5pt;
          padding: 0.5mm 2.2mm;
          background: #f5f5f5;
          color: #666;
          border: 1px solid #e5e5e5;
          border-radius: 20px;
          font-weight: 500;
        }

        /* Footer line */
        .cv-footer {
          margin-top: auto;
          padding-top: 3mm;
          border-top: 1px solid #ececec;
          font-size: 5.5pt;
          color: #c0c0c0;
          text-align: center;
          letter-spacing: 0.3px;
        }

        /* ── PRINT MEDIA ── */
        @media print {
          @page { margin: 0; size: A4 portrait; }
          html, body { background: #fff !important; }
          .cv-print-bar { display: none !important; }
          .cv-page {
            margin: 0 !important;
            box-shadow: none !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
          }
          .cv-sidebar { background-color: ${DARK} !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .cv-photo-bar { background: ${ACCENT} !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .cv-section-bar { background: ${ACCENT} !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .cv-entry-dot { background: ${ACCENT} !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .cv-contact-dot { background: ${ACCENT} !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .cv-header-corner { background: ${ACCENT} !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* ── Print toolbar (screen only) ── */}
      <div className="cv-print-bar">
        <span>Preview CV {fullName} — klik Print untuk simpan sebagai PDF</span>
        <button onClick={() => window.print()}>🖨️ Print / Save PDF</button>
        <button
          onClick={() => window.close()}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#aaa", marginLeft: 4 }}
        >
          Tutup
        </button>
      </div>

      {/* ── A4 CV Page ── */}
      <div className="cv-page">

        {/* ════════ LEFT SIDEBAR ════════ */}
        <div className="cv-sidebar">

          {/* Photo */}
          <div className="cv-photo-wrap">
            {photoUrl
              ? <img src={photoUrl} alt={fullName} />
              : <div className="cv-photo-initials">{(firstName[0] || "") + (lastName[0] || "")}</div>
            }
            <div className="cv-photo-bar" />
          </div>

          <div className="cv-sidebar-body">

            {/* About Me */}
            {about && (
              <div>
                <div className="cv-side-label">About Me</div>
                <div className="cv-side-text">{about}</div>
              </div>
            )}

            {/* Personal Info */}
            {(birthDate || birthPlace || religion || gender || marriageStatus || nationality) && (
              <div>
                <div className="cv-side-label">Personal Info</div>
                {birthDate && (
                  <>
                    <div className="cv-side-field-label">Tanggal Lahir</div>
                    <div className="cv-side-field-value">{birthDate}</div>
                  </>
                )}
                {birthPlace && (
                  <>
                    <div className="cv-side-field-label">Tempat Lahir</div>
                    <div className="cv-side-field-value">{birthPlace}</div>
                  </>
                )}
                {gender && (
                  <>
                    <div className="cv-side-field-label">Jenis Kelamin</div>
                    <div className="cv-side-field-value">{gender}</div>
                  </>
                )}
                {religion && (
                  <>
                    <div className="cv-side-field-label">Agama</div>
                    <div className="cv-side-field-value">{religion}</div>
                  </>
                )}
                {marriageStatus && (
                  <>
                    <div className="cv-side-field-label">Status Perkawinan</div>
                    <div className="cv-side-field-value">{marriageStatus}</div>
                  </>
                )}
                {nationality && (
                  <>
                    <div className="cv-side-field-label">Kewarganegaraan</div>
                    <div className="cv-side-field-value">{nationality}</div>
                  </>
                )}
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <div className="cv-side-label">Skills</div>
                {skills.map(s => (
                  <div key={s.id} style={{ marginBottom: "3mm" }}>
                    <div className="cv-skill-name">{s.title}</div>
                    {s.subtitle && <div className="cv-skill-sub">{s.subtitle}</div>}
                    {s.tags && s.tags.length > 0 && (
                      <div className="cv-skill-tags">
                        {s.tags.map((t, i) => <span key={i} className="cv-skill-tag">{t}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Contact */}
            {(address || phone || email || website) && (
              <div style={{ marginTop: "auto" }}>
                <div className="cv-side-label">Contact</div>
                {[address, phone, email, website].filter(Boolean).map((v, i) => (
                  <div key={i} className="cv-contact-row">
                    <div className="cv-contact-dot" />
                    <span className="cv-contact-text">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* QR Code */}
            {website && (
              <div className="cv-qr-wrap">
                <div className="cv-qr-box">
                  <QRCodeSVG
                    value={website.startsWith("http") ? website : `https://${website}`}
                    size={44}
                    bgColor="#ffffff"
                    fgColor={DARK}
                    level="M"
                  />
                </div>
                <div className="cv-qr-url">{website}</div>
              </div>
            )}

          </div>
        </div>

        {/* ════════ RIGHT MAIN CONTENT ════════ */}
        <div className="cv-main">

          {/* Name + Title header */}
          <div className="cv-header">
            <div className="cv-header-corner" />
            <div className="cv-full-name">{fullName.toUpperCase()}</div>
            <div className="cv-job-title">{jobTitle}</div>
          </div>

          {/* Sections */}
          <div className="cv-sections">

            {/* Experience */}
            {experience.length > 0 && (
              <div>
                <div className="cv-section-head">
                  <div className="cv-section-bar" />
                  <div className="cv-section-title">Experience</div>
                  <div className="cv-section-line" />
                </div>
                {experience.map((item, i) => (
                  <CVEntry key={item.id} item={item} isLast={i === experience.length - 1} />
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <div className="cv-section-head">
                  <div className="cv-section-bar" />
                  <div className="cv-section-title">Education</div>
                  <div className="cv-section-line" />
                </div>
                {education.map((item, i) => (
                  <CVEntry key={item.id} item={item} isLast={i === education.length - 1} />
                ))}
              </div>
            )}

            {/* Footer */}
            {email && (
              <div className="cv-footer">
                References available upon request · {email}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CVEntry({ item, isLast }: { item: ResumeItem; isLast: boolean }) {
  const date = [item.startDate, item.endDate].filter(Boolean).join(" – ");
  return (
    <div className={`cv-entry${isLast ? " last" : ""}`}>
      <div className="cv-entry-dot-col">
        <div className="cv-entry-dot" />
        {!isLast && <div className="cv-entry-line" />}
      </div>
      <div className="cv-entry-content">
        <div className="cv-entry-top">
          <div className="cv-entry-title">{item.title}</div>
          {date && <div className="cv-entry-date">{date}</div>}
        </div>
        {item.subtitle  && <div className="cv-entry-subtitle">{item.subtitle}</div>}
        {item.description && <div className="cv-entry-desc">{item.description}</div>}
        {item.tags && item.tags.length > 0 && (
          <div className="cv-entry-tags">
            {item.tags.map((t, i) => <span key={i} className="cv-entry-tag">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
