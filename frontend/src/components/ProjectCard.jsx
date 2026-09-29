import { Link } from 'react-router-dom';

function formatCategory(category) {
  if (!category) return 'Proyecto';
  return category.replace(/_/g, ' ');
}

export default function ProjectCard({ project }) {
  const coverImage = project.coverImage || null;
  const title = project.title || 'Proyecto';
  const category = formatCategory(project.category);

  return (
    <article className="vertice-project-card">
      <div className="vertice-project-card__media">
        {coverImage ? (
          <img src={coverImage} alt={title} loading="lazy" />
        ) : (
          <div className="vertice-project-card__media-fallback">
            <span>{title}</span>
          </div>
        )}
      </div>
      <div className="vertice-project-card__body">
        <p className="vertice-project-card__kicker">{category}</p>
        <h3 className="vertice-project-card__title">{title}</h3>
        <p className="vertice-project-card__desc">
          {(project.description || 'Proyecto del estudio.').slice(0, 92)}
          {(project.description || '').length > 92 ? '…' : ''}
        </p>
        <Link to={`/proyecto/${project.id}`} className="vertice-project-card__cta">
          Ver detalles
        </Link>
      </div>
    </article>
  );
}
