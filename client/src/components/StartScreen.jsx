import React from 'react';

function StartScreen({ openModal }) {
  return (
    <div className="start-content">
      {/* Dynamic Floating Background Particles (Butterflies) */}
      <div className="butterflies-bg">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
      </div>

      <h1 className="game-title">
        Anagram Quiz<br />
        <span className="title-accent">Full Moon</span>
      </h1>
      
      <div className="start-controls-sandbox">
        {/* Login Button: Cyan Polygon Shard */}
        <button className="p3r-polygon-btn start-btn-size" onClick={() => openModal('login')}>
          <span className="poly-back-shadow shadow-magenta"></span>
          <span className="poly-front-border">
            <span className="poly-front-fill fill-cyan">
              <span className="poly-text text-black">Login</span>
            </span>
          </span>
        </button>

        {/* Register Button: Bordered/Transparent Polygon Shard */}
        <button className="p3r-polygon-btn start-btn-size" onClick={() => openModal('register')}>
          <span className="poly-back-shadow shadow-cyan"></span>
          <span className="poly-front-border">
            <span className="poly-front-fill fill-transparent">
              <span className="poly-text text-white">Register</span>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

export default StartScreen;