import { type TemplateProps, DEFAULT_LABELS, dateRange } from './shared'

const DEFAULT_ACCENT = '#1d4ed8'

export function ModernBlue({ data, labels = DEFAULT_LABELS, accentColor }: TemplateProps) {
  const BLUE = accentColor ?? DEFAULT_ACCENT
  const BLUE_LIGHT = '#f0f4ff'
  const BLUE_MID = '#d0daf8'
  const { profile, experiences, educations, skills, languages, certifications, projects } = data
  const p = labels.present ?? DEFAULT_LABELS.present

  const contacts = [
    profile?.email && { icon: '✉', text: profile.email },
    profile?.phone && { icon: '☎', text: profile.phone },
    (profile?.city || profile?.country) && {
      icon: '⌖',
      text: [profile?.city, profile?.country].filter(Boolean).join(', '),
    },
    profile?.linkedin_url && { icon: 'in', text: profile.linkedin_url },
    profile?.portfolio_url && { icon: '⎋', text: profile.portfolio_url },
  ].filter(Boolean) as { icon: string; text: string }[]

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', width: '794px', minHeight: '1123px', background: '#fff', boxSizing: 'border-box' as const, color: '#111827' }}>
      {/* Header azul */}
      <div style={{ background: BLUE, color: '#fff', padding: '40px 56px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            {profile?.first_name} {profile?.last_name}
          </h1>
          {profile?.headline && (
            <p style={{ fontSize: '15px', margin: '6px 0 0', opacity: 0.85, fontWeight: 500 }}>
              {profile.headline}
            </p>
          )}
        </div>
        {profile?.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.photo_url} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0 }} />
        )}
      </div>

      {/* Barra de contacto */}
      {contacts.length > 0 && (
        <div style={{ background: BLUE_LIGHT, borderBottom: `2px solid ${BLUE_MID}`, padding: '10px 56px', display: 'flex', flexWrap: 'wrap' as const, gap: '4px 24px' }}>
          {contacts.map((c, i) => (
            <span key={i} style={{ fontSize: '12px', color: BLUE, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontWeight: 700 }}>{c.icon}</span>
              <span>{c.text}</span>
            </span>
          ))}
        </div>
      )}

      {/* Cuerpo: sidebar + main */}
      <div style={{ display: 'flex', minHeight: '900px' }}>
        {/* Sidebar */}
        <div style={{ width: '220px', background: '#f8fafc', padding: '32px 24px', borderRight: '1px solid #e2e8f0', flexShrink: 0 }}>
          {skills.length > 0 && (
            <SideSection accent={BLUE} title={labels.skills}>
              {skills.map((s) => (
                <div key={s.id} style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{s.name}</div>
                  {s.level && <div style={{ fontSize: '11px', color: '#64748b' }}>{s.level}</div>}
                </div>
              ))}
            </SideSection>
          )}

          {languages.length > 0 && (
            <SideSection accent={BLUE} title={labels.languages}>
              {languages.map((l) => (
                <div key={l.id} style={{ fontSize: '13px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{l.language}</span>
                  {l.level && <span style={{ fontWeight: 700, color: BLUE, fontSize: '11px' }}>{l.level}</span>}
                </div>
              ))}
            </SideSection>
          )}

          {certifications.length > 0 && (
            <SideSection accent={BLUE} title={labels.certifications}>
              {certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{c.name}</div>
                  {c.issuer && <div style={{ fontSize: '11px', color: '#64748b' }}>{c.issuer}</div>}
                  {c.year && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.year}</div>}
                </div>
              ))}
            </SideSection>
          )}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '32px 40px' }}>
          {profile?.summary && (
            <MainSection title={labels.summary} accent={BLUE}>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#374151', margin: 0 }}>{profile.summary}</p>
            </MainSection>
          )}

          {experiences.length > 0 && (
            <MainSection title={labels.experience} accent={BLUE}>
              {experiences.map((exp) => (
                <div key={exp.id} style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>{exp.company}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' as const }}>
                      {dateRange(exp.start_date, exp.end_date, exp.is_current, p)}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: BLUE, fontWeight: 500, margin: '2px 0 0' }}>{exp.role}</p>
                  {exp.description && (
                    <p style={{ fontSize: '12px', color: '#475569', margin: '6px 0 0', lineHeight: 1.6 }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </MainSection>
          )}

          {educations.length > 0 && (
            <MainSection title={labels.education} accent={BLUE}>
              {educations.map((edu) => (
                <div key={edu.id} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>{edu.institution}</span>
                    {(edu.start_year || edu.end_year) && (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{edu.start_year} – {edu.end_year}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: BLUE, fontWeight: 500, margin: '2px 0 0' }}>{edu.degree}</p>
                </div>
              ))}
            </MainSection>
          )}

          {projects.length > 0 && (
            <MainSection title={labels.projects} accent={BLUE}>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{proj.name}</span>
                  {proj.url && <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>{proj.url}</span>}
                  {proj.description && (
                    <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0', lineHeight: 1.6 }}>{proj.description}</p>
                  )}
                </div>
              ))}
            </MainSection>
          )}
        </div>
      </div>
    </div>
  )
}

function SideSection({ title, accent, children }: { title?: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, color: accent, borderBottom: `1.5px solid ${accent}40`, paddingBottom: '4px', marginBottom: '10px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function MainSection({ title, accent, children }: { title?: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.8px', color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: '4px', marginBottom: '14px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}
