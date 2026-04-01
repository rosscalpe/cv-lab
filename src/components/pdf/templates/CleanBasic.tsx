import { type TemplateProps, DEFAULT_LABELS, dateRange } from './shared'

const S = {
  page: {
    fontFamily: 'Inter, system-ui, sans-serif',
    width: '794px',
    minHeight: '1123px',
    padding: '56px 64px',
    background: '#fff',
    color: '#111827',
    boxSizing: 'border-box' as const,
  },
  name: { fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' },
  headline: { fontSize: '14px', color: '#6b7280', margin: '4px 0 0', fontWeight: 400 },
  contactRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px 16px', marginTop: '10px', fontSize: '12px', color: '#6b7280' },
  divider: { border: 'none', borderTop: '1.5px solid #e5e7eb', margin: '20px 0' },
  sectionTitle: { fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: '#9ca3af', marginBottom: '12px' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  itemTitle: { fontSize: '14px', fontWeight: 600, margin: 0 },
  itemSubtitle: { fontSize: '13px', color: '#6b7280', margin: '2px 0 0' },
  itemDate: { fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' as const },
  itemDesc: { fontSize: '13px', color: '#374151', margin: '6px 0 0', lineHeight: 1.6 },
  skillChip: { display: 'inline-block', background: '#f3f4f6', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', marginRight: '6px', marginBottom: '6px' },
  section: { marginBottom: '24px' },
}

export function CleanBasic({ data, labels = DEFAULT_LABELS }: TemplateProps) {
  const { profile, experiences, educations, skills, languages, certifications, projects } = data
  const p = labels.present ?? DEFAULT_LABELS.present

  const contacts = [
    profile?.email,
    profile?.phone,
    [profile?.city, profile?.country].filter(Boolean).join(', '),
    profile?.linkedin_url,
    profile?.portfolio_url,
  ].filter(Boolean)

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={S.name}>
            {profile?.first_name} {profile?.last_name}
          </h1>
          {profile?.headline && <p style={S.headline}>{profile.headline}</p>}
          {contacts.length > 0 && (
            <div style={S.contactRow}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {profile?.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photo_url}
            alt=""
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        )}
      </div>

      <hr style={S.divider} />

      {/* Resumen */}
      {profile?.summary && (
        <div style={S.section}>
          <div style={S.sectionTitle}>{labels.summary}</div>
          <p style={{ ...S.itemDesc, marginTop: 0 }}>{profile.summary}</p>
        </div>
      )}

      {/* Experiencia */}
      {experiences.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>{labels.experience}</div>
          {experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '14px' }}>
              <div style={S.itemHeader}>
                <span style={S.itemTitle}>{exp.company}</span>
                <span style={S.itemDate}>{dateRange(exp.start_date, exp.end_date, exp.is_current, p)}</span>
              </div>
              <p style={S.itemSubtitle}>{exp.role}</p>
              {exp.description && <p style={S.itemDesc}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Educación */}
      {educations.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>{labels.education}</div>
          {educations.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '12px' }}>
              <div style={S.itemHeader}>
                <span style={S.itemTitle}>{edu.institution}</span>
                {(edu.start_year || edu.end_year) && (
                  <span style={S.itemDate}>{edu.start_year} – {edu.end_year}</span>
                )}
              </div>
              <p style={S.itemSubtitle}>{edu.degree}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills + Idiomas en dos columnas */}
      {(skills.length > 0 || languages.length > 0) && (
        <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
          {skills.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={S.sectionTitle}>{labels.skills}</div>
              <div>{skills.map((s) => <span key={s.id} style={S.skillChip}>{s.name}</span>)}</div>
            </div>
          )}
          {languages.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={S.sectionTitle}>{labels.languages}</div>
              {languages.map((l) => (
                <div key={l.id} style={{ fontSize: '13px', marginBottom: '4px' }}>
                  {l.language}{l.level && <span style={{ color: '#9ca3af', marginLeft: '6px' }}>{l.level}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificaciones */}
      {certifications.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>{labels.certifications}</div>
          {certifications.map((c) => (
            <div key={c.id} style={{ marginBottom: '8px' }}>
              <span style={S.itemTitle}>{c.name}</span>
              {c.issuer && <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '8px' }}>{c.issuer}</span>}
              {c.year && <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '6px' }}>{c.year}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Proyectos */}
      {projects.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>{labels.projects}</div>
          {projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: '12px' }}>
              <div style={S.itemHeader}>
                <span style={S.itemTitle}>{proj.name}</span>
                {proj.url && <span style={{ ...S.itemDate, color: '#6b7280' }}>{proj.url}</span>}
              </div>
              {proj.description && <p style={S.itemDesc}>{proj.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
