import { PLAN_KEYS, PLAN_LABELS } from '../content/mockProjects';

export default function ProjectPlansNav({ active, onSelect }) {
  return (
    <div className="pv-plansnav" role="tablist" aria-label="Tipos de plano">
      {PLAN_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active === key}
          className={`pv-plansnav__btn ${active === key ? 'is-active' : ''}`}
          onClick={() => onSelect(key)}
        >
          {PLAN_LABELS[key]}
        </button>
      ))}
    </div>
  );
}
