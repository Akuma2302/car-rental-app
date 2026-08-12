import { useEffect, useState } from 'react';

function FadeIn({ delay = 0, duration = 1000, className = '', children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`fade-in${visible ? ' in' : ''}${className ? ` ${className}` : ''}`} style={{ transitionDuration: `${duration}ms` }}>
      {children}
    </div>
  );
}

export default FadeIn;
