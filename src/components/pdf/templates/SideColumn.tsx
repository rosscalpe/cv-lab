import { type TemplateProps, DEFAULT_LABELS, dateRange } from './shared'

const DEFAULT_ACCENT = '#374151'

export function SideColumn({ data, labels = DEFAULT_LABELS, accentColor }: TemplateProps) {
  const accent = accentColor ?? DEFAULT_ACCENT
  const { profile, experiences, educations, skills, languages, certifications, projects } = data
  const p = labels.present ?? DEFAULT_LABELS.present

  const contacts = [
    profile?.email && ['✉', profile.email],
    profile?.phone && ['☎', profile.phone],
    (profile?.city || profile?.country) && ['⌖', [profile?.city, profile?.country].filter(Boolean).join(', ')],
    profile?.linkedin_url && ['in', profile.linkedin_url],
    profile?.portfolio_url && ['⎋', profile.portfolio_url],
  ].filter(Boolean) as [string, string][]

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', width: '794px', minHeight: '1123px', background: '#fff', boxSizing: 'border-box' as const, color: '#1c1917', display: 'flex' }}>
      {/* ── Sidebar izquierdo ── */}
      <div style={{ width: '230px', background: '#f5f5f4', padding: '40px 22px', flexShrink: 0 }}>
        {profile?.photo_url && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.photo_url} alt="" style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #d6d3d1' }} />
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.25 }}>
            {profile?.first_name}<br />{profile?.last_name}
          </div>
          {profile?.headline && (
            <div style={{ fontSize: '11px', color: '#78716c', marginTop: '5px', fontStyle: 'italic' }}>
              {profile.headline}
            </div>
          )}
        </div>

        {contacts.length > 0 && (
          <SideSection accent={accent} title="Contacto">
            {contacts.map(([icon, text], i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '7px', fontSize: '11px', color: '#44403c' }}>
                <span style={{ flexShrink: 0, width: '14px', textAlign: 'center', color: '#78716c', fontWeight: 700 }}>{icon}</span>
                <span style={{ wordBreak: 'break-word' as const }}>{text}</span>
              </div>
            ))}
          </SideSection>
        )}

        {skills.length > 0 && (
          <SideSection accent={accent} title={labels.skills}>
            {skills.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#292524' }}>{s.name}</span>
                {s.level && <span style={{ fontSize: '10px', color: '#a8a29e' }}>{s.level}</span>}
              </div>
            ))}
          </SideSection>
        )}

        {languages.length > 0 && (
          <SideSection accent={accent} title={labels.languages}>
            {languages.map((l) => (
              <div key={l.id} style={{ marginBottom: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#292524' }}>{l.language}</div>
                {l.level && <div style={{ fontSize: '11px', color: '#78716c' }}>{l.level}</div>}
              </div>
            ))}
          </SideSection>
        )}

        {certifications.length > 0 && (
          <SideSection accent={accent} title={labels.certifications}>
            {certifications.map((c) => (
              <div key={c.id} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#292524' }}>{c.name}</div>
                {c.issuer && <div style={{ fontSize: '11px', color: '#78716c' }}>{c.issuer}</div>}
                {c.year && <div style={{ fontSize: '11px', color: '#a8a29e' }}>{c.year}</div>}
              </div>
            ))}
          </SideSection>
        )}
      </div>

      {/* ── Contenido principal ── */}
      <div style={{ flex: 1, padding: '40px 40px 40px 32px' }}>
        {profile?.summary && (
          <MainSection accent={accent} title={labels.summary}>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#44403c', margin: 0 }}>{profile.summary}</p>
          </MainSection>
        )}

        {experiences.length > 0 && (
          <MainSection accent={accent} title={labels.experience}>
            {experiences.map((exp) => (
              <div key={exp.id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{exp.role}</span>
                  <span style={{ fontSize: '11px', color: '#a8a29e', whiteSpace: 'nowrap' as const }}>
                    {dateRange(exp.start_date, exp.end_date, exp.is_current, p)}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#78716c', fontStyle: 'italic', margin: '2px 0 0' }}>{exp.company}</p>
                {exp.description && <p style={{ fontSize: '12px', color: '#44403c', margin: '6px 0 0', lineHeight: 1.65 }}>{exp.description}</p>}
              </div>
            ))}
          </MainSection>
        )}

        {educations.length > 0 && (
          <MainSection accent={accent} title={labels.education}>
            {educations.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{edu.degree}</span>
                  {(edu.start_year || edu.end_year) && (
                    <span style={{ fontSize: '11px', color: '#a8a29e', whiteSpace: 'nowrap' as const }}>
                      {edu.start_year}{edu.end_year ? ` – ${edu.end_year}` : ''}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#78716c', fontStyle: 'italic', margin: '2px 0 0' }}>{edu.institution}</p>
              </div>
            ))}
          </MainSection>
        )}

        {projects.length > 0 && (
          <MainSection accent={accent} title={labels.projects}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{proj.name}</span>
                {proj.url && <span style={{ fontSize: '11px', color: '#a8a29e', marginLeft: '8px' }}>{proj.url}</span>}
                {proj.description && <p style={{ fontSize: '12px', color: '#44403c', margin: '4px 0 0', lineHeight: 1.65 }}>{proj.description}</p>}
              </div>
            ))}
          </MainSection>
        )}
      </div>
    </div>
  )
}

function SideSection({ title, accent, children }: { title?: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: accent, borderBottom: `1px solid ${accent}30`, paddingBottom: '4px', marginBottom: '8px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function MainSection({ title, accent, children }: { title?: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase' as const, color: accent, borderBottom: `2px solid ${accent}30`, paddingBottom: '5px', marginBottom: '14px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}
