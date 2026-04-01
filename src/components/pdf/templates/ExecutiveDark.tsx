import { type TemplateProps, DEFAULT_LABELS, dateRange } from './shared'

const DARK = '#0f172a'
const DEFAULT_ACCENT = '#b45309'
const GOLD_LIGHT = '#fef3c7'

export function ExecutiveDark({ data, labels = DEFAULT_LABELS, accentColor }: TemplateProps) {
  const GOLD = accentColor ?? DEFAULT_ACCENT
  const { profile, experiences, educations, skills, languages, certifications, projects } = data
  const p = labels.present ?? DEFAULT_LABELS.present

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', width: '794px', minHeight: '1123px', background: '#fff', boxSizing: 'border-box' as const, color: DARK }}>
      {/* Header oscuro */}
      <div style={{ background: DARK, color: '#fff', padding: '44px 56px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            {profile?.first_name} {profile?.last_name}
          </h1>
          {profile?.headline && (
            <p style={{ fontSize: '14px', color: GOLD_LIGHT, margin: '6px 0 16px', fontWeight: 500 }}>
              {profile.headline}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px 20px', fontSize: '12px', color: '#94a3b8' }}>
            {[profile?.email, profile?.phone, [profile?.city, profile?.country].filter(Boolean).join(', '), profile?.linkedin_url, profile?.portfolio_url].filter(Boolean).map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        </div>
        {profile?.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.photo_url} alt="" style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${GOLD}`, flexShrink: 0 }} />
        )}
      </div>

      {/* Franja de acento */}
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)` }} />

      {/* Cuerpo */}
      <div style={{ display: 'flex', minHeight: '900px' }}>
        {/* Main (izquierda) */}
        <div style={{ flex: 1, padding: '36px 40px 36px 56px' }}>
          {profile?.summary && (
            <Section title={labels.summary} accent={GOLD}>
              <p style={{ fontSize: '13px', lineHeight: 1.75, color: '#334155', margin: 0 }}>{profile.summary}</p>
            </Section>
          )}

          {experiences.length > 0 && (
            <Section title={labels.experience} accent={GOLD}>
              {experiences.map((exp) => (
                <div key={exp.id} style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>{exp.company}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' as const }}>
                      {dateRange(exp.start_date, exp.end_date, exp.is_current, p)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: GOLD, fontWeight: 600, margin: '2px 0 0' }}>{exp.role}</p>
                  {exp.description && <p style={{ fontSize: '12px', color: '#475569', margin: '6px 0 0', lineHeight: 1.65 }}>{exp.description}</p>}
                </div>
              ))}
            </Section>
          )}

          {educations.length > 0 && (
            <Section title={labels.education} accent={GOLD}>
              {educations.map((edu) => (
                <div key={edu.id} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>{edu.institution}</span>
                    {(edu.start_year || edu.end_year) && (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{edu.start_year} – {edu.end_year}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: GOLD, fontWeight: 500, margin: '2px 0 0' }}>{edu.degree}</p>
                </div>
              ))}
            </Section>
          )}

          {projects.length > 0 && (
            <Section title={labels.projects} accent={GOLD}>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{proj.name}</span>
                  {proj.url && <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>{proj.url}</span>}
                  {proj.description && <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0', lineHeight: 1.6 }}>{proj.description}</p>}
                </div>
              ))}
            </Section>
          )}
        </div>

        {/* Sidebar (derecha) */}
        <div style={{ width: '210px', background: '#f8fafc', borderLeft: `3px solid ${GOLD_LIGHT}`, padding: '36px 24px', flexShrink: 0 }}>
          {skills.length > 0 && (
            <SideSection title={labels.skills}>
              {skills.map((s) => (
                <div key={s.id} style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  {s.name}
                </div>
              ))}
            </SideSection>
          )}

          {languages.length > 0 && (
            <SideSection title={labels.languages}>
              {languages.map((l) => (
                <div key={l.id} style={{ fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{l.language}</span>
                  {l.level && <span style={{ fontWeight: 700, color: GOLD, fontSize: '11px' }}>{l.level}</span>}
                </div>
              ))}
            </SideSection>
          )}

          {certifications.length > 0 && (
            <SideSection title={labels.certifications}>
              {certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{c.name}</div>
                  {c.issuer && <div style={{ fontSize: '11px', color: '#64748b' }}>{c.issuer}</div>}
                  {c.year && <div style={{ fontSize: '11px', color: GOLD }}>{c.year}</div>}
                </div>
              ))}
            </SideSection>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, accent, children }: { title?: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '26px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: accent, borderBottom: `2px solid ${GOLD_LIGHT}`, paddingBottom: '5px', marginBottom: '14px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function SideSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, color: DARK, borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '10px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}
