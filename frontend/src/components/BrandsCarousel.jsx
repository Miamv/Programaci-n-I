export default function BrandsCarousel({ brands, error }) {
  const hasBrands = Array.isArray(brands) && brands.length > 0;

  if (!hasBrands) {
    return (
      <section className="vertice-brands" aria-label="Marcas">
        <div className="container">
          <div className="vertice-brands__frame">
            {error ? (
              <p className="vertice-brands__empty vertice-brands__empty--error">No se pudieron cargar las marcas. {error}</p>
            ) : (
              <p className="vertice-brands__empty">Aún no hay marcas para mostrar.</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  const loop = [...brands, ...brands, ...brands];

  return (
    <section className="vertice-brands" aria-label="Marcas">
      <div className="container">
        <div className="vertice-brands__frame">
          <div className="vertice-brands__viewport">
            <div className="vertice-brands__track">
              {loop.map((brand, index) => (
                <div className="vertice-brands__item" key={`${brand.id}-${index}`}>
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="vertice-brands__logo" loading="lazy" />
                  ) : (
                    <span className="vertice-brands__placeholder">{brand.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
