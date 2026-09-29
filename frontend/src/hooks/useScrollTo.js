import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function useScrollTo() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollTo = useCallback(
    (id) => {
      if (location.pathname !== '/') {
        navigate(`/#${id}`);
        return;
      }

      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [location.pathname, navigate]
  );

  return scrollTo;
}
