export default function ProjectHero({ title, coverImage }) {
  return (
    <section
      className="position-relative d-flex align-items-end"
      style={{
        minHeight: '60vh',
        backgroundImage: coverImage ? `url(${coverImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: coverImage ? undefined : '#e8e8e8',
      }}
    >
      <div
        className="position-absolute inset-0"
        style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.6))' }}
      />

      <div className="container position-relative pb-5">
        <h1
          className="text-white fw-bold display-4"
          style={{ fontFamily: 'var(--font-heading)', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
