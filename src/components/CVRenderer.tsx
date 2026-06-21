import { TemplateConfig } from '../data/templates';
import { CVContent } from '../lib/supabase';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

interface CVRendererProps {
  template: TemplateConfig;
  content: CVContent;
  showWatermark?: boolean;
}

const levelPercent = (level: number) => `${(level / 5) * 100}%`;
const langLevelWidth: Record<string, string> = {
  Native: '100%', C2: '95%', C1: '85%', B2: '70%', B1: '55%', A2: '40%', A1: '25%',
};
const isDarkBg = (bg: string) =>
  ['#0F172A', '#020617', '#0A0F1A', '#0F0F23', '#111827', '#1A1A2E', '#0D0D0D'].includes(bg);

// html2canvas ne parse pas fiablement le format hex 8 chiffres (#RRGGBBAA),
// produit par la concatenation `${color}CC`. Cela renvoie NaN pour le canal
// alpha et fait planter `CanvasGradient.addColorStop`. On convertit donc
// systématiquement en rgba(), supporté universellement.
function hexAlpha(hex: string, alphaHex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const a = parseInt(alphaHex, 16) / 255;
  if ([r, g, b, a].some(Number.isNaN)) return hex; // sécurité : couleur déjà valide telle quelle
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

// ── Primitives ──────────────────────────────────────────────────────────────

function ContactItem({ type, value, color, size = 9 }: { type: string; value: string; color: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    email: <Mail size={size} style={{ color }} />,
    phone: <Phone size={size} style={{ color }} />,
    address: <MapPin size={size} style={{ color }} />,
    website: <Globe size={size} style={{ color }} />,
    linkedin: <Linkedin size={size} style={{ color }} />,
  };
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color, fontSize: size, lineHeight: 1.4 }}>
      {icons[type] ?? null}
      {value}
    </span>
  );
}

function ProgressBar({ pct, color, bg }: { pct: string; color: string; bg: string }) {
  return (
    <div style={{ width: '100%', height: 5, backgroundColor: bg, borderRadius: 6, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: pct, backgroundColor: color, borderRadius: 6 }} />
    </div>
  );
}

function DotRating({ pct, color, bg }: { pct: string; color: string; bg: string }) {
  const filled = Math.round((parseFloat(pct) / 100) * 5);
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: i < filled ? color : bg }} />
      ))}
    </div>
  );
}

function SectionTitle({ children, color, light = false, style: extraStyle }: { children: React.ReactNode; color: string; light?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, ...extraStyle }}>
      <span style={{
        fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2.5,
        color: light ? 'rgba(255,255,255,0.9)' : color,
        whiteSpace: 'nowrap',
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, backgroundColor: light ? 'rgba(255,255,255,0.2)' : color + '30' }} />
    </div>
  );
}

function PhotoBlock({
  src, initials, shape, size = 72, border, shadow
}: { src?: string; initials?: string; shape: string; size?: number; border?: string; shadow?: string }) {
  const radius = shape === 'circle' ? '50%'
    : shape === 'square' ? '0'
    : shape === 'rounded' ? '14px'
    : shape === 'arch' ? '999px 999px 0 0'
    : shape === 'hexagon' ? '0'
    : shape === 'organic' ? '42% 58% 42% 58%'
    : '50%';

  const boxShadow = shadow ?? 'none';

  if (src) {
    return (
      <img
        src={src}
        alt="Photo"
        style={{
          width: size, height: size, objectFit: 'cover',
          borderRadius: radius,
          border: border ?? 'none',
          display: 'block',
          flexShrink: 0,
          boxShadow,
        }}
      />
    );
  }
  if (initials) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius,
        border: border ?? 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.32, fontWeight: 800, color: '#FFF',
        backgroundColor: 'rgba(255,255,255,0.2)',
        flexShrink: 0, boxShadow,
      }}>
        {initials}
      </div>
    );
  }
  return null;
}

function Watermark() {
  return (
    <div style={{
      position: 'absolute', bottom: 10, left: 0, right: 0,
      textAlign: 'center', opacity: 0.25, pointerEvents: 'none',
    }}>
      <span style={{ fontSize: 7, color: '#9CA3AF', letterSpacing: 1 }}>Propulsé par whitedukeSaaS</span>
    </div>
  );
}

function PortfolioGrid({ photos, accentColor, radius = 8 }: { photos: string[]; accentColor: string; radius?: number }) {
  if (!photos || photos.length === 0) return null;
  return (
    <div>
      <SectionTitle color={accentColor}>Portfolio</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {photos.slice(0, 4).map((photo: string, i: number) => (
          <img key={i} src={photo} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: radius }} />
        ))}
      </div>
    </div>
  );
}

// Organic SVG blob shapes for premium/elite
function BlobShape({ color, style: s }: { color: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" style={{ position: 'absolute', pointerEvents: 'none', ...s }}>
      <path fill={color} d="M42.7,-62.9C53.5,-53.7,59.2,-38.4,65.3,-22.7C71.5,-7.1,78.2,9,75.5,23.2C72.9,37.4,60.9,49.8,47.4,58.1C33.9,66.5,18.8,70.8,2.8,67.4C-13.3,64,-30.3,53,-42.4,40.3C-54.5,27.6,-61.7,13.2,-62.8,-1.6C-63.9,-16.5,-59,-31.9,-49.6,-43.9C-40.3,-56,-26.5,-64.7,-11.3,-68.3C3.9,-72,31.9,-72.1,42.7,-62.9Z" transform="translate(100 100)" />
    </svg>
  );
}

function OvalBlob({ color, style: s }: { color: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 300 200" style={{ position: 'absolute', pointerEvents: 'none', ...s }}>
      <ellipse cx="150" cy="100" rx="130" ry="85" fill={color} />
    </svg>
  );
}

// ── SINGLE COLUMN — Redesigned ──────────────────────────────────────────────

function SingleLayout({ tpl, content, textPrimary, textSec, barBg, showWatermark }: any) {
  const { personalInfo: p, experiences, educations, skills, languages, customSections } = content;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Votre Nom';
  const contacts = [
    { type: 'email', value: p.email },
    { type: 'phone', value: p.phone },
    { type: 'address', value: p.address },
    { type: 'website', value: p.website },
    { type: 'linkedin', value: p.linkedin },
  ].filter(c => c.value);

  return (
    <div style={{ backgroundColor: tpl.bgColor, minHeight: '100%', position: 'relative', fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Beautiful gradient header */}
      <div style={{
        background: `linear-gradient(135deg, ${tpl.primaryColor} 0%, ${hexAlpha(tpl.primaryColor, 'CC')} 100%)`,
        padding: '28px 32px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative oval in background */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 160, height: 120,
          borderRadius: '42% 58% 42% 58%',
          backgroundColor: 'rgba(255,255,255,0.08)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: 40,
          width: 100, height: 80,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}>
          {/* Photo with elegant circle frame */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            {(content.profilePhoto || p.firstName)
              ? (
                <div style={{
                  width: 78, height: 78,
                  borderRadius: tpl.photoShape === 'circle' ? '50%' : tpl.photoShape === 'square' ? '8px' : '50%',
                  border: '3px solid rgba(255,255,255,0.5)',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }}>
                  {content.profilePhoto
                    ? <img src={content.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)', fontSize: 28, fontWeight: 800, color: '#FFF' }}>
                        {(p.firstName || 'N')[0]}
                      </div>
                  }
                </div>
              ) : null
            }
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 23, fontWeight: 900, color: '#FFF', letterSpacing: -0.5, lineHeight: 1.1 }}>{fullName}</div>
            {p.title && (
              <div style={{
                display: 'inline-block', marginTop: 5,
                fontSize: 10, color: '#FFF',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 20, padding: '3px 12px',
                fontWeight: 600, letterSpacing: 0.5,
              }}>{p.title}</div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 10 }}>
              {contacts.map(c => <ContactItem key={c.type} type={c.type} value={c.value} color="rgba(255,255,255,0.8)" />)}
            </div>
          </div>
        </div>
      </div>

      {/* Accent line */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${tpl.accentColor}, ${hexAlpha(tpl.accentColor, '60')})` }} />

      <div style={{ padding: '18px 32px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {p.summary && (
          <div style={{ backgroundColor: hexAlpha(tpl.accentColor, '12'), borderRadius: 10, padding: '12px 16px', borderLeft: `3px solid ${tpl.accentColor}` }}>
            <p style={{ fontSize: 10, color: textSec, lineHeight: 1.7, margin: 0 }}>{p.summary}</p>
          </div>
        )}

        {experiences.length > 0 && (
          <div>
            <SectionTitle color={tpl.accentColor}>Expériences professionnelles</SectionTitle>
            {experiences.map((exp: any, i: number) => (
              <div key={exp.id} style={{ marginBottom: 14, display: 'flex', gap: 12 }}>
                {/* Timeline dot */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: tpl.accentColor }} />
                  {i < experiences.length - 1 && <div style={{ width: 1, flex: 1, backgroundColor: hexAlpha(tpl.accentColor, '30'), marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: i < experiences.length - 1 ? 6 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{exp.position}</div>
                    <div style={{ fontSize: 8, color: '#FFF', backgroundColor: tpl.accentColor, borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>
                      {exp.startDate}{exp.startDate && (exp.current ? ' – Présent' : exp.endDate ? ` – ${exp.endDate}` : '')}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: tpl.accentColor, marginTop: 1 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description && <p style={{ fontSize: 9.5, color: textSec, lineHeight: 1.6, marginTop: 3 }}>{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {educations.length > 0 && (
          <div>
            <SectionTitle color={tpl.accentColor}>Formation</SectionTitle>
            {educations.map((edu: any) => (
              <div key={edu.id} style={{ marginBottom: 10, display: 'flex', gap: 12 }}>
                <div style={{ flexShrink: 0, paddingTop: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: tpl.primaryColor }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</div>
                    <div style={{ fontSize: 8.5, color: textSec, flexShrink: 0, marginLeft: 8 }}>
                      {edu.startDate}{edu.startDate && (edu.current ? ' – Présent' : edu.endDate ? ` – ${edu.endDate}` : '')}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: tpl.accentColor }}>{edu.institution}</div>
                  {edu.description && <p style={{ fontSize: 9.5, color: textSec, lineHeight: 1.5, marginTop: 2 }}>{edu.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          {skills.length > 0 && (
            <div>
              <SectionTitle color={tpl.accentColor}>Compétences</SectionTitle>
              {skills.map((sk: any) => (
                <div key={sk.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: textPrimary }}>{sk.name}</span>
                    <span style={{ fontSize: 8, color: textSec }}>{sk.level}/5</span>
                  </div>
                  <ProgressBar pct={levelPercent(sk.level)} color={tpl.accentColor} bg={barBg} />
                </div>
              ))}
            </div>
          )}
          {languages.length > 0 && (
            <div>
              <SectionTitle color={tpl.accentColor}>Langues</SectionTitle>
              {languages.map((l: any) => (
                <div key={l.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: textPrimary }}>{l.name}</span>
                    <span style={{ fontSize: 8, color: textSec }}>{l.level}</span>
                  </div>
                  <ProgressBar pct={langLevelWidth[l.level] ?? '50%'} color={tpl.accentColor} bg={barBg} />
                </div>
              ))}
            </div>
          )}
        </div>

        {customSections.map((cs: any) => (
          <div key={cs.id}>
            <SectionTitle color={tpl.accentColor}>{cs.title}</SectionTitle>
            <p style={{ fontSize: 10, color: textSec, lineHeight: 1.7 }}>{cs.content}</p>
          </div>
        ))}

        <PortfolioGrid photos={content.portfolioPhotos} accentColor={tpl.accentColor} />
      </div>
      {showWatermark && <Watermark />}
    </div>
  );
}

// ── TWO COLUMN — Redesigned ─────────────────────────────────────────────────

function TwoColLayout({ tpl, content, textPrimary, textSec, barBg, showWatermark }: any) {
  const { personalInfo: p, experiences, educations, skills, languages, customSections } = content;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Votre Nom';
  const contacts = [
    { type: 'email', value: p.email },
    { type: 'phone', value: p.phone },
    { type: 'address', value: p.address },
    { type: 'website', value: p.website },
    { type: 'linkedin', value: p.linkedin },
  ].filter(c => c.value);

  return (
    <div style={{ backgroundColor: tpl.bgColor, minHeight: '100%', position: 'relative', fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: tpl.primaryColor, padding: '22px 28px 18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 140, borderRadius: '50% 30% 70% 40% / 40% 50% 60% 50%',
          backgroundColor: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}>
          {/* Always show photo */}
          <div style={{
            width: 72, height: 72, flexShrink: 0,
            borderRadius: tpl.photoShape === 'circle' ? '50%' : tpl.photoShape === 'square' ? '6px' : '50%',
            border: '3px solid rgba(255,255,255,0.45)',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
            {content.profilePhoto
              ? <img src={content.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)', fontSize: 26, fontWeight: 800, color: '#FFF' }}>
                  {(p.firstName || 'N')[0]}
                </div>
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 21, fontWeight: 800, color: '#FFF', lineHeight: 1.1 }}>{fullName}</div>
            {p.title && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 3, fontWeight: 500 }}>{p.title}</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 8 }}>
              {contacts.map(c => <ContactItem key={c.type} type={c.type} value={c.value} color="rgba(255,255,255,0.75)" />)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: '36%', padding: '16px 18px', backgroundColor: tpl.secondaryColor, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {p.summary && (
            <div>
              <SectionTitle color={tpl.primaryColor}>Profil</SectionTitle>
              <p style={{ fontSize: 9.5, color: textSec, lineHeight: 1.65 }}>{p.summary}</p>
            </div>
          )}
          {skills.length > 0 && (
            <div>
              <SectionTitle color={tpl.primaryColor}>Compétences</SectionTitle>
              {skills.map((sk: any) => (
                <div key={sk.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: textPrimary, marginBottom: 2 }}>{sk.name}</div>
                  <DotRating pct={levelPercent(sk.level)} color={tpl.accentColor} bg={barBg} />
                </div>
              ))}
            </div>
          )}
          {languages.length > 0 && (
            <div>
              <SectionTitle color={tpl.primaryColor}>Langues</SectionTitle>
              {languages.map((l: any) => (
                <div key={l.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: textPrimary }}>{l.name}</span>
                    <span style={{ fontSize: 8, color: textSec }}>{l.level}</span>
                  </div>
                  <ProgressBar pct={langLevelWidth[l.level] ?? '50%'} color={tpl.accentColor} bg={barBg} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {experiences.length > 0 && (
            <div>
              <SectionTitle color={tpl.accentColor}>Expériences</SectionTitle>
              {experiences.map((exp: any) => (
                <div key={exp.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${hexAlpha(tpl.accentColor, '40')}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{exp.position}</div>
                    <div style={{ fontSize: 8, color: '#FFF', backgroundColor: tpl.accentColor, borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>
                      {exp.startDate}{exp.current ? '–Présent' : exp.endDate ? `–${exp.endDate}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: tpl.accentColor, fontWeight: 600 }}>{exp.company}</div>
                  {exp.description && <p style={{ fontSize: 9.5, color: textSec, lineHeight: 1.55, marginTop: 2 }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
          {educations.length > 0 && (
            <div>
              <SectionTitle color={tpl.accentColor}>Formation</SectionTitle>
              {educations.map((edu: any) => (
                <div key={edu.id} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${hexAlpha(tpl.primaryColor, '40')}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{edu.degree}</div>
                    <div style={{ fontSize: 8.5, color: textSec }}>{edu.startDate}{edu.current ? '–Présent' : edu.endDate ? `–${edu.endDate}` : ''}</div>
                  </div>
                  <div style={{ fontSize: 10, color: tpl.accentColor, fontWeight: 600 }}>{edu.institution}</div>
                </div>
              ))}
            </div>
          )}
          {customSections.map((cs: any) => (
            <div key={cs.id}>
              <SectionTitle color={tpl.accentColor}>{cs.title}</SectionTitle>
              <p style={{ fontSize: 10, color: textSec, lineHeight: 1.7 }}>{cs.content}</p>
            </div>
          ))}
          <PortfolioGrid photos={content.portfolioPhotos} accentColor={tpl.accentColor} />
        </div>
      </div>
      {showWatermark && <Watermark />}
    </div>
  );
}

// ── SIDEBAR LEFT — Redesigned ───────────────────────────────────────────────

function SidebarLeftLayout({ tpl, content, textPrimary, textSec, showWatermark }: any) {
  const { personalInfo: p, experiences, educations, skills, languages, customSections } = content;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Votre Nom';
  const contacts = [
    { type: 'email', value: p.email },
    { type: 'phone', value: p.phone },
    { type: 'address', value: p.address },
    { type: 'website', value: p.website },
    { type: 'linkedin', value: p.linkedin },
  ].filter(c => c.value);

  return (
    <div style={{ backgroundColor: tpl.bgColor, minHeight: '100%', position: 'relative', display: 'flex', fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Beautiful Sidebar */}
      <div style={{
        width: '35%', minHeight: '100%', backgroundColor: tpl.primaryColor,
        padding: '28px 16px 24px',
        display: 'flex', flexDirection: 'column', gap: 18,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Oval blob decorations */}
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 140, height: 110,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.08)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 40, left: -30,
          width: 120, height: 90,
          borderRadius: '60% 40% 50% 70% / 50% 60% 40% 50%',
          backgroundColor: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }} />

        {/* Photo + Name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: tpl.photoShape === 'circle' ? '50%' : tpl.photoShape === 'square' ? '10px' : tpl.photoShape === 'organic' ? '42% 58% 42% 58%' : '50%',
            border: '3px solid rgba(255,255,255,0.4)',
            overflow: 'hidden',
            boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
          }}>
            {content.profilePhoto
              ? <img src={content.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)', fontSize: 28, fontWeight: 800, color: '#FFF' }}>
                  {(p.firstName || 'N')[0]}
                </div>
            }
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FFF', lineHeight: 1.2 }}>{fullName}</div>
            {p.title && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 4, lineHeight: 1.4 }}>{p.title}</div>}
          </div>
        </div>

        {/* Contact divider */}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 4 }} />
            {contacts.map(c => <ContactItem key={c.type} type={c.type} value={c.value} color="rgba(255,255,255,0.75)" />)}
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <SectionTitle color="rgba(255,255,255,0.9)" light>Compétences</SectionTitle>
            {skills.map((sk: any) => (
              <div key={sk.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#FFF', fontWeight: 500, marginBottom: 3 }}>{sk.name}</div>
                <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: levelPercent(sk.level), backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <SectionTitle color="rgba(255,255,255,0.9)" light>Langues</SectionTitle>
            {languages.map((l: any) => (
              <div key={l.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: '#FFF', fontWeight: 500 }}>{l.name}</span>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>{l.level}</span>
                </div>
                <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: langLevelWidth[l.level] ?? '50%', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '24px 20px 24px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {p.summary && (
          <div>
            <SectionTitle color={tpl.accentColor}>Profil</SectionTitle>
            <p style={{ fontSize: 10, color: textSec, lineHeight: 1.7 }}>{p.summary}</p>
          </div>
        )}
        {experiences.length > 0 && (
          <div>
            <SectionTitle color={tpl.accentColor}>Expériences professionnelles</SectionTitle>
            {experiences.map((exp: any, i: number) => (
              <div key={exp.id} style={{ marginBottom: 14, display: 'flex', gap: 10 }}>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: tpl.accentColor, border: `2px solid ${hexAlpha(tpl.accentColor, '40')}` }} />
                  {i < experiences.length - 1 && <div style={{ width: 1, flex: 1, backgroundColor: hexAlpha(tpl.accentColor, '25'), marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{exp.position}</div>
                    <div style={{ fontSize: 8, color: textSec }}>
                      {exp.startDate}{exp.startDate && (exp.current ? ' – Présent' : exp.endDate ? ` – ${exp.endDate}` : '')}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: tpl.accentColor, fontWeight: 600, marginTop: 1 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description && <p style={{ fontSize: 9.5, color: textSec, lineHeight: 1.6, marginTop: 3 }}>{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        {educations.length > 0 && (
          <div>
            <SectionTitle color={tpl.accentColor}>Formation</SectionTitle>
            {educations.map((edu: any) => (
              <div key={edu.id} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${tpl.accentColor}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</div>
                <div style={{ fontSize: 10, color: tpl.accentColor, fontWeight: 600 }}>{edu.institution}</div>
                <div style={{ fontSize: 8.5, color: textSec }}>{edu.startDate}{edu.startDate && (edu.current ? ' – Présent' : edu.endDate ? ` – ${edu.endDate}` : '')}</div>
              </div>
            ))}
          </div>
        )}
        {customSections.map((cs: any) => (
          <div key={cs.id}>
            <SectionTitle color={tpl.accentColor}>{cs.title}</SectionTitle>
            <p style={{ fontSize: 10, color: textSec, lineHeight: 1.7 }}>{cs.content}</p>
          </div>
        ))}
        <PortfolioGrid photos={content.portfolioPhotos} accentColor={tpl.accentColor} />
      </div>
      {showWatermark && <Watermark />}
    </div>
  );
}

// ── SIDEBAR RIGHT — Redesigned ───────────────────────────────────────────────

function SidebarRightLayout({ tpl, content, textPrimary, textSec, barBg, dark, showWatermark }: any) {
  const { personalInfo: p, experiences, educations, skills, languages, customSections } = content;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Votre Nom';
  const contacts = [
    { type: 'email', value: p.email },
    { type: 'phone', value: p.phone },
    { type: 'address', value: p.address },
    { type: 'website', value: p.website },
    { type: 'linkedin', value: p.linkedin },
  ].filter(c => c.value);

  return (
    <div style={{ backgroundColor: tpl.bgColor, minHeight: '100%', position: 'relative', display: 'flex', fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Main */}
      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 23, fontWeight: 900, color: tpl.accentColor, letterSpacing: -0.5 }}>{fullName}</div>
          {p.title && <div style={{ fontSize: 11, color: textSec, marginTop: 3, fontWeight: 500 }}>{p.title}</div>}
          <div style={{ width: 40, height: 3, backgroundColor: tpl.accentColor, borderRadius: 2, marginTop: 8 }} />
        </div>
        {p.summary && (
          <div>
            <SectionTitle color={tpl.accentColor}>Profil</SectionTitle>
            <p style={{ fontSize: 10, color: textSec, lineHeight: 1.7 }}>{p.summary}</p>
          </div>
        )}
        {experiences.length > 0 && (
          <div>
            <SectionTitle color={tpl.accentColor}>Expériences</SectionTitle>
            {experiences.map((exp: any) => (
              <div key={exp.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{exp.position}</div>
                  <div style={{ fontSize: 8.5, color: tpl.accentColor, flexShrink: 0 }}>
                    {exp.startDate}{exp.current ? ' → Présent' : exp.endDate ? ` → ${exp.endDate}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: tpl.accentColor, fontWeight: 600 }}>{exp.company}</div>
                {exp.description && <p style={{ fontSize: 9.5, color: textSec, lineHeight: 1.55, marginTop: 2 }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {educations.length > 0 && (
          <div>
            <SectionTitle color={tpl.accentColor}>Formation</SectionTitle>
            {educations.map((edu: any) => (
              <div key={edu.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{edu.degree}</div>
                <div style={{ fontSize: 10, color: tpl.accentColor, fontWeight: 600 }}>{edu.institution}</div>
                <div style={{ fontSize: 8.5, color: textSec }}>{edu.startDate}{edu.current ? ' → Présent' : edu.endDate ? ` → ${edu.endDate}` : ''}</div>
              </div>
            ))}
          </div>
        )}
        {customSections.map((cs: any) => (
          <div key={cs.id}>
            <SectionTitle color={tpl.accentColor}>{cs.title}</SectionTitle>
            <p style={{ fontSize: 10, color: textSec, lineHeight: 1.7 }}>{cs.content}</p>
          </div>
        ))}
      </div>

      {/* Right sidebar */}
      <div style={{
        width: '33%', minHeight: '100%', backgroundColor: tpl.secondaryColor,
        padding: '24px 14px 20px',
        display: 'flex', flexDirection: 'column', gap: 14,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, left: -20,
          width: 130, height: 100, borderRadius: '50%',
          backgroundColor: hexAlpha(tpl.primaryColor, '20'), pointerEvents: 'none',
        }} />
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 4, position: 'relative'
        }}>
          <div style={{
            width: 78, height: 78, flexShrink: 0,
            borderRadius: tpl.photoShape === 'circle' ? '50%' : '10px',
            border: `3px solid ${hexAlpha(tpl.accentColor, '50')}`,
            overflow: 'hidden',
            boxShadow: `0 4px 20px ${hexAlpha(tpl.accentColor, '30')}`,
          }}>
            {content.profilePhoto
              ? <img src={content.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: hexAlpha(tpl.primaryColor, '30'), fontSize: 26, fontWeight: 800, color: tpl.primaryColor }}>
                  {(p.firstName || 'N')[0]}
                </div>
            }
          </div>
        </div>

        {contacts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {contacts.map(c => <ContactItem key={c.type} type={c.type} value={c.value} color={dark ? '#94A3B8' : '#6B7280'} />)}
          </div>
        )}
        {skills.length > 0 && (
          <div>
            <SectionTitle color={tpl.accentColor}>Compétences</SectionTitle>
            {skills.map((sk: any) => (
              <div key={sk.id} style={{ marginBottom: 7 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: textPrimary }}>{sk.name}</span>
                <div style={{ height: 4, backgroundColor: barBg, borderRadius: 4, marginTop: 3 }}>
                  <div style={{ height: '100%', width: levelPercent(sk.level), backgroundColor: tpl.accentColor, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <SectionTitle color={tpl.accentColor}>Langues</SectionTitle>
            {languages.map((l: any) => (
              <div key={l.id} style={{ marginBottom: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: textPrimary }}>{l.name}</span>
                  <span style={{ fontSize: 8, color: textSec }}>{l.level}</span>
                </div>
                <div style={{ height: 4, backgroundColor: barBg, borderRadius: 4 }}>
                  <div style={{ height: '100%', width: langLevelWidth[l.level] ?? '50%', backgroundColor: tpl.accentColor, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        )}
        <PortfolioGrid photos={content.portfolioPhotos} accentColor={tpl.accentColor} />
      </div>
      {showWatermark && <Watermark />}
    </div>
  );
}

// ── ASYMMETRIC — Premium with fluid organic shapes ──────────────────────────

function AsymmetricLayout({ tpl, content, textPrimary, textSec, barBg, dark, showWatermark }: any) {
  const { personalInfo: p, experiences, educations, skills, languages, customSections } = content;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Votre Nom';
  const contacts = [
    { type: 'email', value: p.email },
    { type: 'phone', value: p.phone },
    { type: 'address', value: p.address },
    { type: 'website', value: p.website },
    { type: 'linkedin', value: p.linkedin },
  ].filter(c => c.value);

  const blockBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)';

  return (
    <div style={{ backgroundColor: tpl.bgColor, minHeight: '100%', position: 'relative', fontFamily: 'Inter, Arial, sans-serif', overflow: 'hidden' }}>

      {/* === FLUID BLOB SHAPES (inspiration Magnific/Freepik) === */}
      {/* Large background organic blob top-right */}
      <svg viewBox="0 0 300 260" style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 220, pointerEvents: 'none', opacity: 0.18 }}>
        <path fill={tpl.primaryColor} d="M60,-80C75,-65,82,-42,85,-18C88,6,87,32,75,52C63,73,41,88,16,95C-10,103,-39,103,-60,90C-82,77,-97,51,-100,24C-103,-4,-94,-33,-76,-53C-59,-74,-32,-87,-4,-86C24,-85,45,-95,60,-80Z" transform="translate(140 130)" />
      </svg>

      {/* Medium oval shape mid-left */}
      <svg viewBox="0 0 200 150" style={{ position: 'absolute', top: 80, left: -40, width: 180, height: 120, pointerEvents: 'none', opacity: 0.12 }}>
        <ellipse cx="100" cy="75" rx="90" ry="60" fill={tpl.accentColor} />
      </svg>

      {/* Small fluid blob bottom */}
      <svg viewBox="0 0 200 200" style={{ position: 'absolute', bottom: 20, right: 20, width: 130, height: 100, pointerEvents: 'none', opacity: 0.1 }}>
        <path fill={tpl.accentColor} d="M48,-60C60,-50,66,-33,68,-16C70,1,68,18,60,31C52,44,38,54,22,60C6,65,-12,67,-28,61C-44,55,-58,41,-65,24C-72,7,-72,-14,-64,-31C-56,-48,-40,-61,-23,-65C-7,-70,10,-67,27,-61C44,-55,36,-70,48,-60Z" transform="translate(100 100)" />
      </svg>

      {/* Header: asymmetric with photo overlay */}
      <div style={{ position: 'relative' }}>
        <div style={{
          backgroundColor: tpl.primaryColor,
          padding: '26px 32px 40px 28px',
          clipPath: 'polygon(0 0, 100% 0, 100% 70%, 80% 100%, 0 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: 60, width: 120, height: 90,
            borderRadius: '60% 40% 50% 70% / 50% 60% 40% 50%',
            backgroundColor: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
          }} />
          <div style={{ paddingRight: 90 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#FFF', letterSpacing: -0.8, lineHeight: 1.05 }}>{fullName}</div>
            {p.title && (
              <div style={{
                display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 600,
                color: '#FFF', backgroundColor: 'rgba(255,255,255,0.22)',
                borderRadius: 20, padding: '3px 12px',
              }}>{p.title}</div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 10 }}>
              {contacts.map(c => <ContactItem key={c.type} type={c.type} value={c.value} color="rgba(255,255,255,0.8)" />)}
            </div>
          </div>
        </div>

        {/* Floating photo — always shown */}
        <div style={{ position: 'absolute', top: 10, right: 16, zIndex: 10 }}>
          <div style={{
            width: 82, height: 82,
            borderRadius: tpl.photoShape === 'circle' ? '50%'
              : tpl.photoShape === 'organic' ? '42% 58% 42% 58%'
              : tpl.photoShape === 'arch' ? '999px 999px 0 0'
              : '50%',
            border: `3px solid ${tpl.bgColor}`,
            overflow: 'hidden',
            boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
          }}>
            {content.profilePhoto
              ? <img src={content.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: tpl.accentColor, fontSize: 28, fontWeight: 800, color: '#FFF' }}>
                  {(p.firstName || 'N')[0]}
                </div>
            }
          </div>
        </div>
      </div>

      {/* Summary pill */}
      {p.summary && (
        <div style={{ margin: '10px 16px 0', padding: '11px 16px', backgroundColor: hexAlpha(tpl.accentColor, '18'), borderRadius: 14, borderLeft: `3px solid ${tpl.accentColor}` }}>
          <p style={{ fontSize: 9.5, color: textSec, lineHeight: 1.7, margin: 0 }}>{p.summary}</p>
        </div>
      )}

      {/* Body: 2-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 8, padding: '10px 16px 16px' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {experiences.length > 0 && (
            <div style={{ backgroundColor: blockBg, borderRadius: 14, padding: '12px 14px', border: `1px solid ${hexAlpha(tpl.primaryColor, '10')}` }}>
              <SectionTitle color={tpl.accentColor}>Expériences</SectionTitle>
              {experiences.map((exp: any, i: number) => (
                <div key={exp.id} style={{ marginBottom: i < experiences.length - 1 ? 12 : 0, position: 'relative', paddingLeft: 14 }}>
                  <div style={{ position: 'absolute', left: 0, top: 4, width: 6, height: 6, borderRadius: '50%', backgroundColor: tpl.accentColor }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{exp.position}</div>
                    <span style={{ fontSize: 7.5, color: '#FFF', backgroundColor: hexAlpha(tpl.accentColor, 'CC'), borderRadius: 20, padding: '1.5px 7px', flexShrink: 0 }}>
                      {exp.startDate}{exp.current ? '→' : exp.endDate ? `→${exp.endDate}` : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: tpl.accentColor, fontWeight: 600 }}>{exp.company}</div>
                  {exp.description && <p style={{ fontSize: 9.5, color: textSec, lineHeight: 1.55, marginTop: 3 }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
          {educations.length > 0 && (
            <div style={{ backgroundColor: blockBg, borderRadius: 14, padding: '12px 14px', border: `1px solid ${hexAlpha(tpl.primaryColor, '10')}` }}>
              <SectionTitle color={tpl.accentColor}>Formation</SectionTitle>
              {educations.map((edu: any) => (
                <div key={edu.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: textPrimary }}>{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</div>
                  <div style={{ fontSize: 10, color: tpl.accentColor, fontWeight: 600 }}>{edu.institution}</div>
                  <div style={{ fontSize: 8.5, color: textSec }}>{edu.startDate}{edu.current ? ' → Présent' : edu.endDate ? ` → ${edu.endDate}` : ''}</div>
                </div>
              ))}
            </div>
          )}
          {customSections.map((cs: any) => (
            <div key={cs.id} style={{ backgroundColor: blockBg, borderRadius: 14, padding: '12px 14px' }}>
              <SectionTitle color={tpl.accentColor}>{cs.title}</SectionTitle>
              <p style={{ fontSize: 10, color: textSec, lineHeight: 1.7 }}>{cs.content}</p>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {skills.length > 0 && (
            <div style={{ backgroundColor: hexAlpha(tpl.primaryColor, '14'), borderRadius: 14, padding: '12px 14px', border: `1px solid ${hexAlpha(tpl.primaryColor, '18')}` }}>
              <SectionTitle color={tpl.accentColor}>Compétences</SectionTitle>
              {skills.map((sk: any) => (
                <div key={sk.id} style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: textPrimary }}>{sk.name}</span>
                  <ProgressBar pct={levelPercent(sk.level)} color={tpl.accentColor} bg={barBg} />
                </div>
              ))}
            </div>
          )}
          {languages.length > 0 && (
            <div style={{ backgroundColor: hexAlpha(tpl.accentColor, '14'), borderRadius: 14, padding: '12px 14px', border: `1px solid ${hexAlpha(tpl.accentColor, '18')}` }}>
              <SectionTitle color={tpl.accentColor}>Langues</SectionTitle>
              {languages.map((l: any) => (
                <div key={l.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: textPrimary }}>{l.name}</span>
                    <span style={{ fontSize: 8, color: textSec }}>{l.level}</span>
                  </div>
                  <DotRating pct={langLevelWidth[l.level] ?? '50%'} color={tpl.accentColor} bg={barBg} />
                </div>
              ))}
            </div>
          )}
          {content.portfolioPhotos && content.portfolioPhotos.length > 0 && (
            <div style={{ backgroundColor: blockBg, borderRadius: 14, padding: '12px 14px' }}>
              <SectionTitle color={tpl.accentColor}>Portfolio</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {content.portfolioPhotos.slice(0, 4).map((photo: string, i: number) => (
                  <img key={i} src={photo} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 8 }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${tpl.primaryColor}, ${tpl.accentColor})`, position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      {showWatermark && <Watermark />}
    </div>
  );
}

// ── EDITORIAL — Elite with fluid shapes ─────────────────────────────────────

function EditorialLayout({ tpl, content, textPrimary, textSec, barBg, dark, showWatermark }: any) {
  const { personalInfo: p, experiences, educations, skills, languages, customSections } = content;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Votre Nom';
  const contacts = [
    { type: 'email', value: p.email },
    { type: 'phone', value: p.phone },
    { type: 'address', value: p.address },
    { type: 'website', value: p.website },
    { type: 'linkedin', value: p.linkedin },
  ].filter(c => c.value);

  return (
    <div style={{ backgroundColor: tpl.bgColor, minHeight: '100%', position: 'relative', fontFamily: 'Inter, Arial, sans-serif', overflow: 'hidden' }}>

      {/* === Premium fluid organic background shapes === */}
      <svg viewBox="0 0 400 300" style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 240, pointerEvents: 'none', opacity: 0.14 }}>
        <path fill={tpl.primaryColor} d="M70,-90C86,-75,92,-50,92,-26C91,-2,84,21,71,40C59,59,41,73,20,81C-1,89,-25,91,-46,82C-67,74,-85,56,-91,34C-97,13,-91,-12,-79,-32C-67,-52,-49,-67,-29,-75C-10,-83,12,-83,34,-80C57,-77,54,-105,70,-90Z" transform="translate(200 150)" />
      </svg>

      {/* Oval accent shape */}
      <svg viewBox="0 0 250 150" style={{ position: 'absolute', bottom: 60, left: -40, width: 200, height: 120, pointerEvents: 'none', opacity: 0.1 }}>
        <ellipse cx="125" cy="75" rx="110" ry="60" fill={tpl.accentColor} />
      </svg>

      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: 30, left: 20, width: 60, height: 60,
        borderRadius: '50%', border: `2px solid ${hexAlpha(tpl.accentColor, '25')}`, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: 100, right: 40, width: 40, height: 40,
        borderRadius: '50%', backgroundColor: hexAlpha(tpl.accentColor, '15'), pointerEvents: 'none'
      }} />

      {/* Wide editorial header */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', position: 'relative' }}>
          {/* Left: name block */}
          <div style={{
            flex: 1, backgroundColor: tpl.primaryColor, padding: '24px 24px 20px',
            clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', bottom: -20, right: 20, width: 100, height: 80,
              borderRadius: '60% 40% 50% 70%', backgroundColor: 'rgba(255,255,255,0.08)', pointerEvents: 'none'
            }} />
            <div style={{ fontSize: 26, fontWeight: 900, color: '#FFF', lineHeight: 1.05, letterSpacing: -1 }}>{fullName}</div>
            {p.title && (
              <div style={{ marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,0.82)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5 }}>{p.title}</div>
            )}
            <div style={{ width: 36, height: 3, backgroundColor: tpl.accentColor, borderRadius: 2, marginTop: 10 }} />
            {/* Contacts in header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 10 }}>
              {contacts.map(c => <ContactItem key={c.type} type={c.type} value={c.value} color="rgba(255,255,255,0.75)" />)}
            </div>
          </div>

          {/* Right: photo */}
          <div style={{
            width: 120, backgroundColor: tpl.secondaryColor,
            padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 70, height: 70,
              borderRadius: tpl.photoShape === 'circle' ? '50%'
                : tpl.photoShape === 'organic' ? '42% 58% 42% 58%'
                : tpl.photoShape === 'square' ? '8px'
                : '50%',
              border: `3px solid ${hexAlpha(tpl.primaryColor, '60')}`,
              overflow: 'hidden',
              boxShadow: `0 4px 18px ${hexAlpha(tpl.primaryColor, '40')}`,
            }}>
              {content.profilePhoto
                ? <img src={content.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: hexAlpha(tpl.primaryColor, '30'), fontSize: 22, fontWeight: 800, color: tpl.primaryColor }}>
                    {(p.firstName || 'N')[0]}
                  </div>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Summary banner */}
      {p.summary && (
        <div style={{ backgroundColor: tpl.accentColor, padding: '8px 24px' }}>
          <p style={{ fontSize: 9.5, color: '#FFF', lineHeight: 1.65, margin: 0 }}>{p.summary}</p>
        </div>
      )}

      {/* Body: editorial grid */}
      <div style={{ padding: '14px 16px 24px', display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 12 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {experiences.length > 0 && (
            <div style={{ borderTop: `3px solid ${tpl.accentColor}`, paddingTop: 11 }}>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2.5, color: tpl.accentColor, marginBottom: 10 }}>Expériences professionnelles</div>
              {experiences.map((exp: any, i: number) => (
                <div key={exp.id} style={{ marginBottom: i < experiences.length - 1 ? 12 : 0, display: 'grid', gridTemplateColumns: '65px 1fr', gap: 10 }}>
                  <div style={{ fontSize: 8.5, color: textSec, lineHeight: 1.5, paddingTop: 2 }}>
                    {exp.startDate}<br />{exp.current ? 'Présent' : exp.endDate}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: textPrimary }}>{exp.position}</div>
                    <div style={{ fontSize: 10, color: tpl.accentColor, fontWeight: 700 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                    {exp.description && <p style={{ fontSize: 9.5, color: textSec, lineHeight: 1.6, marginTop: 3 }}>{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {educations.length > 0 && (
            <div style={{ borderTop: `2px solid ${hexAlpha(tpl.primaryColor, '25')}`, paddingTop: 11 }}>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2.5, color: tpl.primaryColor, marginBottom: 10 }}>Formation</div>
              {educations.map((edu: any, i: number) => (
                <div key={edu.id} style={{ marginBottom: i < educations.length - 1 ? 10 : 0, display: 'grid', gridTemplateColumns: '65px 1fr', gap: 10 }}>
                  <div style={{ fontSize: 8.5, color: textSec, lineHeight: 1.5, paddingTop: 2 }}>
                    {edu.startDate}<br />{edu.current ? 'Présent' : edu.endDate}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: textPrimary }}>{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</div>
                    <div style={{ fontSize: 10, color: tpl.accentColor, fontWeight: 700 }}>{edu.institution}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {customSections.map((cs: any) => (
            <div key={cs.id} style={{ borderTop: `2px solid ${hexAlpha(tpl.primaryColor, '20')}`, paddingTop: 11 }}>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2.5, color: tpl.primaryColor, marginBottom: 8 }}>{cs.title}</div>
              <p style={{ fontSize: 10, color: textSec, lineHeight: 1.7 }}>{cs.content}</p>
            </div>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {skills.length > 0 && (
            <div style={{ borderTop: `3px solid ${tpl.accentColor}`, paddingTop: 11 }}>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2.5, color: tpl.accentColor, marginBottom: 10 }}>Compétences</div>
              {skills.map((sk: any) => (
                <div key={sk.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: textPrimary }}>{sk.name}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: tpl.accentColor }}>{sk.level}/5</span>
                  </div>
                  <div style={{ height: 5, backgroundColor: barBg, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: levelPercent(sk.level), background: `linear-gradient(90deg, ${tpl.primaryColor}, ${tpl.accentColor})`, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {languages.length > 0 && (
            <div style={{ borderTop: `2px solid ${hexAlpha(tpl.primaryColor, '20')}`, paddingTop: 11 }}>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2.5, color: tpl.primaryColor, marginBottom: 10 }}>Langues</div>
              {languages.map((l: any) => (
                <div key={l.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: textPrimary, marginBottom: 3 }}>{l.name}</div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {Array.from({ length: 5 }, (_, i) => {
                      const filled = Math.round((parseFloat(langLevelWidth[l.level] ?? '50%') / 100) * 5);
                      return <div key={i} style={{ flex: 1, height: 5, backgroundColor: i < filled ? tpl.accentColor : barBg, borderRadius: 2 }} />;
                    })}
                  </div>
                  <div style={{ fontSize: 8, color: textSec, marginTop: 2 }}>{l.level}</div>
                </div>
              ))}
            </div>
          )}
          {content.portfolioPhotos && content.portfolioPhotos.length > 0 && (
            <div style={{ borderTop: `2px solid ${hexAlpha(tpl.primaryColor, '20')}`, paddingTop: 11 }}>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2.5, color: tpl.primaryColor, marginBottom: 8 }}>Portfolio</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {content.portfolioPhotos.slice(0, 4).map((photo: string, i: number) => (
                  <img key={i} src={photo} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 6 }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signature bottom bar */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${tpl.primaryColor}, ${tpl.accentColor}, ${tpl.primaryColor})`, position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      {showWatermark && <Watermark />}
    </div>
  );
}

// ── HERMINE LAYOUT — Réplique fidèle du CV Hermine Corine ─────────────────────
// Sidebar colorée (photo cercle · profil · langues dots · contacts)
// Zone principale (grand header nom · timeline éducation · compétences · expériences badges)

function HermineSidebarBg({ shape, color }: { shape?: string; color: string }) {
  const c = (a: string) => hexAlpha(color, a);
  if (shape === 'diagonals') return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.18 }} preserveAspectRatio="none">
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={-10 + i * 22} y1="0" x2={-10 + i * 22 + 60} y2="100%" stroke="white" strokeWidth="10" />
      ))}
    </svg>
  );
  if (shape === 'blobs') return (
    <svg viewBox="0 0 200 700" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="xMidYMid slice">
      <ellipse cx="170" cy="90" rx="90" ry="75" fill="rgba(255,255,255,0.10)" />
      <path d="M-20,350 Q60,280 120,380 Q180,480 30,520 Z" fill="rgba(255,255,255,0.08)" />
      <ellipse cx="40" cy="620" rx="70" ry="55" fill="rgba(255,255,255,0.07)" />
    </svg>
  );
  if (shape === 'triangles') return (
    <svg viewBox="0 0 200 700" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="xMidYMid slice">
      <polygon points="160,0 200,0 200,80" fill="rgba(255,255,255,0.12)" />
      <polygon points="0,180 70,120 80,220" fill="rgba(255,255,255,0.09)" />
      <polygon points="100,380 180,320 190,430" fill="rgba(255,255,255,0.08)" />
      <polygon points="0,550 90,510 60,620" fill="rgba(255,255,255,0.10)" />
      <polygon points="140,650 200,620 200,700" fill="rgba(255,255,255,0.09)" />
    </svg>
  );
  if (shape === 'hexagons') return (
    <svg viewBox="0 0 200 700" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="xMidYMid slice">
      {[{cx:150,cy:60},{cx:30,cy:180},{cx:160,cy:300},{cx:50,cy:440},{cx:155,cy:580}].map((h,i)=>(
        <polygon key={i} points={`${h.cx},${h.cy-28} ${h.cx+24},${h.cy-14} ${h.cx+24},${h.cy+14} ${h.cx},${h.cy+28} ${h.cx-24},${h.cy+14} ${h.cx-24},${h.cy-14}`}
          fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      ))}
      <polygon points="100,650 124,636 124,608 100,594 76,608 76,636" fill="rgba(255,255,255,0.10)" />
    </svg>
  );
  // Default: circles (original Hermine)
  return (
    <>
      <div style={{ position: 'absolute', top: -50, right: -50, width: 140, height: 140, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.09)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 80, left: -40, width: 100, height: 100, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 120, right: -30, width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -40, left: 10, width: 90, height: 90, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
    </>
  );
}

function HermineLayout({ tpl, content, textPrimary, textSec, showWatermark }: any) {
  const { personalInfo: p, experiences, educations, skills, languages, customSections } = content;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Votre Nom';
  const contacts = [
    { type: 'phone', value: p.phone },
    { type: 'email', value: p.email },
    { type: 'address', value: p.address },
    { type: 'website', value: p.website },
    { type: 'linkedin', value: p.linkedin },
  ].filter(c => c.value);

  const sidebarBg = tpl.primaryColor;
  const accent = tpl.accentColor;
  const isSerif = tpl.fontFamily === 'font-serif';
  const fontStack = isSerif ? 'Georgia, "Times New Roman", serif' : 'Inter, Arial, sans-serif';

  // Séparer prénom / nom pour l'affichage Hermine (nom EN MAJUSCULES, prénom normal)
  const lastName = (p.lastName || '').toUpperCase() || 'NOM';
  const firstName = p.firstName || 'Prénom';

  return (
    <div style={{ backgroundColor: tpl.bgColor, minHeight: '100%', display: 'flex', fontFamily: fontStack, position: 'relative' }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width: '32%', minHeight: '100%', backgroundColor: sidebarBg, padding: '28px 14px 24px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden' }}>
        <HermineSidebarBg shape={tpl.sidebarShape} color={sidebarBg} />

        {/* Photo */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: 86, height: 86, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.5)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            {content.profilePhoto
              ? <img src={content.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)', fontSize: 30, fontWeight: 800, color: '#FFF' }}>
                  {(p.firstName || 'N')[0]}
                </div>
            }
          </div>
        </div>

        {/* Profil */}
        {p.summary && (
          <div style={{ position: 'relative' }}>
            <div style={{ backgroundColor: accent, borderRadius: 4, padding: '3px 8px', marginBottom: 8, display: 'inline-block' }}>
              <span style={{ fontSize: 7.5, fontWeight: 800, color: '#FFF', textTransform: 'uppercase', letterSpacing: 2 }}>Profil</span>
            </div>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, margin: 0 }}>{p.summary}</p>
          </div>
        )}

        {/* Langues — points comme Hermine */}
        {languages.length > 0 && (
          <div style={{ position: 'relative' }}>
            <div style={{ backgroundColor: accent, borderRadius: 4, padding: '3px 8px', marginBottom: 8, display: 'inline-block' }}>
              <span style={{ fontSize: 7.5, fontWeight: 800, color: '#FFF', textTransform: 'uppercase', letterSpacing: 2 }}>Langues</span>
            </div>
            {languages.map((l: any) => {
              const filled = Math.round((parseFloat(langLevelWidth[l.level] ?? '50%') / 100) * 5);
              return (
                <div key={l.id} style={{ marginBottom: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 600, color: '#FFF' }}>{l.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: i < filled ? '#FFF' : 'rgba(255,255,255,0.25)' }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loisirs / Qualités depuis customSections ou compétences */}
        {skills.length > 0 && (
          <div style={{ position: 'relative' }}>
            <div style={{ backgroundColor: accent, borderRadius: 4, padding: '3px 8px', marginBottom: 8, display: 'inline-block' }}>
              <span style={{ fontSize: 7.5, fontWeight: 800, color: '#FFF', textTransform: 'uppercase', letterSpacing: 2 }}>Qualités</span>
            </div>
            {skills.slice(0, 6).map((sk: any) => (
              <div key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)' }}>{sk.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Contacts */}
        {contacts.length > 0 && (
          <div style={{ position: 'relative', marginTop: 'auto' }}>
            <div style={{ backgroundColor: accent, borderRadius: 4, padding: '3px 8px', marginBottom: 8, display: 'inline-block' }}>
              <span style={{ fontSize: 7.5, fontWeight: 800, color: '#FFF', textTransform: 'uppercase', letterSpacing: 2 }}>Contacts</span>
            </div>
            {contacts.map(c => <ContactItem key={c.type} type={c.type} value={c.value} color="rgba(255,255,255,0.8)" size={8.5} />)}
          </div>
        )}
      </div>

      {/* ── ZONE PRINCIPALE ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header Hermine : grand nom + séparateur + titre */}
        <div style={{ padding: '28px 22px 16px', borderBottom: `2px solid ${hexAlpha(accent, '30')}` }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: tpl.primaryColor, letterSpacing: 0.5, lineHeight: 1.1 }}>
            {lastName}
          </div>
          <div style={{ fontSize: 16, fontWeight: 400, color: tpl.primaryColor, letterSpacing: 0.5, marginTop: 2 }}>
            {firstName}
          </div>
          {p.dateOfBirth && (
            <div style={{ fontSize: 8.5, color: textSec, marginTop: 3, fontStyle: 'italic' }}>Né(e) le {p.dateOfBirth}</div>
          )}
          <div style={{ width: '100%', height: 1, backgroundColor: hexAlpha(accent, '40'), margin: '8px 0' }} />
          {p.title && (
            <div style={{ fontSize: 9.5, color: textSec, lineHeight: 1.4 }}>{p.title}</div>
          )}
        </div>

        <div style={{ flex: 1, padding: '14px 22px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Éducation — timeline avec cercles comme Hermine */}
          {educations.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: textPrimary }}>Éducation</span>
                <div style={{ flex: 1, height: 1, backgroundColor: hexAlpha(accent, '30') }} />
              </div>
              {educations.map((edu: any) => (
                <div key={edu.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid ${accent}`, backgroundColor: '#FFF', marginTop: 3 }} />
                    <div style={{ width: 1, flex: 1, backgroundColor: hexAlpha(accent, '30'), marginTop: 2 }} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: textPrimary }}>{edu.degree}{edu.field ? ` – ${edu.field}` : ''}</span>
                      <span style={{ fontSize: 8, color: accent, fontWeight: 700 }}>
                        {edu.startDate && edu.endDate ? `${edu.startDate}-${edu.endDate.slice(-2)}` : edu.startDate || edu.endDate || ''}
                      </span>
                    </div>
                    <div style={{ fontSize: 8.5, color: textSec, fontStyle: 'italic', marginTop: 1 }}>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compétences — grille 2 colonnes avec titres de catégories */}
          {skills.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: textPrimary }}>Compétences</span>
                <div style={{ flex: 1, height: 1, backgroundColor: hexAlpha(accent, '30') }} />
              </div>
              {/* Regroupe par catégorie si disponible */}
              {(() => {
                const cats: Record<string, string[]> = {};
                skills.forEach((sk: any) => {
                  const cat = sk.category || 'Compétences';
                  if (!cats[cat]) cats[cat] = [];
                  cats[cat].push(sk.name);
                });
                const entries = Object.entries(cats);
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: entries.length >= 3 ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0 10px' }}>
                    {entries.map(([cat, items]) => (
                      <div key={cat}>
                        <div style={{ backgroundColor: accent, padding: '2px 6px', borderRadius: 3, marginBottom: 5, textAlign: 'center' }}>
                          <span style={{ fontSize: 7.5, fontWeight: 700, color: '#FFF' }}>{cat}</span>
                        </div>
                        {items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
                            <span style={{ fontSize: 8.5, color: textSec }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Expériences — badges date comme Hermine */}
          {experiences.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: textPrimary }}>Expérience Professionnelle</span>
                <div style={{ flex: 1, height: 1, backgroundColor: hexAlpha(accent, '30') }} />
              </div>
              {experiences.map((exp: any) => (
                <div key={exp.id} style={{ marginBottom: 12, backgroundColor: hexAlpha(accent, '08'), borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: accent, color: '#FFF', fontSize: 7.5, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>
                      {exp.startDate}{exp.startDate && (exp.current ? ' – Présent' : exp.endDate ? ` – ${exp.endDate}` : '')}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: textPrimary }}>{exp.position}</span>
                  </div>
                  <div style={{ fontSize: 9, color: accent, fontStyle: 'italic', marginBottom: 3 }}>
                    {exp.company}{exp.location ? ` – ${exp.location}` : ''}
                  </div>
                  {exp.description && (
                    <div style={{ fontSize: 8.5, color: textSec, lineHeight: 1.55 }}>
                      {exp.description.split('\n').filter(Boolean).map((line: string, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 2 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accent, flexShrink: 0, marginTop: 3 }} />
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sections personnalisées */}
          {customSections.map((cs: any) => (
            <div key={cs.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: accent }} />
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: textPrimary }}>{cs.title}</span>
                <div style={{ flex: 1, height: 1, backgroundColor: hexAlpha(accent, '30') }} />
              </div>
              <p style={{ fontSize: 9.5, color: textSec, lineHeight: 1.65 }}>{cs.content}</p>
            </div>
          ))}
        </div>
      </div>

      {showWatermark && <Watermark />}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function CVRenderer({ template: tpl, content, showWatermark = false }: CVRendererProps) {
  const dark = isDarkBg(tpl.bgColor);
  const textPrimary = dark ? '#F1F5F9' : '#111827';
  const textSec = dark ? '#94A3B8' : '#64748B';
  const barBg = dark ? '#334155' : '#E2E8F0';

  const sharedProps = { tpl, content, textPrimary, textSec, barBg, dark, showWatermark };

  if (tpl.layout === 'single') return <SingleLayout {...sharedProps} />;
  if (tpl.layout === 'two-col') return <TwoColLayout {...sharedProps} />;
  if (tpl.layout === 'sidebar-left') return <SidebarLeftLayout {...sharedProps} />;
  if (tpl.layout === 'sidebar-right') return <SidebarRightLayout {...sharedProps} />;
  if (tpl.layout === 'asymmetric') return <AsymmetricLayout {...sharedProps} />;
  if (tpl.layout === 'hermine') return <HermineLayout {...sharedProps} />;
  return <EditorialLayout {...sharedProps} />;
}
