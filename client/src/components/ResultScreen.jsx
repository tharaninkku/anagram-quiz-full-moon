import React from 'react';

function ResultScreen({
  activeMode,
  enemyHP,
  enemyMaxHP,
  playerHP,
  playerMaxHP,
  currentFloor,
  roundScore,
  resultTab,
  setResultTab,
  battleTimeElapsed,
  classicLength,
  leaderboardData,
  missedWordsList,
  setView
}) {
  const isVictory = enemyHP <= 0;
  const isStory = activeMode === 'story';
  const bgClass = isStory ? (isVictory ? 'victory' : 'defeat') : 'victory';
  return (
    <div className={`result-container ${bgClass}`}>
      <div style={{ zIndex: 15, textAlign: 'center' }}>
        <h2 className="game-title" style={{ fontSize: '2rem', marginBottom: '10px' }}>
          {isStory 
            ? (isVictory ? 'Floor Cleared' : 'Defeated in Tartarus') 
            : 'Practice Complete'}
        </h2>
        <p style={{ color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Round summary reports
        </p>
      </div>

      <div className="result-moon-score">
        <span className="result-moon-label">
          {isStory ? 'Floor' : 'Final Score'}
        </span>
        <span className="result-moon-val">
          {isStory ? currentFloor - 1 : roundScore}
        </span>
      </div>

      <div className={`result-info-frame ${isVictory ? 'victory' : 'defeat'}`}>
        <div className="result-frame-shadow"></div>
        <div className="result-frame-front">
          <div className="result-toggle-row">
            <button 
              className={`p3r-rect-btn ${resultTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setResultTab('leaderboard')}
            >
              <span className="rect-back-shadow"></span>
              <span className="rect-front-fill">
                {isStory ? 'Stats' : 'Rankings'}
              </span>
            </button>
            <button 
              className={`p3r-rect-btn ${resultTab === 'missed' ? 'active' : ''}`}
              onClick={() => setResultTab('missed')}
            >
              <span className="rect-back-shadow"></span>
              <span className="rect-front-fill">
                Missed ({missedWordsList.length})
              </span>
            </button>
          </div>

          <div className="result-view-panel">
            {resultTab === 'leaderboard' ? (
              isStory ? (
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0', width: '100%' }}>
                  <h4 style={{ fontFamily: 'var(--font-game)', fontSize: '0.95rem', color: 'var(--color-cyan)', textAlign: 'center', marginBottom: '5px' }}>
                    BATTLE PERFORMANCE REPORT
                  </h4>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>TIME ELAPSED:</span>
                    <strong style={{ fontFamily: 'var(--font-game)', color: 'var(--color-yellow)' }}>
                      {battleTimeElapsed} SECONDS
                    </strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-dim)' }}>
                      {isVictory ? 'PLAYER SURVIVING HEALTH:' : 'ENEMY HEALTH REMAINING:'}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontFamily: 'var(--font-game)', marginBottom: '2px' }}>
                      <span>{isVictory ? 'HERO HP' : 'SHADOW HP'}</span>
                      <span>
                        {isVictory ? `${playerHP}/${playerMaxHP}` : `${enemyHP}/${enemyMaxHP}`}
                      </span>
                    </div>
                    <div className="hp-bar-outer">
                      <div 
                        className="hp-bar-fill" 
                        style={{ 
                          width: isVictory ? `${(playerHP / playerMaxHP) * 100}%` : `${(enemyHP / enemyMaxHP) * 100}%`,
                          backgroundColor: isVictory ? 'var(--color-cyan)' : 'var(--color-red)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <h4 style={{ fontFamily: 'var(--font-game)', fontSize: '0.9rem', color: 'var(--color-cyan)', marginBottom: '8px', textAlign: 'center' }}>
                    TOP SECTIONS (Difficulty Length: {classicLength})
                  </h4>
                  {leaderboardData.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>
                      No record entries found.
                    </p>
                  ) : (
                    <table className="leaderboard-table">
                      <tbody>
                        {leaderboardData.map((row, idx) => (
                          <tr key={idx} className="leaderboard-row">
                            <td className="leaderboard-cell rank">#{idx + 1}</td>
                            <td className="leaderboard-cell">{row.username}</td>
                            <td className="leaderboard-cell score">{row.score} pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )
            ) : (
              <div style={{ width: '100%' }}>
                <h4 style={{ fontFamily: 'var(--font-game)', fontSize: '0.9rem', color: 'var(--color-red)', marginBottom: '8px', textAlign: 'center' }}>
                  UNSOLVED ANAGRAMS
                </h4>
                {missedWordsList.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>
                    Perfect! No words missed this round.
                  </p>
                ) : (
                  <div className="missed-words-grid">
                    {missedWordsList.map((word, idx) => (
                      <span key={idx} className="missed-word-tag">{word}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ zIndex: 15 }}>
        <button className="p3-btn" onClick={() => setView('lobby')}>
          Back to Lobby
        </button>
      </div>
    </div>
  );
}

export default ResultScreen;