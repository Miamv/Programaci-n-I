export default function TechSpecs({ specs }) {
  if (!specs || Object.keys(specs).length === 0) return null;

  return (
    <div className="tech-specs">
      {Object.entries(specs).map(([key, value]) => (
        <div key={key} className="mb-3">
          <h6 className="text-uppercase fw-bold small mb-1">{key}</h6>
          <p className="mb-0 text-muted">{value}</p>
        </div>
      ))}
    </div>
  );
}
