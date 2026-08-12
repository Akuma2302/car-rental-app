import { useEffect, useState } from 'react';

const CHAR_DELAY = 30;
const INITIAL_DELAY = 200;

// Splits text on \n into lines, then each line into characters, and
// staggers each character's entrance based on its position — matches the
// reference: (lineIndex * lineLength * charDelay) + (charIndex * charDelay).
function AnimatedHeading({ text, accentLine, className }) {
  const [visible, setVisible] = useState(false);
  const lines = text.split('\n');

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), INITIAL_DELAY);
    return () => clearTimeout(timer);
  }, []);

  return (
    <h1 className={className}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className={accentLine === lineIndex ? 'accent' : undefined}>
          {line.split('').map((char, charIndex) => {
            const delay = lineIndex * line.length * CHAR_DELAY + charIndex * CHAR_DELAY;
            return (
              <span key={charIndex} className={`char${visible ? ' in' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))}
    </h1>
  );
}

export default AnimatedHeading;
