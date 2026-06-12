import React, { useState, useEffect } from 'react';

const IMAGES_TO_PRELOAD = [
  // Backgrounds
  '/images/Background/blue_sea.png',
  '/images/Background/blue_sea_fm.png',
  '/images/Background/red_sea.png',
  '/images/Background/red_sea_fm.png',
  '/images/Background/Tartarus colored trans.png',
  '/images/Background/Tartarus_f1.png',
  '/images/Background/Tartarus_f1_1.png',
  '/images/Background/tartarus_full_moon.png',
  '/images/Tartarus_f1_1.png',

  // MC idle & status
  '/images/MC/idle1.png',
  '/images/MC/idle2.png',
  '/images/MC_emo/mc_idle_emo.png',
  '/images/MC_emo/mc_hurt_emo.png',
  '/images/MC_emo/mc_surprise_emo.png',

  // MC sigh
  '/images/MC/sigh1.png',
  '/images/MC/sigh2.png',
  '/images/MC/sigh3.png',
  '/images/MC/sigh4.png',

  // Orpheus
  '/images/Orpheus/Orpheus/1.png',
  '/images/Orpheus/Orpheus/2.png',
  '/images/Orpheus/Orpheus/3.png',
  '/images/Orpheus/Orpheus/4.png',

  // Shadow mud
  '/images/Shadow/Shad_mud1/Idle_loop/Idle1mud.png',
  '/images/Shadow/Shad_mud1/Idle_loop/Idle2mud.png',
  '/images/Shadow/Shad_mud1/Idle_loop/Idle3mud.png',
  '/images/Shadow/Shad_mud1/being_hit_loop/being_hit1mud.png',
  '/images/Shadow/Shad_mud1/being_hit_loop/being_hit2mud.png',

  // MC Attacks & Skills
  '/images/MC/call_persona1.png',
  '/images/MC/call_persona2.png',
  '/images/MC/call_persona3.png',
  '/images/MC/call_persona4.png',
  '/images/MC/call_persona5.png',
  '/images/MC/call_persona5(1).png',
  '/images/MC/tarot_attack1.png',
  '/images/MC/tarot_attack2.png',
  '/images/MC/tarot_attack3.png',
  '/images/MC/tarot_attack4.png',
  '/images/MC/tarot_attack5.png',
  '/images/MC/tarot_attack6.png',
  '/images/MC/tarot_attack7.png',

  // Shadow Attacks & States
  '/images/Shadow/Shad_mud1/mud_attack/mud_attack1.png',
  '/images/Shadow/Shad_mud1/mud_attack/mud_attack2.png',
  '/images/Shadow/Shad_mud1/mud_attack/mud_attack3.png',
  '/images/Shadow/Shad_mud1/mud_attack/mud_attack4.png',
  '/images/Shadow/Shad_mud1/mud_defeated/ mud_defeated1.png',
  '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated2.png',
  '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated3.png',
  '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated4.png',
  '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated5.png',
  '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated6.png',
  '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated7.png',

  // Fire Spell Effects
  ...Array.from({ length: 16 }, (_, i) => `/images/Attack_animation/Attack animation/Fire/${i + 1}.png`),

  // Slash Spell Effects
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609221948.png',
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609221951.png',
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609221954.png',
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609221957.png',
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609222001.png',
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609222003.png',
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609222006.png',
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609222009.png',
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609222011.png',
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609222014.png',
  '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609222017.png'
];

function LoadingScreen({ onComplete }) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [currentFile, setCurrentFile] = useState('Initializing preloader...');

  useEffect(() => {
    let count = 0;
    const total = IMAGES_TO_PRELOAD.length;

    if (total === 0) {
      onComplete();
      return;
    }

    const handleLoadProgress = (src) => {
      count++;
      setLoadedCount(count);
      // Strip path prefix to show a cleaner filename
      const fileName = src.substring(src.lastIndexOf('/') + 1);
      setCurrentFile(`Loaded: ${fileName}`);
      
      if (count === total) {
        // Wait a slight fraction of a second for visual satisfaction
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    IMAGES_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      
      img.onload = () => {
        handleLoadProgress(src);
      };
      
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
        handleLoadProgress(src); // Continue loading game anyway
      };

      img.src = src;
    });
  }, [onComplete]);

  const percentage = Math.floor((loadedCount / IMAGES_TO_PRELOAD.length) * 100);

  return (
    <div className="loading-screen-container">
      {/* Sleek diagonal background aesthetics */}
      <div className="loading-bg-accents">
        <div className="loading-bg-line-1"></div>
        <div className="loading-bg-line-2"></div>
      </div>

      <div className="loading-center-content">
        <div className="loading-butterfly-wrapper">
          {/* Blue Butterfly Motif */}
          <svg className="loading-butterfly-svg" width="70" height="70" viewBox="0 0 50 50" fill="none">
            <path d="M 25 25 Q 10 10 5 25 Q 10 35 25 25 Z" fill="var(--color-cyan)" opacity="0.9" />
            <path d="M 25 25 Q 40 10 45 25 Q 40 35 25 25 Z" fill="var(--color-cyan)" opacity="0.9" />
            <circle cx="25" cy="25" r="2" fill="#fff" />
          </svg>
        </div>

        <h1 className="loading-text-main">LOADING...</h1>

        <div className="loading-progress-container">
          <span className="loading-progress-percent">{percentage}%</span>
          <div className="loading-progress-bar-outer">
            <div 
              className="loading-progress-bar-fill" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        <p className="loading-file-log">{currentFile}</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
