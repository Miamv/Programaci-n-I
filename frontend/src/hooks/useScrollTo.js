import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function useScrollTo() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollTo = useCallback(
    (id, basePath = '/') => {
      const normalizedCurrent = location.pathname.replace(/\/+$/, '') || '/';
      const normalizedTarget = basePath.replace(/\/+$/, '') || '/';

      const element = document.getElementById(id);
      if (normalizedCurrent === normalizedTarget && element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      navigate(`${normalizedTarget}#${id}`);
    },
    [location.pathname, navigate]
  );

  return scrollTo;
}
