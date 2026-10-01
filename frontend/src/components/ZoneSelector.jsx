export default function ZoneSelector({ zones, activeZone, onZoneChange }) {
  if (!zones || zones.length === 0) return null;

  function handlePrev() {
    const currentIndex = zones.indexOf(activeZone);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : zones.length - 1;
    onZoneChange(zones[prevIndex]);
  }

  function handleNext() {
    const currentIndex = zones.indexOf(activeZone);
    const nextIndex = currentIndex < zones.length - 1 ? currentIndex + 1 : 0;
    onZoneChange(zones[nextIndex]);
  }

  return (
    <div className="d-flex align-items-center gap-3 mb-4">
      <button className="btn btn-outline-dark btn-sm rounded-circle" onClick={handlePrev}>
        &#8249;
      </button>
      <button className="btn btn-outline-dark btn-sm rounded-circle" onClick={handleNext}>
        &#8250;
      </button>

      <div className="d-flex gap-2 ms-3">
        {zones.map((zone) => (
          <button
            key={zone}
            className={`btn rounded-pill px-4 ${
              activeZone === zone ? 'text-white' : 'btn-outline-dark'
            }`}
            style={activeZone === zone ? { backgroundColor: 'var(--color-primary)' } : {}}
            onClick={() => onZoneChange(zone)}
          >
            {zone.charAt(0).toUpperCase() + zone.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
