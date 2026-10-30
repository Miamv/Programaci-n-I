import { resolveMediaUrl } from '../services/api';

function AvatarPlaceholder({ name }) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'VT';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.25rem',
        letterSpacing: '0.05em',
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export default function Team({ members = [], profiles = [], error }) {
  // Priorizar miembros dedicados de la entidad TeamMember; fallback a profiles si aún no hay miembros
  const rawList = Array.isArray(members) && members.length > 0 ? members : (Array.isArray(profiles) ? profiles : []);
  const teamList = rawList;
  const hasMembers = teamList.length > 0;

  return (
    <section id="equipo" className="vertice-team">
      <div className="container">
        <h3 className="vertice-team__title">Nuestro equipo</h3>
        {!hasMembers ? (
          <p className="vertice-team__empty text-muted small">
            {error ? `No se pudo cargar el equipo. ${error}` : 'Aún no hay miembros del equipo registrados.'}
          </p>
        ) : (
          <div className="vertice-team__grid">
            {teamList.map((member) => {
              const avatar = resolveMediaUrl(member.avatar || member.photo);
              const name = member.full_name || member.fullName || member.name;
              const role = member.role || member.position || member.specialty || 'Equipo Técnico';

              return (
                <div key={member.id} className="vertice-team__member">
                  <div className="vertice-team__avatar">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <AvatarPlaceholder name={name} />
                    )}
                  </div>
                  <span className="vertice-team__name">{name}</span>
                  <span className="vertice-team__role">{role}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
