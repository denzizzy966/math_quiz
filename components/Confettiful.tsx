import React, { useEffect, useRef } from 'react';
import '../styles/confetti.css';

const Confettiful: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const confettiColors = ['#EF2964', '#00C09D', '#2D87B0', '#48485E','#EFFF1D'];
    const confettiAnimations = ['slow', 'medium', 'fast'];

    const confettiInterval = setInterval(() => {
      const confettiEl = document.createElement('div');
      const confettiSize = (Math.floor(Math.random() * 3) + 7) + 'px';
      const confettiBackground = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const confettiLeft = (Math.floor(Math.random() * containerRef.current!.offsetWidth)) + 'px';
      const confettiAnimation = confettiAnimations[Math.floor(Math.random() * confettiAnimations.length)];
      
      confettiEl.classList.add('confetti', `confetti--animation-${confettiAnimation}`);
      confettiEl.style.left = confettiLeft;
      confettiEl.style.width = confettiSize;
      confettiEl.style.height = confettiSize;
      confettiEl.style.backgroundColor = confettiBackground;
      
      confettiEl.removeTimeout = setTimeout(function() {
        confettiEl.parentNode?.removeChild(confettiEl);
      }, 3000);
      
      containerRef.current!.appendChild(confettiEl);
    }, 25);

    return () => {
      clearInterval(confettiInterval);
    };
  }, []);

  return <div ref={containerRef} className="confetti-container" />;
};

export default Confettiful;

