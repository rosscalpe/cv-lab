import { type TemplateProps, DEFAULT_LABELS, dateRange } from './shared'

const DEFAULT_ACCENT = '#e07b3a'

export function CreativeFlow({ data, labels = DEFAULT_LABELS, accentColor }: TemplateProps) {
  const ACCENT = accentColor ?? DEFAULT_ACCENT
  const { profile, experiences, educations, skills, languages, certifications, projects } = data
  const p = labels.present ?? DEFAULT_LABELS.present

  const contacts = [
    profile?.phone        && { icon: '☎', text: profile.phone },
    profile?.email        && { icon: '✉', text: profile.email },
    profile?.linkedin_url && { icon: 'in', text: profile.linkedin_url },
    (profile?.city || profile?.country) && { icon: '⌖', text: [profile?.city, profile?.country].filter(Boolean).join(', ') },
    profile?.portfolio_url && { icon: '⎋', text: profile.portfolio_url },
  ].filter(Boolean) as { icon: string; text: string }[]

  return (
    <div style={{ position: 'relative', fontFamily: 'Inter, system-ui, sans-serif', width: '794px', minHeight: '1123px', background: '#fff', boxSizing: 'border-box' as const, color: '#2d2d2d', overflow: 'hidden' }}>

      {/* ── Blobs decorativos ── */}
      <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '170px', height: '170px', borderRadius: '50%', background: '#f2c4ca', opacity: 0.75 }} />
      <div style={{ position: 'absolute', top: '-35px', right: '-35px', width: '145px', height: '145px', borderRadius: '50%', background: '#a8c8dc', opacity: 0.7 }} />
      <div style={{ position: 'absolute', bottom: '-45px', left: '-25px', width: '130px', height: '130px', borderRadius: '50%', background: '#c8956c', opacity: 0.55 }} />

      {/* ── Header ── */}
      <div style={{ padding: '52px 56px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '44px', fontWeight: 800, margin: 0, lineHeight: 1.1, color: '#1a1a1a', letterSpacing: '-1px' }}>
            {profile?.first_name}<br />{profile?.last_name}
          </h1>
          {profile?.headline && (
            <p style={{ fontSize: '15px', color: ACCENT, fontWeight: 600, margin: '12px 0 0' }}>
              {profile.headline}
            </p>
          )}
        </div>
        {profile?.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photo_url}
            alt=""
            style={{ width: '120px', height: '145px', objectFit: 'cover', borderRadius: '14px', flexShrink: 0, marginLeft: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
          />
        )}
      </div>

      {/* ── Divisor ── */}
      <div style={{ height: '1px', background: '#e5e7eb', margin: '0 56px 28px' }} />

      {/* ── Cuerpo: 2 columnas ── */}
      <div style={{ display: 'flex', padding: '0 40px 56px' }}>

        {/* Columna izquierda */}
        <div style={{ width: '232px', flexShrink: 0, paddingRight: '28px' }}>

          {profile?.summary && (
            <LeftSection title={labels.summary} accent={ACCENT}>
              <p style={{ fontSize: '12px', lineHeight: 1.75, color: '#4b5563', margin: 0 }}>{profile.summary}</p>
            </LeftSection>
          )}

          {languages.length > 0 && (
            <LeftSection title={labels.languages} accent={ACCENT}>
              <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.9, margin: 0 }}>
                {languages.map((l) => l.language + (l.level ? ` | ${l.level}` : '')).join('\n')}
              </p>
            </LeftSection>
          )}

          {skills.length > 0 && (
            <LeftSection title={labels.skills} accent={ACCENT}>
              <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: 1.9, margin: 0 }}>
                {skills.map((s) => s.name).join(' | ')}
              </p>
            </LeftSection>
          )}

          {contacts.length > 0 && (
            <LeftSection title="Contacto" accent={ACCENT}>
              {contacts.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '7px' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '9px', color: '#fff', fontWeight: 700 }}>
                    {c.icon}
                  </span>
                  <span style={{ fontSize: '11px', color: '#4b5563', wordBreak: 'break-word' as const, lineHeight: 1.5 }}>{c.text}</span>
                </div>
              ))}
            </LeftSection>
          )}
        </div>

        {/* Divisor vertical */}
        <div style={{ width: '1px', background: '#e5e7eb', flexShrink: 0 }} />

        {/* Columna derecha */}
        <div style={{ flex: 1, paddingLeft: '28px' }}>

          {educations.length > 0 && (
            <RightSection title={labels.education} accent={ACCENT}>
              {educations.map((edu) => (
                <div key={edu.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{edu.institution}</span>
                    {(edu.start_year || edu.end_year) && (
                      <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' as const }}>{edu.start_year} - {edu.end_year ?? p}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#6b7280', margin: '2px 0 0' }}>{edu.degree}</p>
                </div>
              ))}
            </RightSection>
          )}

          {experiences.length > 0 && (
            <RightSection title={labels.experience} accent={ACCENT}>
              {experiences.map((exp) => (
                <div key={exp.id} style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{exp.role}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                    <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#6b7280', margin: 0 }}>{exp.company}</p>
                    <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' as const }}>
                      {dateRange(exp.start_date, exp.end_date, exp.is_current, p)}
                    </span>
                  </div>
                  {exp.description && (
                    <p style={{ fontSize: '12px', color: '#4b5563', margin: '6px 0 0', lineHeight: 1.65 }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </RightSection>
          )}

          {certifications.length > 0 && (
            <RightSection title={labels.certifications} accent={ACCENT}>
              {certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{c.name}</span>
                  {c.issuer && <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '6px' }}>{c.issuer}</span>}
                  {c.year && <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '6px' }}>{c.year}</span>}
                </div>
              ))}
            </RightSection>
          )}

          {projects.length > 0 && (
            <RightSection title={labels.projects} accent={ACCENT}>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{proj.name}</span>
                  {proj.url && <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '8px' }}>{proj.url}</span>}
                  {proj.description && <p style={{ fontSize: '12px', color: '#4b5563', margin: '4px 0 0', lineHeight: 1.65 }}>{proj.description}</p>}
                </div>
              ))}
            </RightSection>
          )}
        </div>
      </div>
    </div>
  )
}

function LeftSection({ title, accent, children }: { title?: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: accent, marginBottom: '8px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function RightSection({ title, accent, children }: { title?: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontSize: '16px', fontWeight: 700, color: accent, borderBottom: '1.5px solid #f3f4f6', paddingBottom: '6px', marginBottom: '14px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}
