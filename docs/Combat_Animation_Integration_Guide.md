# Combat Animation React Integration Guide 🌕⚔️

This guide explains how to port the combat sprites and animation code from the sandbox playground into the main React + Vite client of **Anagram Quiz: Full Moon**.

---

## 1. Directory Setup & Asset Copying

To keep the project clean, create separate subfolders for the MC and Shadow assets:

### 📂 Folder Mapping
*   **MC Sprites**: Copy all PNG files from the sandbox `MC/` folder into:
    `D:\Anagram-quiz-full-moon\client\src\assets\characters\mc\`
*   **Shadow Sprites**: Copy all PNG files from the sandbox `Shadow/Shad_mud1/` subdirectories into:
    `D:\Anagram-quiz-full-moon\client\src\assets\characters\shadow\`

---

## 2. React Code Integration (`App.jsx`)

### 1️⃣ Import Statements
Add these imports at the top of [App.jsx](file:///D:/Anagram-quiz-full-moon/client/src/App.jsx):

```javascript
// MC Frame Imports
import mcIdle1 from './assets/characters/mc/idle1.png';
import mcIdle2 from './assets/characters/mc/idle2.png';
import mcSigh1 from './assets/characters/mc/sigh1.png';
import mcSigh2 from './assets/characters/mc/sigh2.png';
import mcSigh3 from './assets/characters/mc/sigh3.png';
import mcSigh4 from './assets/characters/mc/sigh4.png';
import mcCall1 from './assets/characters/mc/call_persona1.png';
import mcCall2 from './assets/characters/mc/call_persona2.png';
import mcCall3 from './assets/characters/mc/call_persona3.png';
import mcCall4 from './assets/characters/mc/call_persona4.png';
import mcCall5 from './assets/characters/mc/call_persona5.png';
import mcTarot1 from './assets/characters/mc/tarot_attack1.png';
import mcTarot2 from './assets/characters/mc/tarot_attack2.png';
import mcTarot3 from './assets/characters/mc/tarot_attack3.png';
import mcTarot4 from './assets/characters/mc/tarot_attack4.png';
import mcTarot5 from './assets/characters/mc/tarot_attack5.png';
import mcTarot6 from './assets/characters/mc/tarot_attack6.png';
import mcTarot7 from './assets/characters/mc/tarot_attack7.png';

// Shadow Frame Imports
import shadowIdle1 from './assets/characters/shadow/Idle_loop/Idle1mud.png';
import shadowIdle2 from './assets/characters/shadow/Idle_loop/Idle2mud.png';
import shadowIdle3 from './assets/characters/shadow/Idle_loop/Idle3mud.png';
import shadowHit1 from './assets/characters/shadow/being_hit_loop/being_hit1mud.png';
import shadowHit2 from './assets/characters/shadow/being_hit_loop/being_hit2mud.png';
import shadowAtk1 from './assets/characters/shadow/mud_attack/mud_attack1.png';
import shadowAtk2 from './assets/characters/shadow/mud_attack/mud_attack2.png';
import shadowAtk3 from './assets/characters/shadow/mud_attack/mud_attack3.png';
import shadowAtk4 from './assets/characters/shadow/mud_attack/mud_attack4.png';
import shadowDef1 from './assets/characters/shadow/mud_defeated/ mud_defeated1.png'; // note the leading space
import shadowDef2 from './assets/characters/shadow/mud_defeated/mud_defeated2.png';
import shadowDef3 from './assets/characters/shadow/mud_defeated/mud_defeated3.png';
import shadowDef4 from './assets/characters/shadow/mud_defeated/mud_defeated4.png';
import shadowDef5 from './assets/characters/shadow/mud_defeated/mud_defeated5.png';
import shadowDef6 from './assets/characters/shadow/mud_defeated/mud_defeated6.png';
import shadowDef7 from './assets/characters/shadow/mud_defeated/mud_defeated7.png';
```

### 2️⃣ State Declarations
Insert these states inside the `App` component to handle active sprites, animations, lunge offsets, and lockouts:

```javascript
// Active Sprite States
const [mcSprite, setMCSprite] = useState(mcIdle1);
const [shadowSprite, setShadowSprite] = useState(shadowIdle1);

// State Engines ('idle' | 'sigh' | 'call' | 'tarot' | 'hit' | 'dead')
const [mcState, setMCState] = useState('idle');
const [shadowState, setShadowState] = useState('idle');

// Layout Offset/Lunge States
const [mcLunge, setMCLunge] = useState(false);
const [shadowLunge, setShadowLunge] = useState(false);
const [shadowHitBack, setShadowHitBack] = useState(false);

// Shake Trigger States
const [mcShake, setMCShake] = useState(false);
const [shadowShake, setShadowShake] = useState(false);

// Screen Flash State ('none' | 'cyan' | 'magenta')
const [screenFlash, setScreenFlash] = useState('none');

// Rule 6 Lockout (disables keyboard tiles & action buttons during combat)
const [combatLock, setCombatLock] = useState(false);
```

### 3️⃣ Auto-Loopers (`useEffect`)
Add these side-effects to run the background idle oscillations and the rare MC sigh:

```javascript
// 1. MC Idle Animation loop (Alternates frames 1 and 2 every 1125ms)
useEffect(() => {
  if (mcState !== 'idle') return;
  let frame = 0;
  const timer = setInterval(() => {
    frame = 1 - frame;
    setMCSprite(frame === 0 ? mcIdle1 : mcIdle2);
  }, 1125);
  return () => clearInterval(timer);
}, [mcState]);

// 2. Shadow Idle Animation loop (Cycles frames 1, 2, and 3 every 350ms)
useEffect(() => {
  if (shadowState !== 'idle') return;
  const idleFrames = [shadowIdle1, shadowIdle2, shadowIdle3];
  let frame = 0;
  const timer = setInterval(() => {
    frame = (frame + 1) % 3;
    setShadowSprite(idleFrames[frame]);
  }, 350);
  return () => clearInterval(timer);
}, [shadowState]);

// 3. MC Sigh loop (Triggers every 5 seconds if idle)
useEffect(() => {
  const sighFrames = [mcSigh1, mcSigh2, mcSigh3, mcSigh4];
  const checkInterval = setInterval(() => {
    if (mcState === 'idle') {
      setMCState('sigh');
      let currentFrame = 0;
      
      const animateSigh = setInterval(() => {
        if (currentFrame < sighFrames.length) {
          setMCSprite(sighFrames[currentFrame]);
          currentFrame++;
        } else {
          clearInterval(animateSigh);
          setMCState('idle');
        }
      }, 200);
    }
  }, 5000);

  return () => clearInterval(checkInterval);
}, [mcState]);
```

### 4️⃣ Combat Timeline Triggers
Define these functions to execute custom frame-by-frame sequences:

```javascript
// Trigger Screen Flash helper
const flashScreen = (color) => {
  setScreenFlash(color);
  setTimeout(() => setScreenFlash('none'), 80);
};

// Shadow Hit Reaction Timeline
const playShadowHitReaction = () => {
  setShadowState('hit');
  setShadowHitBack(true);
  setShadowShake(true);

  const hitFrames = [shadowHit1, shadowHit2, shadowHit1, shadowHit2];
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

// MC Call Persona Attack Timeline
const triggerCallPersona = () => {
  setCombatLock(true); // Rule 6 lockout
  setMCLunge(true);
  setMCState('call');

  const callFrames = [mcCall1, mcCall2, mcCall3, mcCall4, mcCall5];
  let currentFrame = 0;

  const timer = setInterval(() => {
    if (currentFrame < callFrames.length) {
      setMCSprite(callFrames[currentFrame]);
      
      // Impact Frame Sync
      if (currentFrame === 3) {
        flashScreen('cyan');
        setMCShake(true);
        setTimeout(() => setMCShake(false), 300);
        playShadowHitReaction(); // Wait-and-react hit triggered on shadow!
      }
      currentFrame++;
    } else {
      clearInterval(timer);
      // Hold final summon frame for 1.5 seconds (1500ms)
      setTimeout(() => {
        setMCLunge(false);
        setTimeout(() => {
          setCombatLock(false);
          setMCState('idle');
        }, 200);
      }, 1500);
    }
  }, 195);
};

// MC Tarot Attack Timeline
const triggerTarotAttack = () => {
  setCombatLock(true);
  setMCLunge(true);
  setMCState('tarot');

  const tarotFrames = [mcTarot1, mcTarot2, mcTarot3, mcTarot4, mcTarot5, mcTarot6, mcTarot7];
  let currentFrame = 0;

  const timer = setInterval(() => {
    if (currentFrame < tarotFrames.length) {
      setMCSprite(tarotFrames[currentFrame]);
      
      // Impact Frame Sync
      if (currentFrame === 5) {
        flashScreen('magenta');
        playShadowHitReaction();
      }
      currentFrame++;
    } else {
      clearInterval(timer);
      // Immediate slide-back
      setMCLunge(false);
      setTimeout(() => {
        setCombatLock(false);
        setMCState('idle');
      }, 200);
    }
  }, 110);
};
```

---

## 3. Style Upgrades (`index.css`)

Add these classes to [index.css](file:///D:/Anagram-quiz-full-moon/client/src/index.css) to support positioning, lunging, and shaking:

```css
/* Screen Flash Overlays */
.flash-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 99;
  opacity: 0;
  transition: opacity 0.05s ease-out;
}
.flash-overlay.cyan { background: rgba(0, 229, 255, 0.45); }
.flash-overlay.magenta { background: rgba(255, 0, 85, 0.45); }
.flash-overlay.active { opacity: 1; }

/* Arena Positioning Stage */
.mc-stage {
  position: absolute;
  left: 15%; bottom: 15%;
  width: 250px; height: 380px;
  display: flex; justify-content: center; align-items: flex-end;
  z-index: 5;
}

.shadow-stage {
  position: absolute;
  right: 15%; bottom: 15%;
  width: 250px; height: 380px;
  display: flex; justify-content: center; align-items: flex-end;
  z-index: 5;
}

/* Character Sprite Containers */
.character-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.15s cubic-bezier(0.25, 1, 0.5, 1);
  transform-origin: bottom center;
}

/* Character Sprites */
.mc-sprite-img {
  height: 350px; width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(0, 229, 255, 0.4));
  image-rendering: pixelated;
}

.shadow-sprite-img {
  height: 250px; width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(255, 0, 85, 0.45));
  image-rendering: pixelated;
}

/* Dynamic Lunge and Hit Classes */
.mc-lunge {
  transform: translateX(80px) scale(1.05);
}

.shadow-lunge {
  transform: translateX(-80px) scale(1.05);
}

.shadow-recoil {
  transform: translateX(30px) rotate(3deg);
}

/* Shake Animation (Apply directly to <img> to avoid conflict) */
.shake-impact {
  animation: sprite-shake 0.3s ease-in-out;
}

@keyframes sprite-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px) rotate(-1deg); }
  40%, 80% { transform: translateX(8px) rotate(1deg); }
}
```
