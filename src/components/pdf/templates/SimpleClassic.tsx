import { type TemplateProps, DEFAULT_LABELS, dateRange } from './shared'

const DEFAULT_ACCENT = '#0d9488'

export function SimpleClassic({ data, labels = DEFAULT_LABELS, accentColor }: TemplateProps) {
  const accent = accentColor ?? DEFAULT_ACCENT
  const { profile, experiences, educations, skills, languages, certifications, projects } = data
  const p = labels.present ?? DEFAULT_LABELS.present

  return (
    <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', width: '794px', minHeight: '1123px', padding: '64px 72px', background: '#fefefe', color: '#1c1917', boxSizing: 'border-box' as const }}>
      {/* Header centrado */}
      <div style={{ textAlign: 'center', borderBottom: `2px solid ${accent}`, paddingBottom: '18px', marginBottom: '24px' }}>
        {profile?.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photo_url}
            alt=""
            style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 12px', border: `3px solid ${accent}` }}
          />
        )}
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '0.5px' }}>
          {profile?.first_name?.toUpperCase()} {profile?.last_name?.toUpperCase()}
        </h1>
        {profile?.headline && (
          <p style={{ fontSize: '13px', margin: '6px 0 0', color: '#57534e', fontStyle: 'italic' }}>
            {profile.headline}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, gap: '4px 12px', marginTop: '10px', fontSize: '12px', color: '#78716c' }}>
          {[profile?.email, profile?.phone, [profile?.city, profile?.country].filter(Boolean).join(', '), profile?.linkedin_url].filter(Boolean).map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>

      {profile?.summary && (
        <Section title={labels.summary} accent={accent}>
          <p style={{ fontSize: '13px', lineHeight: 1.75, margin: 0, textAlign: 'justify' as const }}>{profile.summary}</p>
        </Section>
      )}

      {experiences.length > 0 && (
        <Section title={labels.experience} accent={accent}>
          {experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{exp.role}</span>
                <span style={{ fontSize: '12px', color: '#78716c', fontStyle: 'italic' }}>
                  {dateRange(exp.start_date, exp.end_date, exp.is_current, p)}
                </span>
              </div>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#57534e', margin: '2px 0 0' }}>{exp.company}</p>
              {exp.description && <p style={{ fontSize: '13px', margin: '6px 0 0', lineHeight: 1.6 }}>{exp.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {educations.length > 0 && (
        <Section title={labels.education} accent={accent}>
          {educations.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{edu.degree}</span>
                {(edu.start_year || edu.end_year) && (
                  <span style={{ fontSize: '12px', color: '#78716c', fontStyle: 'italic' }}>{edu.start_year} – {edu.end_year}</span>
                )}
              </div>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#57534e', margin: '2px 0 0' }}>{edu.institution}</p>
            </div>
          ))}
        </Section>
      )}

      {(skills.length > 0 || languages.length > 0) && (
        <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
          {skills.length > 0 && (
            <div style={{ flex: 1 }}>
              <SectionTitle accent={accent}>{labels.skills}</SectionTitle>
              <p style={{ fontSize: '13px', lineHeight: 1.8, margin: 0 }}>
                {skills.map(s => s.name).join(' · ')}
              </p>
            </div>
          )}
          {languages.length > 0 && (
            <div style={{ flex: 1 }}>
              <SectionTitle accent={accent}>{labels.languages}</SectionTitle>
              {languages.map((l) => (
                <p key={l.id} style={{ fontSize: '13px', margin: '0 0 4px' }}>
                  {l.language}{l.level && ` — ${l.level}`}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {certifications.length > 0 && (
        <Section title={labels.certifications} accent={accent}>
          {certifications.map((c) => (
            <p key={c.id} style={{ fontSize: '13px', margin: '0 0 6px' }}>
              <strong>{c.name}</strong>
              {c.issuer && `, ${c.issuer}`}
              {c.year && ` (${c.year})`}
            </p>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title={labels.projects} accent={accent}>
          {projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>{proj.name}</span>
              {proj.url && <span style={{ fontSize: '12px', color: '#78716c', marginLeft: '8px', fontStyle: 'italic' }}>{proj.url}</span>}
              {proj.description && <p style={{ fontSize: '13px', margin: '4px 0 0', lineHeight: 1.6 }}>{proj.description}</p>}
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function SectionTitle({ children, accent }: { children?: string; accent: string }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const, borderBottom: `1.5px solid ${accent}`, paddingBottom: '4px', marginBottom: '10px', color: accent }}>
      {children}
    </div>
  )
}

function Section({ title, accent, children }: { title?: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <SectionTitle accent={accent}>{title}</SectionTitle>
      {children}
    </div>
  )
}
