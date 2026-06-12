import React, { useState, useEffect, useRef } from 'react';

const LETTER_POINTS = {
  a:1, b:3, c:3, d:2, e:1, f:4, g:2, h:4, i:1, j:8, k:5, l:1, m:3,
  n:1, o:1, p:3, q:10, r:1, s:1, t:1, u:1, v:4, w:4, x:8, y:4, z:10
};

const fireFrames = Array.from({ length: 16 }, (_, i) => `/images/Attack_animation/Attack animation/Fire/${i + 1}.png`);

const slashFrames = [
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

function BattleArena({
  activeMode,
  enemyType,
  playerHP,
  playerMaxHP,
  enemyHP,
  enemyMaxHP,
  roundScore,
  inputWord,
  lettersPool,
  solvedAnswers,
  validAnswersPool,
  streakCount,
  timeLeft,
  roundLimit,
  inputErrorShake,
  handleSelectTile,
  handleReturnTile,
  removeLastLetter,
  clearInput,
  submitInputWord,
  handleRetreat,
  handleSkip,
  loading
}) {
  // Sprite Frames States
  const [mcSprite, setMCSprite] = useState('/images/MC/idle1.png');
  const [shadowSprite, setShadowSprite] = useState('/images/Shadow/Shad_mud1/Idle_loop/Idle1mud.png');
  const [orpheusSprite, setOrpheusSprite] = useState('/images/Orpheus/Orpheus/1.png');
  const [effectSprite, setEffectSprite] = useState('/images/Attack_animation/Attack animation/Fire/1.png');
  const [mcEmo, setMcEmo] = useState('/images/MC_emo/mc_idle_emo.png');

  // Animation Timeline States
  const [mcState, setMCState] = useState('idle');
  const [shadowState, setShadowState] = useState('idle');
  const [mcLunge, setMCLunge] = useState(false);
  const [shadowLunge, setShadowLunge] = useState(false);
  const [shadowHitBack, setShadowHitBack] = useState(false);
  const [mcHitBack, setMcHitBack] = useState(false);
  const [mcShake, setMCShake] = useState(false);
  const [shadowShake, setShadowShake] = useState(false);
  const [screenFlash, setScreenFlash] = useState('none');
  const [orpheusActive, setOrpheusActive] = useState(false);
  const [effectActive, setEffectActive] = useState(false);
  const [sighBubbleActive, setSighBubbleActive] = useState(false);
  const [hudShake, setHudShake] = useState(false);
  const [combatLock, setCombatLock] = useState(false);

  // Tracking HP for Animation Triggers
  const prevPlayerHP = useRef(playerHP);
  const prevEnemyHP = useRef(enemyHP);
  const prevRoundScore = useRef(roundScore);
  const prevTimeLeft = useRef(timeLeft);
  const solvedCountRef = useRef(0);

  const sighIntervalRef = useRef(null);
  const sighTimeoutRef = useRef(null);
  const combatLockRef = useRef(false);
  const mcAnimTimerRef = useRef(null);
  const shadowAnimTimerRef = useRef(null);

  const clearSighAnimation = () => {
    if (sighIntervalRef.current) {
      clearInterval(sighIntervalRef.current);
      sighIntervalRef.current = null;
    }
    if (sighTimeoutRef.current) {
      clearTimeout(sighTimeoutRef.current);
      sighTimeoutRef.current = null;
    }
    setSighBubbleActive(false);
  };

  const cleanupMcAnimation = () => {
    if (mcAnimTimerRef.current) {
      clearInterval(mcAnimTimerRef.current);
      mcAnimTimerRef.current = null;
    }
  };

  const cleanupShadowAnimation = () => {
    if (shadowAnimTimerRef.current) {
      clearInterval(shadowAnimTimerRef.current);
      shadowAnimTimerRef.current = null;
    }
  };

  const isLocked = (activeMode === 'story' ? combatLock : false) || loading;

  const flashScreen = (color) => {
    setScreenFlash(color);
    setTimeout(() => setScreenFlash('none'), 80);
  };

  // Preloading animation images to prevent Vercel/network latency glitch
  useEffect(() => {
    const imagesToPreload = [
      '/images/MC/idle1.png',
      '/images/MC/idle2.png',
      '/images/Shadow/Shad_mud1/Idle_loop/Idle1mud.png',
      '/images/Orpheus/Orpheus/1.png',
      '/images/Attack_animation/Attack animation/Fire/1.png',
      '/images/MC_emo/mc_idle_emo.png',
      '/images/MC_emo/mc_hurt_emo.png',
      '/images/MC_emo/mc_surprise_emo.png',
      ...Array.from({ length: 16 }, (_, i) => `/images/Attack_animation/Attack animation/Fire/${i + 1}.png`),
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
      '/images/Attack_animation/Attack animation/Slash/Untitled94_20260609222017.png',
      '/images/Shadow/Shad_mud1/Idle_loop/Idle2mud.png',
      '/images/Shadow/Shad_mud1/Idle_loop/Idle3mud.png',
      '/images/MC/sigh1.png',
      '/images/MC/sigh2.png',
      '/images/MC/sigh3.png',
      '/images/MC/sigh4.png',
      '/images/Shadow/Shad_mud1/being_hit_loop/being_hit1mud.png',
      '/images/Shadow/Shad_mud1/being_hit_loop/being_hit2mud.png',
      '/images/Orpheus/Orpheus/2.png',
      '/images/Orpheus/Orpheus/3.png',
      '/images/Orpheus/Orpheus/4.png',
      '/images/MC/call_persona1.png',
      '/images/MC/call_persona2.png',
      '/images/MC/call_persona3.png',
      '/images/MC/call_persona4.png',
      '/images/MC/call_persona5.png',
      '/images/MC/tarot_attack1.png',
      '/images/MC/tarot_attack2.png',
      '/images/MC/tarot_attack3.png',
      '/images/MC/tarot_attack4.png',
      '/images/MC/tarot_attack5.png',
      '/images/MC/tarot_attack6.png',
      '/images/MC/tarot_attack7.png',
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
      '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated7.png'
    ];

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // 1. MC Idle Animation loop
  useEffect(() => {
    if (mcState !== 'idle') return;
    let frame = 0;
    const timer = setInterval(() => {
      frame = 1 - frame;
      setMCSprite(frame === 0 ? '/images/MC/idle1.png' : '/images/MC/idle2.png');
    }, 1125);
    return () => clearInterval(timer);
  }, [mcState]);

  // 2. Shadow Idle Animation loop
  useEffect(() => {
    if (shadowState !== 'idle') return;
    const idleFrames = [
      '/images/Shadow/Shad_mud1/Idle_loop/Idle1mud.png',
      '/images/Shadow/Shad_mud1/Idle_loop/Idle2mud.png',
      '/images/Shadow/Shad_mud1/Idle_loop/Idle3mud.png'
    ];
    let frame = 0;
    const timer = setInterval(() => {
      frame = (frame + 1) % 3;
      setShadowSprite(idleFrames[frame]);
    }, 350);
    return () => clearInterval(timer);
  }, [shadowState]);

  // 3. MC Sigh loop (Triggers every 5 seconds if idle)
  useEffect(() => {
    const sighFrames = [
      '/images/MC/sigh1.png',
      '/images/MC/sigh2.png',
      '/images/MC/sigh3.png',
      '/images/MC/sigh4.png'
    ];
    const checkInterval = setInterval(() => {
      if (mcState === 'idle') {
        setMCState('sigh');
        setSighBubbleActive(true);
        sighTimeoutRef.current = setTimeout(() => setSighBubbleActive(false), 1500);

        let currentFrame = 0;
        sighIntervalRef.current = setInterval(() => {
          if (currentFrame < sighFrames.length) {
            setMCSprite(sighFrames[currentFrame]);
            currentFrame++;
          } else {
            clearInterval(sighIntervalRef.current);
            sighIntervalRef.current = null;
            setMCState('idle');
          }
        }, 200);
      }
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      if (sighIntervalRef.current) {
        clearInterval(sighIntervalRef.current);
        sighIntervalRef.current = null;
      }
      if (sighTimeoutRef.current) {
        clearTimeout(sighTimeoutRef.current);
        sighTimeoutRef.current = null;
      }
      setSighBubbleActive(false);
    };
  }, [mcState]);

  // 4. Keyboard Lockout controller
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLocked) return;

      if (e.key === 'Enter') {
        submitInputWord();
      } else if (e.key === 'Backspace') {
        removeLastLetter();
      } else if (e.key === 'Escape') {
        clearInput();
      } else {
        const char = e.key.toLowerCase();
        if (/[a-z]/.test(char) && char.length === 1) {
          const tile = lettersPool.find(t => t.char === char && !t.used);
          if (tile) handleSelectTile(tile);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lettersPool, inputWord, isLocked, submitInputWord, handleSelectTile, removeLastLetter, clearInput]);

  // 5. HP Drop Listener to fire Animations
  useEffect(() => {
    // If enemy took damage
    if (enemyHP < prevEnemyHP.current) {
      if (enemyHP <= 0) {
        triggerShadowDefeat();
      } else if (!combatLockRef.current) {
        // Guard: only trigger attack animation if no animation is currently playing
        const isStreakBonus = streakCount > 0 && streakCount % 3 === 0;
        if (isStreakBonus) {
          triggerCallPersona();
        } else {
          triggerTarotAttack();
        }
      }
    }
    prevEnemyHP.current = enemyHP;
  }, [enemyHP, streakCount]);

  useEffect(() => {
    // If player took damage
    // Guard: prevent shadow attack from overlapping with MC attack animations
    if (playerHP < prevPlayerHP.current && !combatLockRef.current) {
      triggerShadowAttack();
    }
    prevPlayerHP.current = playerHP;
  }, [playerHP]);

  // 6. Classic Mode Animation Listeners (Score increase)
  useEffect(() => {
    if (roundScore === 0) {
      solvedCountRef.current = 0;
    }
  }, [roundScore]);

  useEffect(() => {
    if (activeMode === 'classic') {
      if (roundScore > prevRoundScore.current) {
        solvedCountRef.current += 1;
        
        // Only trigger animation every 3 word correct answer
        if (solvedCountRef.current % 3 === 0) {
          // Protection: only trigger if the last animation is finished
          if (mcState === 'idle' || mcState === 'sigh') {
            const isStreakBonus = streakCount > 0 && streakCount % 3 === 0;
            if (isStreakBonus) {
              triggerCallPersona();
            } else {
              triggerTarotAttack();
            }
          }
        }
      }
    }
    prevRoundScore.current = roundScore;
  }, [roundScore, streakCount, activeMode, mcState]);

  // COMBAT SEQUENCES
  const playSpellEffect = (type, speed) => {
    setEffectActive(true);
    let idx = 0;
    const list = type === 'fire' ? fireFrames : slashFrames;
    setEffectSprite(list[0]);
    
    const timer = setInterval(() => {
      if (idx < list.length) {
        setEffectSprite(list[idx]);
        idx++;
      } else {
        clearInterval(timer);
        setEffectActive(false);
      }
    }, speed);
  };

  const triggerShadowHit = () => {
    setShadowState('hit');
    setShadowHitBack(true);
    setShadowShake(true);

    const hitFrames = [
      '/images/Shadow/Shad_mud1/being_hit_loop/being_hit1mud.png',
      '/images/Shadow/Shad_mud1/being_hit_loop/being_hit2mud.png',
      '/images/Shadow/Shad_mud1/being_hit_loop/being_hit1mud.png',
      '/images/Shadow/Shad_mud1/being_hit_loop/being_hit2mud.png'
    ];
    let currentFrame = 0;

    const timer = setInterval(() => {
      if (currentFrame < hitFrames.length) {
        setShadowSprite(hitFrames[currentFrame]);
        currentFrame++;
      } else {
        clearInterval(timer);
        setShadowHitBack(false);
        setShadowShake(false);
        setShadowState('idle');
      }
    }, 150);
  };

  const playOrpheusSummon = () => {
    setOrpheusActive(true);
    const orpheusFrames = [
      '/images/Orpheus/Orpheus/1.png',
      '/images/Orpheus/Orpheus/2.png',
      '/images/Orpheus/Orpheus/3.png',
      '/images/Orpheus/Orpheus/4.png'
    ];
    let orphStep = 0;

    const runOrph = () => {
      if (orphStep === 0) {
        setOrpheusSprite(orpheusFrames[0]);
        orphStep++;
        setTimeout(runOrph, 120);
      } else if (orphStep === 1) {
        setOrpheusSprite(orpheusFrames[1]);
        orphStep++;
        setTimeout(runOrph, 120);
      } else if (orphStep === 2) {
        setOrpheusSprite(orpheusFrames[2]);
        playSpellEffect('fire', 60);
        triggerShadowHit();
        orphStep++;
        setTimeout(runOrph, 120);
      } else if (orphStep === 3) {
        setOrpheusSprite(orpheusFrames[3]);
        orphStep++;
        setTimeout(runOrph, 800); // Hold frame 4 longer
      } else if (orphStep === 4) {
        setOrpheusSprite(orpheusFrames[2]);
        orphStep++;
        setTimeout(runOrph, 120);
      } else if (orphStep === 5) {
        setOrpheusSprite(orpheusFrames[1]);
        orphStep++;
        setTimeout(runOrph, 120);
      } else if (orphStep === 6) {
        setOrpheusSprite(orpheusFrames[0]);
        setOrpheusActive(false);
      }
    };
    runOrph();
  };

  const triggerCallPersona = () => {
    clearSighAnimation();
    cleanupMcAnimation();
    combatLockRef.current = true;
    setCombatLock(true);
    setMCLunge(true);
    setMCState('call');
    setMcEmo('/images/MC_emo/mc_surprise_emo.png');

    const callFrames = [
      '/images/MC/call_persona1.png',
      '/images/MC/call_persona2.png',
      '/images/MC/call_persona3.png',
      '/images/MC/call_persona4.png',
      '/images/MC/call_persona5.png'
    ];
    let currentFrame = 0;

    mcAnimTimerRef.current = setInterval(() => {
      if (currentFrame < callFrames.length) {
        setMCSprite(callFrames[currentFrame]);
        if (currentFrame === 3) {
          flashScreen('cyan');
          setMCShake(true);
          setTimeout(() => setMCShake(false), 300);
          playOrpheusSummon();
        }
        currentFrame++;
      } else {
        clearInterval(mcAnimTimerRef.current);
        mcAnimTimerRef.current = null;
        setTimeout(() => {
          setMCLunge(false);
          setTimeout(() => {
            combatLockRef.current = false;
            setCombatLock(false);
            setMcEmo('/images/MC_emo/mc_idle_emo.png');
            setMCState('idle');
          }, 200);
        }, 1500); // Hold Pose
      }
    }, 195);
  };

  const triggerTarotAttack = () => {
    clearSighAnimation();
    cleanupMcAnimation();
    combatLockRef.current = true;
    setCombatLock(true);
    setMCLunge(true);
    setMCState('tarot');

    const tarotFrames = [
      '/images/MC/tarot_attack1.png',
      '/images/MC/tarot_attack2.png',
      '/images/MC/tarot_attack3.png',
      '/images/MC/tarot_attack4.png',
      '/images/MC/tarot_attack5.png',
      '/images/MC/tarot_attack6.png',
      '/images/MC/tarot_attack7.png'
    ];
    let currentFrame = 0;

    mcAnimTimerRef.current = setInterval(() => {
      if (currentFrame < tarotFrames.length) {
        setMCSprite(tarotFrames[currentFrame]);
        if (currentFrame === 5) {
          flashScreen('magenta');
          playSpellEffect('slash', 50);
          triggerShadowHit();
        }
        currentFrame++;
      } else {
        clearInterval(mcAnimTimerRef.current);
        mcAnimTimerRef.current = null;
        setMCLunge(false);
        setTimeout(() => {
          combatLockRef.current = false;
          setCombatLock(false);
          setMCState('idle');
        }, 200);
      }
    }, 110);
  };

  const triggerShadowAttack = () => {
    clearSighAnimation();
    cleanupShadowAnimation();
    combatLockRef.current = true;
    setCombatLock(true);
    setShadowLunge(true);
    setShadowState('attack');

    const shadowAtkFrames = [
      '/images/Shadow/Shad_mud1/mud_attack/mud_attack1.png',
      '/images/Shadow/Shad_mud1/mud_attack/mud_attack2.png',
      '/images/Shadow/Shad_mud1/mud_attack/mud_attack3.png',
      '/images/Shadow/Shad_mud1/mud_attack/mud_attack4.png'
    ];
    let currentFrame = 0;

    shadowAnimTimerRef.current = setInterval(() => {
      if (currentFrame < shadowAtkFrames.length) {
        setShadowSprite(shadowAtkFrames[currentFrame]);
        if (currentFrame === 2) {
          flashScreen('magenta');
          setMCShake(true);
          setMcHitBack(true);
          setMcEmo('/images/MC_emo/mc_hurt_emo.png');
          setHudShake(true);

          setTimeout(() => {
            setMCShake(false);
            setMcHitBack(false);
            setHudShake(false);
          }, 300);
        }
        currentFrame++;
      } else {
        clearInterval(shadowAnimTimerRef.current);
        shadowAnimTimerRef.current = null;
        setShadowLunge(false);
        setTimeout(() => {
          combatLockRef.current = false;
          setCombatLock(false);
          setMcEmo('/images/MC_emo/mc_idle_emo.png');
          setShadowState('idle');
        }, 200);
      }
    }, 150);
  };

  const triggerShadowDefeat = () => {
    clearSighAnimation();
    setCombatLock(true);
    setShadowState('defeated');

    const shadowDefFrames = [
      '/images/Shadow/Shad_mud1/mud_defeated/ mud_defeated1.png',
      '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated2.png',
      '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated3.png',
      '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated4.png',
      '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated5.png',
      '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated6.png',
      '/images/Shadow/Shad_mud1/mud_defeated/mud_defeated7.png'
    ];
    let currentFrame = 0;

    const timer = setInterval(() => {
      if (currentFrame < shadowDefFrames.length) {
        setShadowSprite(shadowDefFrames[currentFrame]);
        currentFrame++;
      } else {
        clearInterval(timer);
      }
    }, 150);
  };

  return (
    <div className="battle-container">
      <div className={`flash-overlay ${screenFlash} ${screenFlash !== 'none' ? 'active' : ''}`}></div>

      {/* RPG Combat Stage Layer (Full Screen behind HUDs) */}
      <div className="battle-arena-stage">
        <div className={`orpheus-container ${orpheusActive ? 'active' : ''}`}>
          <img className="orpheus-sprite" src={orpheusSprite} alt="Orpheus Persona" />
        </div>

        <div className="mc-stage-container">
          <div className={`mc-character-wrapper ${mcLunge ? 'mc-lunge-forward' : ''} ${mcHitBack ? 'mc-hit-back' : ''}`}>
            <div className={`sigh-bubble ${sighBubbleActive ? 'show' : ''}`}>...Haa</div>
            <img className={`mc-sprite ${mcShake ? 'shake-impact' : ''}`} src={mcSprite} alt="Hero Battle Sprite" />
            <div className="mc-shadow-plate"></div>
          </div>
        </div>

        <div className="shadow-stage-container">
          <div className={`shadow-wrapper ${shadowLunge ? 'shadow-lunge-left' : ''} ${shadowHitBack ? 'shadow-hit-back' : ''}`}>
            <div className="effect-container">
              <img className={`effect-sprite ${effectActive ? 'active' : ''}`} src={effectSprite} alt="Attack Effect" />
            </div>
            <img className={`shadow-sprite ${shadowShake ? 'shake-impact' : ''}`} src={shadowSprite} alt="Shadow Sprite" />
            <div className="shadow-shadow-plate"></div>
          </div>
        </div>
      </div>

      <div className="top-arena">
        <div className="battle-status-overlay" style={{ justifyContent: activeMode === 'story' ? 'space-between' : 'flex-end' }}>
          {activeMode === 'story' && (
            <div className="hp-panel">
              <div className="hp-panel-inner">
                <span className="hp-label">
                  <span>S.E.E.S Hero</span>
                  <span style={{ fontFamily: 'var(--font-game)' }}>{playerHP}/{playerMaxHP}</span>
                </span>
                <div className="hp-bar-outer">
                  <div className="hp-bar-fill" style={{ width: `${(playerHP / playerMaxHP) * 100}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'story' ? (
            <div className="hp-panel enemy-bar">
              <div className="hp-panel-inner">
                <span className="hp-label">
                  <span>{enemyType.toUpperCase()}</span>
                  <span style={{ fontFamily: 'var(--font-game)' }}>{enemyHP}/{enemyMaxHP}</span>
                </span>
                <div className="hp-bar-outer">
                  <div className="hp-bar-fill" style={{ width: `${(enemyHP / enemyMaxHP) * 100}%` }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hp-panel" style={{ borderColor: 'var(--color-yellow)' }}>
              <div className="hp-panel-inner">
                <span className="hp-label" style={{ color: 'var(--color-yellow)' }}>
                  <span>SCORE</span>
                  <span>{roundScore}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bottom-arena">


        <div className={`hud-face-frame ${hudShake ? 'shake-impact' : ''}`}>
          <img className="hud-face-img" src={mcEmo} alt="MC Status Face" />
        </div>

        <div className="quiz-panel">
          <div className={`input-preview-row ${inputErrorShake ? 'anim-damage' : ''}`}>
            <div className="input-preview-inner">
              {inputWord.length === 0 ? (
                <span style={{ color: 'var(--color-text-dim)', fontStyle: 'italic' }}>
                  Type or tap letters to solve...
                </span>
              ) : (
                inputWord.map((tile) => (
                  <span
                    key={tile.id}
                    className="scrabble-tile"
                    style={{ width: '40px', height: '40px', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 2px 0 #ca8a04' }}
                    onClick={() => !isLocked && handleReturnTile(tile)}
                  >
                    {tile.char}
                  </span>
                ))
              )}
            </div>
            
            {streakCount > 0 && (
              <span className="streak-combo-hud">
                STREAK: {streakCount} 🔥
              </span>
            )}

            <span className="possible-count-label">
              SOLVED: {solvedAnswers.length} / {validAnswersPool.length}
            </span>
          </div>

          <div className="letters-keyboard">
            {lettersPool.map((tile) => (
              <button
                key={tile.id}
                className="scrabble-tile"
                disabled={tile.used || isLocked}
                onClick={() => handleSelectTile(tile)}
              >
                {tile.char}
                <span className="tile-score">
                  {LETTER_POINTS[tile.char.toLowerCase()] || 1}
                </span>
              </button>
            ))}
          </div>

          <div className="arena-actions-deck" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '5px' }}>
            <button 
              className="p3-btn btn-red" 
              style={{ padding: '8px 15px', fontSize: '0.85rem', borderColor: 'var(--color-red)' }} 
              onClick={handleRetreat}
              disabled={isLocked}
            >
              Retreat
            </button>
            <button 
              className="p3-btn" 
              style={{ padding: '8px 15px', fontSize: '0.85rem', borderColor: 'var(--color-yellow)' }} 
              onClick={handleSkip}
              disabled={isLocked}
            >
              Skip
            </button>
            <button 
              className="p3-btn" 
              style={{ padding: '8px 15px', fontSize: '0.85rem', borderColor: 'var(--color-text-dim)' }} 
              onClick={clearInput}
              disabled={isLocked}
            >
              Reset
            </button>
            <button 
              className="p3-btn" 
              style={{ padding: '8px 15px', fontSize: '0.85rem' }} 
              onClick={submitInputWord}
              disabled={isLocked}
            >
              Submit
            </button>
          </div>
        </div>

        <div className="timers-panel">
          <div className="moon-timer-wrapper">
            <svg className="moon-timer-svg" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke={activeMode === 'story' ? 'var(--color-cyan)' : 'var(--color-red)'}
                strokeWidth="3"
                strokeDasharray="100 100"
                strokeDashoffset={100 - (timeLeft / roundLimit) * 100}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <span className="moon-timer-text">{timeLeft}</span>
          </div>

          <div className="dusk-bar-container">
            <p className="dusk-bar-label">
              {activeMode === 'story' ? 'Enemy Attack Countdown' : 'Practice Clock'}
            </p>
            <div className="dusk-bar-outer">
              <div
                className="dusk-bar-fill"
                style={{ width: `${(timeLeft / roundLimit) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattleArena;