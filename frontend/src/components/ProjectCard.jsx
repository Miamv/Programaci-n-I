import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../services/api';

function formatCategory(category) {
  if (!category) return 'Proyecto';
  return category.replace(/_/g, ' ');
}

export default function ProjectCard({ project, coverUrl }) {
  const [brokenCover, setBrokenCover] = useState(false);
  const coverImage = resolveMediaUrl(
    coverUrl || project.coverImage || project.cover_image || project.image || null
  );
  const showCover = coverImage && !brokenCover;
  const title = project.title || 'Proyecto';
  const category = formatCategory(project.category);
  const detailPath = project.profile_slug
    ? `/estudios/${project.profile_slug}/proyecto/${project.id}`
    : `/proyecto/${project.id}`;

  return (
    <article className="vertice-project-card">
      <div className="vertice-project-card__media">
        {showCover ? (
          <img src={coverImage} alt={title} loading="lazy" onError={() => setBrokenCover(true)} />
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
        <Link to={detailPath} className="vertice-project-card__cta">
          Ver detalles
        </Link>
      </div>
    </article>
  );
}
