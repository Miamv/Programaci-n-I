import { useState } from 'react';
import ImageFullscreen from './ImageFullscreen';

export default function ImageGallery({ images }) {
  const [fullscreenSrc, setFullscreenSrc] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        No hay imágenes disponibles para esta zona.
      </div>
    );
  }

  return (
    <>
      <div className="image-gallery">
        {images.map((image) => (
          <div key={image.id} className="gallery-item">
            <img
              src={image.file}
              alt=""
              className="gallery-image"
              onClick={() => setFullscreenSrc(image.file)}
            />
            <button
              className="fullscreen-btn"
              onClick={() => setFullscreenSrc(image.file)}
              aria-label="Ver pantalla completa"
            >
              &#x26F6;
            </button>
          </div>
        ))}
      </div>

      <ImageFullscreen src={fullscreenSrc} onClose={() => setFullscreenSrc(null)} />
    </>
  );
}
