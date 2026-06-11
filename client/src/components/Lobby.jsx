import React from 'react';

function Lobby({ 
  user, 
  handleLogout, 
  activeMode, 
  setActiveMode, 
  currentFloor, 
  handleModeConfirm 
}) {
  return (
    <div className="lobby-content">
      <div className="lobby-header">
        <div className="user-profile">
          <span className="profile-tag">S.E.E.S. MEMBER</span>
          <span className="profile-name">{user?.username}</span>
        </div>
        <button 
          className="p3-btn" 
          style={{ padding: '8px 18px', fontSize: '0.85rem', borderColor: 'var(--color-red)' }} 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <h2 className="lobby-title">Choose Game Mode</h2>

      <div className="mode-selection-grid">
        <div 
          className={`mode-card ${activeMode === 'story' ? 'active' : ''}`} 
          onClick={() => setActiveMode('story')}
        >
          <div className="mode-card-inner">
            <div>
              <h3 className="mode-card-title">Full Moon Story</h3>
              <p className="mode-card-desc">Climb the 50 floors of Tartarus Tower. Face increasingly strong Shadows under tight turn-based combat.</p>
            </div>
            <div className="mode-card-meta">
              <p className="mode-card-label">Current Progress</p>
              <p className="mode-card-stat">FLOOR {currentFloor} / 50</p>
            </div>
          </div>
        </div>

        <div 
          className={`mode-card classic ${activeMode === 'classic' ? 'active' : ''}`} 
          onClick={() => setActiveMode('classic')}
        >
          <div className="mode-card-inner">
            <div>
              <h3 className="mode-card-title">Classic Mode</h3>
              <p className="mode-card-desc">Practice anagrams. Solve words of lengths 3 to 8 with no health penalties to secure high scores.</p>
            </div>
            <div className="mode-card-meta">
              <p className="mode-card-label">Practice Settings</p>
              <p className="mode-card-stat">3–8 letter options</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lobby-actions">
        <button className="p3-btn" onClick={handleModeConfirm}>
          {activeMode === 'story' ? 'Enter Tartarus' : 'Start Practice'}
        </button>
      </div>
    </div>
  );
}

export default Lobby;