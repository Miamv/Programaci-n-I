import { PLAN_KEYS, PLAN_LABELS } from '../config/plans';

export default function ProjectPlansNav({ active, onSelect, availableKeys = PLAN_KEYS }) {
  if (!availableKeys || availableKeys.length === 0) {
    return null;
  }

  return (
    <div className="pv-plansnav" role="tablist" aria-label="Tipos de plano">
      {availableKeys.map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active === key}
          className={`pv-plansnav__btn ${active === key ? 'is-active' : ''}`}
          onClick={() => onSelect(key)}
        >
          {PLAN_LABELS[key] || key}
        </button>
      ))}
    </div>
  );
}
