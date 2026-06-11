import React from 'react';

function PrepScreen({
  view,
  currentFloor,
  getMoonPhase,
  classicLength,
  setClassicLength,
  setView,
  startBattle
}) {
  if (view === 'story-prep') {
    const moonPhase = getMoonPhase ? getMoonPhase(currentFloor) : { label: 'New Moon 🌑', shadowOffset: -120 };
    // Remove emojis from the moon phase label (e.g. "Waxing Crescent 🌘" -> "Waxing Crescent")
    const cleanMoonPhaseLabel = moonPhase.label.replace(/[^\w\s]/gi, '').trim();

    return (
      <div className="modal-content prep-modal-box">
        <div className="modal-inner">
          <h2 className="modal-title">Preparing</h2>
          
          <div className="prep-details-panel">
            <div className="prep-detail-row">
              <span className="prep-detail-label">Location</span>
              <span className="prep-detail-val">Tartarus: Floor {currentFloor}</span>
            </div>
            <div className="prep-detail-row">
              <span className="prep-detail-label">Moon Phase</span>
              <span className="prep-detail-val">{cleanMoonPhaseLabel}</span>
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '30px' }}>
            <button 
              className="p3-btn btn-red" 
              style={{ borderColor: 'var(--color-red)' }} 
              onClick={() => setView('lobby')}
            >
              Back
            </button>
            <button className="p3-btn" onClick={startBattle}>
              Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'classic-prep') {
    return (
      <div className="modal-content prep-modal-box">
        <div className="modal-inner">
          <h2 className="modal-title">Select Word Length</h2>
          
          <div className="difficulty-grid" style={{ margin: '30px 0' }}>
            {[3, 4, 5, 6, 7, 8].map((len) => (
              <button 
                key={len} 
                className={`diff-btn ${classicLength === len ? 'active' : ''}`} 
                onClick={() => setClassicLength(len)}
              >
                <span className="diff-btn-inner">{len}</span>
              </button>
            ))}
          </div>
          
          <div className="modal-actions">
            <button 
              className="p3-btn btn-red" 
              style={{ borderColor: 'var(--color-red)' }} 
              onClick={() => setView('lobby')}
            >
              Back
            </button>
            <button className="p3-btn" onClick={startBattle}>
              Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default PrepScreen;