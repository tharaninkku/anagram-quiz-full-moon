import { useState, useEffect } from 'react';
import { IMAGES_TO_PRELOAD } from '../constants/assets';

function LoadingScreen({ onComplete }) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [currentFile, setCurrentFile] = useState('Initializing preloader...');
  const [dbStatus, setDbStatus] = useState('connecting'); // 'connecting' | 'connected' | 'waking_up' | 'error'
  const [dbMessage, setDbMessage] = useState('Establishing connection to database...');

  // 1. Image Assets Preloader
  useEffect(() => {
    let count = 0;
    const total = IMAGES_TO_PRELOAD.length;

    if (total === 0) {
      setTimeout(() => setAssetsLoaded(true), 0);
      return;
    }

    const handleLoadProgress = (src) => {
      count++;
      setLoadedCount(count);
      const fileName = src.substring(src.lastIndexOf('/') + 1);
      setCurrentFile(`Loaded asset: ${fileName}`);
      
      if (count === total) {
        setAssetsLoaded(true);
        setCurrentFile('All assets successfully cached.');
      }
    };

    IMAGES_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      img.onload = () => handleLoadProgress(src);
      img.onerror = () => {
        console.warn(`Failed to preload image: ${src}`);
        handleLoadProgress(src); // Continue load sequence on fail
      };
      img.src = src;
    });
  }, []);

  // 2. Database Connection verification (retries to handle Render spin-up latency)
  useEffect(() => {
    let active = true;
    let failCount = 0;

    const checkDb = async () => {
      if (!active) return;
      try {
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Response status error');
        
        const data = await response.json();
        if (data.status === 'ok') {
          if (active) {
            setDbStatus('connected');
            setDbMessage('Database connection active.');
          }
        } else {
          throw new Error('Database reporting unhealthy');
        }
      } catch (err) {
        if (active) {
          failCount++;
          console.error(err);
          if (failCount >= 2) {
            setDbStatus('waking_up');
            setDbMessage('Database server is waking up... Please wait (this can take 30-50s on free hosts).');
          } else {
            setDbStatus('error');
            setDbMessage('Database connection unsuccessful. Retrying...');
          }
          // Retry health check in 2.5 seconds
          setTimeout(checkDb, 2500);
        }
      }
    };

    checkDb();

    return () => {
      active = false;
    };
  }, []);

  // 3. Gatekeeper: Only proceed when BOTH database is connected and assets are loaded
  useEffect(() => {
    if (assetsLoaded && dbStatus === 'connected') {
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [assetsLoaded, dbStatus, onComplete]);

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

        {/* Assets preload log */}
        <p className="loading-file-log">{currentFile}</p>

        {/* Database connection status HUD */}
        <div className={`loading-db-panel db-status-${dbStatus}`}>
          <div className="db-indicator-dot"></div>
          <span className="loading-db-text">{dbMessage}</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
