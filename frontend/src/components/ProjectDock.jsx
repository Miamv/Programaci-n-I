const OPTIONS = [
  {
    key: 'renders',
    label: 'Renders',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4.5 17.5 L10 12.5 L13.5 16 L16.5 13 L19.5 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'planos',
    label: 'Planos',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 20 L14.5 4.5 L20 6.5 L9.5 20 Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12.5 8.5 L15.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'ubicacion',
    label: 'Ubicación',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21 C7.5 15.5 5 12.3 5 9.3 C5 5.5 8.1 3 12 3 C15.9 3 19 5.5 19 9.3 C19 12.3 16.5 15.5 12 21 Z" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="9.3" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    key: 'info',
    label: 'Info',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 11 V16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="7.8" r="1.15" fill="currentColor" />
      </svg>
    ),
  },
];

export default function ProjectDock({ mode, onSelect }) {
  return (
    <nav className="pv-dock" aria-label="Modos del proyecto">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={`pv-dock__btn ${mode === opt.key ? 'is-active' : ''}`}
          onClick={() => onSelect(opt.key)}
          aria-pressed={mode === opt.key}
        >
          <span className="pv-dock__icon" aria-hidden="true">{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </nav>
  );
}
