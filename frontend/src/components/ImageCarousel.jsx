import { useState } from 'react';
import { CarGlyph } from './icons.jsx';

const TINTS = { amber: '#d88f22', jade: '#2e8b79', dusk: '#3a4368' };

function ImageCarousel({ images, altText, accent }) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    const tint = TINTS[accent] || TINTS.amber;
    return (
      <div className="car-art" style={{ background: `${tint}14` }}>
        <CarGlyph tint={tint} />
      </div>
    );
  }

  const current = images[index];

  function go(delta) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  return (
    <div className="car-art car-art-photo">
      <img src={current.url} alt={altText} />
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="carousel-nav carousel-prev"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel-nav carousel-next"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            ›
          </button>
          <div className="carousel-dots">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                className={`carousel-dot${i === index ? ' active' : ''}`}
                aria-label={`Photo ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageCarousel;
