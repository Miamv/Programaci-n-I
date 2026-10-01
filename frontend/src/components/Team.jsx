import { teamMembers } from '../content/about';

function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8EEFF" />
          <stop offset="100%" stopColor="#D6EAF8" />
        </linearGradient>
        <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A8C686" />
          <stop offset="100%" stopColor="#7BA05B" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#sky)" />
      <ellipse cx="50" cy="88" rx="56" ry="28" fill="url(#hill)" />
      <ellipse cx="30" cy="86" rx="22" ry="18" fill="#8CAA6B" opacity="0.9" />
      <g fill="white" opacity="0.95">
        <ellipse cx="42" cy="32" rx="12" ry="7" />
        <ellipse cx="58" cy="28" rx="9" ry="6" />
        <ellipse cx="34" cy="36" rx="6" ry="4.5" />
      </g>
    </svg>
  );
}

export default function Team() {
  return (
    <section id="equipo" className="vertice-team">
      <div className="container">
        <h3 className="vertice-team__title">Nuestro equipo</h3>
        <div className="vertice-team__grid">
          {teamMembers.map((member) => (
            <div key={member.id} className="vertice-team__member">
              <div className="vertice-team__avatar">
                <AvatarPlaceholder />
              </div>
              <span className="vertice-team__name">{member.name}</span>
              <span className="vertice-team__role">{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
