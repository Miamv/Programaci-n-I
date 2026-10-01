import { useEffect } from 'react';

export default function ImageFullscreen({ src, onClose }) {
  useEffect(() => {
    if (!src) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div className="image-fullscreen-overlay" onClick={onClose}>
      <button className="image-fullscreen-close" onClick={onClose}>
        &times;
      </button>
      <img src={src} alt="" className="image-fullscreen-img" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
