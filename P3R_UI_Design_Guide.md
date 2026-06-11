# Persona 3 Reload UI Design Guide 🌕⚔️

This guide documents the official UI design patterns, CSS specifications, and React animation state templates created for **Anagram Quiz: Full Moon**. Refer to this document when implementing styled components in your main game files.

---

## 1. Slanted Polygon Button (Pre-Order Style)
A double-layered button featuring non-parallel skewed edges constructed using CSS clip-paths.

### 🌐 HTML Structure
```html
<button class="p3r-polygon-btn">
  <!-- The dark back shadow box -->
  <span class="poly-back-shadow"></span>
  
  <!-- The front active clickable box -->
  <span class="poly-front-border">
    <span class="poly-front-fill">
      <span class="poly-text">Pre-Order Now</span>
    </span>
  </span>
</button>
```

### 🎨 CSS Styling
```css
.p3r-polygon-btn {
  width: 100%;
  height: 60px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  outline: none;
  box-shadow: none;
}

/* Static hover sensor shield to prevent oscillation flicker on button edges */
.p3r-polygon-btn::before {
  content: '';
  position: absolute;
  top: -20%;
  left: -5%;
  width: 110%;
  height: 120%;
  background: transparent;
  z-index: 1;
}

/* --- BACK SHADOW LAYER (Navy Blue) --- */
.poly-back-shadow {
  z-index: 2;
  position: absolute;
  top: -20%;
  left: -10%;
  width: 120%;
  height: 140%;
  background: transparent; /* Transparent when not hovered */
  clip-path: polygon(18% 5%, 95% 0%, 75% 90%, 7% 75%);
  transition: background 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  transform: translateZ(0); /* Forces GPU compositing layer to prevent flickering */
  pointer-events: none; /* Mouse passes through */
}

/* --- FRONT ACTIVE LAYER (Cyan) --- */
.poly-front-border {
  z-index: 3;
  position: absolute;
  top: -6px; /* Offset spacing */
  left: -6px;
  width: 100%;
  height: 100%;
  background: #000; /* Black outline */
  clip-path: polygon(15% 0%, 98% 0%, 80% 100%, 0% 100%);
  transition: top 0.2s cubic-bezier(0.25, 1, 0.5, 1), left 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  transform: translateZ(0);
}

.poly-front-fill {
  position: absolute;
  top: 3px; left: 3px; right: 3px; bottom: 3px;
  background: #7bf1f1; /* Cyan background fill */
  clip-path: polygon(15% 0%, 98% 0%, 80% 100%, 0% 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  transform: translateZ(0);
}

.poly-text {
  color: #000;
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-style: italic;
  font-size: 1.25rem;
  letter-spacing: 2px;
}

/* --- HOVER INTERACTIONS --- */
.p3r-polygon-btn:hover .poly-front-border {
  top: -2px; /* Moves down closer to the shadow layer */
  left: -2px;
}

.p3r-polygon-btn:hover .poly-front-fill {
  background: #ffffff; /* Snaps to solid white */
}

.p3r-polygon-btn:hover .poly-back-shadow {
  background: #ff0055; /* Shadow pops into neon magenta highlight */
}
```

---

## 2. Square Double-Layer Button (Version Selector Style)
A flat rectangular button that features an offset shadow box popping out behind it when selected (`active`).

### 🌐 HTML Structure
```html
<button class="p3r-rect-btn active">
  <span class="rect-back-shadow"></span>
  <span class="rect-front-fill">Digital</span>
</button>
```

### 🎨 CSS Styling
```css
.p3r-rect-btn {
  flex: 1;
  height: 48px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  outline: none;
  box-shadow: none;
}

/* --- BACK SHADOW LAYER (Red on Active) --- */
.rect-back-shadow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border: 3px solid transparent;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  transform: translateZ(0);
  pointer-events: none;
}

/* --- FRONT ACTIVE LAYER --- */
.rect-front-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #080d24; /* Deep midnight blue */
  border: 3px solid #101940; /* Dark blue outline border */
  border-radius: 6px;
  color: #00e5ff; /* Cyan label text */
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  transform: translateZ(0);
}

/* --- HOVER (NORMAL STATE) --- */
.p3r-rect-btn:hover .rect-front-fill {
  border-color: #ffffff;
  color: #ffffff;
}

/* --- ACTIVE STATE (SELECTED) --- */
.p3r-rect-btn.active .rect-back-shadow {
  top: -5px; /* y = -5px (shifts up) */
  left: 5px; /* x = 5px (shifts right) */
  background: #ff0055; /* Magenta/Red fill */
  border: 3px solid #000000; /* Black outline outline border */
  box-shadow: 0 4px 10px rgba(255, 0, 85, 0.2);
}

.p3r-rect-btn.active .rect-front-fill {
  background: #ffffff; /* Turns solid white */
  color: #000000; /* Turns text solid black */
  border-color: #ffffff;
}
```

---

## 3. Kotone Shiomi Combat Animation Sequence
Details how to cycle individual animation frame PNGs on a timeline when an anagram is solved.

### 🌐 JSX Character Node
```jsx
<div className={`combat-sprite ${heroHit ? 'sprite-damaged-shake' : ''}`}>
  <img 
    src={heroSprite} 
    alt="Kotone Shiomi" 
    style={{ height: '170px', width: 'auto', objectFit: 'contain' }} 
  />
  <div className="sprite-shadow"></div>
</div>
```

### 📝 React Handler Sequence
```javascript
import kotoneIdle from './assets/kotone_battle_idle.png';
import kotoneAim from './assets/kotone_battle_aim.png';
import kotoneShoot from './assets/kotone_battle_shoot.png';

// State hook
const [heroSprite, setHeroSprite] = useState(kotoneIdle);

// Firing handler
const triggerEvokerAttack = () => {
  // 1. Aim Evoker (0ms to 250ms)
  setHeroSprite(kotoneAim);
  
  setTimeout(() => {
    // 2. Shoot Evoker (250ms to 550ms)
    setHeroSprite(kotoneShoot);
    
    // Trigger shadow damage shake
    setEnemyHit(true);
    setTimeout(() => setEnemyHit(false), 300);

    setTimeout(() => {
      // 3. Return to Idle Stance (after 550ms)
      setHeroSprite(kotoneIdle);
    }, 300);
  }, 250);
};
```
