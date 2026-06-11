import React, { useState, useEffect, useRef } from 'react'
import StartScreen from './components/StartScreen'
import Lobby from './components/Lobby'
import PrepScreen from './components/PrepScreen'
import BattleArena from './components/BattleArena'
import ResultScreen from './components/ResultScreen'

// Scrabble tile points distribution
const LETTER_POINTS = {
  a:1, b:3, c:3, d:2, e:1, f:4, g:2, h:4, i:1, j:8, k:5, l:1, m:3,
  n:1, o:1, p:3, q:10, r:1, s:1, t:1, u:1, v:4, w:4, x:8, y:4, z:10
}

function App() {
  // Views: 'start' | 'lobby' | 'story-prep' | 'classic-prep' | 'battle' | 'result'
  const [view, setView] = useState('start')
  const [activeModal, setActiveModal] = useState(null)
  const [activeMode, setActiveMode] = useState('story') // 'story' | 'classic'
  const [classicLength, setClassicLength] = useState(3)

  // Session user profile
  const [user, setUser] = useState(null)
  const [currentFloor, setCurrentFloor] = useState(1)

  // Auth field bindings
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // ==========================================
  // CORE GAMEPLAY STATES
  // ==========================================
  const [battleWords, setBattleWords] = useState([])     // Story recipe words OR Classic active word
  const [wordIndex, setWordIndex] = useState(0)          // Story current word index in chain
  const [playerHP, setPlayerHP] = useState(100)
  const [playerMaxHP, setPlayerMaxHP] = useState(100)
  const [enemyHP, setEnemyHP] = useState(50)
  const [enemyMaxHP, setEnemyMaxHP] = useState(50)
  const [enemyType, setEnemyType] = useState('shadow')   // 'shadow' | 'miniboss' | 'boss'
  const [damageConfig, setDamageConfig] = useState({})

  // Timers
  const [timeLeft, setTimeLeft] = useState(45)           // Round countdown timer
  const [roundLimit, setRoundLimit] = useState(45)       // Max time for circular calculations
  const [globalTimeLeft, setGlobalTimeLeft] = useState(60) // Classic mode 60s total timer
  const [battleTimeElapsed, setBattleTimeElapsed] = useState(0) // Story mode total battle timer

  // Streak
  const [streakCount, setStreakCount] = useState(0)             // Tracks consecutive solved words
  const [accumulatedMissed, setAccumulatedMissed] = useState([]) // Collects skipped words

  // Letter input selection
  const [lettersPool, setLettersPool] = useState([])     // Remaining keyboard letters: { id, char, used }
  const [inputWord, setInputWord] = useState([])         // Characters typed: [{ id, char }]
  const [solvedAnswers, setSolvedAnswers] = useState([]) // Correctly submitted answers for this signature
  const [validAnswersPool, setValidAnswersPool] = useState([]) // Valid matching anagrams array
  
  // Game metrics
  const [roundScore, setRoundScore] = useState(0)
  const [missedWordsList, setMissedWordsList] = useState([])
  const [resultTab, setResultTab] = useState('leaderboard') // 'leaderboard' | 'missed'
  const [leaderboardData, setLeaderboardData] = useState([])

  // Visual Animation Triggers
  const [heroHit, setHeroHit] = useState(false)
  const [enemyHit, setEnemyHit] = useState(false)
  const [evokerAim, setEvokerAim] = useState(false)
  const [evokerFlash, setEvokerFlash] = useState(false)
  const [enemyLunge, setEnemyLunge] = useState(false)
  const [inputErrorShake, setInputErrorShake] = useState(false)

  // Timer reference to clear loops
  const gameIntervalRef = useRef(null)

  // Refs to prevent stale closures inside the setInterval timer callbacks
  const validAnswersPoolRef = useRef(validAnswersPool)
  const solvedAnswersRef = useRef(solvedAnswers)
  const accumulatedMissedRef = useRef(accumulatedMissed)
  const roundScoreRef = useRef(roundScore)
  const globalTimeLeftRef = useRef(globalTimeLeft)
  const classicLengthRef = useRef(classicLength)
  const currentFloorRef = useRef(currentFloor)
  const enemyHPRef = useRef(enemyHP)
  const playerHPRef = useRef(playerHP)
  const timeLeftRef = useRef(timeLeft)
  const isClassicEndingRef = useRef(false)
  const isStoryEndingRef = useRef(false)
  // Sync refs with state on every render
  validAnswersPoolRef.current = validAnswersPool
  solvedAnswersRef.current = solvedAnswers
  accumulatedMissedRef.current = accumulatedMissed
  roundScoreRef.current = roundScore
  globalTimeLeftRef.current = globalTimeLeft
  classicLengthRef.current = classicLength
  currentFloorRef.current = currentFloor
  enemyHPRef.current = enemyHP
  playerHPRef.current = playerHP
  timeLeftRef.current = timeLeft

  const resetForm = () => {
    setUsername('')
    setPin('')
    setConfirmPin('')
    setErrorMsg('')
    setSuccessMsg('')
  }

  const openModal = (type) => {
    resetForm()
    setActiveModal(type)
  }

  const validateForm = (isRegister) => {
    const cleanUser = username.trim()
    const usernameRegex = /^[a-zA-Z0-9 _-]{2,15}$/
    if (!cleanUser) {
      setErrorMsg('Username is required.')
      return false
    }
    if (!usernameRegex.test(cleanUser)) {
      setErrorMsg('Username must be 2-15 characters and contain only letters, numbers, spaces, hyphens, or underscores.')
      return false
    }
    if (!/^\d{4}$/.test(pin)) {
      setErrorMsg('PIN must be exactly 4 numeric digits.')
      return false
    }
    if (isRegister && pin !== confirmPin) {
      setErrorMsg('PIN and Confirm PIN do not match.')
      return false
    }
    return true
  }

  const fetchUserFloor = async (name) => {
    try {
      const response = await fetch(`/api/story?username=${encodeURIComponent(name)}`)
      const data = await response.json()
      if (response.ok && data.currentFloor) {
        setCurrentFloor(data.currentFloor)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (validateForm(true) !== true) return
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), pin })
      })
      if (!response.ok) throw new Error((await response.json()).error || 'Failed')
      setSuccessMsg('Registration successful!')
      setTimeout(() => openModal('login'), 1500)
    } catch (err) { setErrorMsg(err.message) } finally { setLoading(false) }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (validateForm(false) !== true) return
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), pin })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed')
      setUser(data.user)
      await fetchUserFloor(data.user.username)
      setView('lobby')
      setActiveModal(null)
    } catch (err) { setErrorMsg(err.message) } finally { setLoading(false) }
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentFloor(1)
    setView('start')
  }

    // Handle battle retreat / give up action
  const handleRetreat = () => {
    if (window.confirm('Do you want to retreat? (Any current battle progress will be lost)')) {
      clearInterval(gameIntervalRef.current) // Stop active countdown clocks
      setView('lobby')                       // Return to main lobby view
    }
  }

    // Handle skipping the current word challenge
  const handleSkip = async () => {
    // 1. Gather all unsolved anagrams for the current word
    const unsolved = validAnswersPool.filter((w) => !solvedAnswers.includes(w.toUpperCase()))
    setAccumulatedMissed((prev) => [...prev, ...unsolved])
    accumulatedMissedRef.current = [...accumulatedMissedRef.current, ...unsolved] // Update synchronously!

    // 2. Breaking the chain resets the solve streak to 0
    setStreakCount(0)

    if (activeMode === 'story') {
      // Story Mode Penalty: Deduct 5 HP
      const nextHP = playerHP - 5
      setPlayerHP(nextHP)
      playerHPRef.current = nextHP // Update synchronously!

      if (nextHP <= 0) {
        // Player dies from skipping
        await endStoryBattle(false)
      } else {
        clearInput()
        await moveToNextStoryWord()
      }
    } else {
      // Classic Mode Penalty: Deduct 5 seconds from the clocks
      const nextTime = Math.max(0, globalTimeLeft - 5)
      setGlobalTimeLeft(nextTime)
      setTimeLeft(nextTime)
      globalTimeLeftRef.current = nextTime // Update synchronously!
      timeLeftRef.current = nextTime // Update synchronously!

      if (nextTime <= 0) {
        // Out of time from skipping
        await endClassicRound()
      } else {
        clearInput()
        await loadClassicChallenge()
      }
    }
  }

  const getMoonPhase = (floor) => {
    if (floor >= 50) return { label: 'Full Moon 🌕', shadowOffset: 0 }
    if (floor >= 38) return { label: 'Waxing Gibbous 🌖', shadowOffset: -30 }
    if (floor >= 25) return { label: 'First Quarter 🌗', shadowOffset: -60 }
    if (floor >= 13) return { label: 'Waxing Crescent 🌘', shadowOffset: -90 }
    return { label: 'New Moon 🌑', shadowOffset: -120 }
  }

  // ==========================================
  // GAME SETUP & INIT
  // ==========================================
  const startBattle = async () => {
    setErrorMsg('')
    setRoundScore(0)
    setMissedWordsList([])
    setSolvedAnswers([])
    setBattleTimeElapsed(0) // Reset combat stopwatch
    setStreakCount(0)        // Reset solve streak combo
    setAccumulatedMissed([]) // Clear previous skipped words
    
    // Reset refs synchronously for the new session
    roundScoreRef.current = 0
    solvedAnswersRef.current = []
    accumulatedMissedRef.current = []
    isClassicEndingRef.current = false
    isStoryEndingRef.current = false

    if (activeMode === 'story') {
      try {
        const res = await fetch(`/api/story?username=${encodeURIComponent(user.username)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        if (data.gameCleared) {
          setActiveModal('gameCleared')
          setView('lobby')
          return
        }

        setBattleWords(data.battleWords)
        setWordIndex(0)
        setPlayerHP(data.playerMaxHP)
        setPlayerMaxHP(data.playerMaxHP)
        setEnemyHP(data.enemyMaxHP)
        setEnemyMaxHP(data.enemyMaxHP)
        setEnemyType(data.enemyType)
        setTimeLeft(data.timeLimit)
        setRoundLimit(data.timeLimit)
        setDamageConfig(data.damageConfig)
        
        playerHPRef.current = data.playerMaxHP
        enemyHPRef.current = data.enemyMaxHP
        timeLeftRef.current = data.timeLimit

        // Setup first word signature letters
        setupWordChallenge(data.battleWords[0])
        setView('battle')
      } catch (err) {
        alert('Failed loading battle: ' + err.message)
        setView('lobby')
      }
    } else {
      // Classic Practice setup
      setPlayerHP(100)
      setPlayerMaxHP(100)
      setEnemyHP(1) // Dummy HP for practice
      setEnemyMaxHP(1)
      setEnemyType('shadow')
      setGlobalTimeLeft(60)
      setTimeLeft(60) // 60s total timer
      setRoundLimit(60)
      
      playerHPRef.current = 100
      enemyHPRef.current = 1
      globalTimeLeftRef.current = 60
      timeLeftRef.current = 60

      await loadClassicChallenge()
      setView('battle')
    }
  }

  const loadClassicChallenge = async () => {
    try {
      const res = await fetch(`/api/challenge?length=${classicLength}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // In classic mode, battleWords holds current single challenge
      setBattleWords([data])
      setWordIndex(0)
      setupWordChallenge(data)
    } catch (err) {
      console.error(err)
    }
  }

  const setupWordChallenge = (wordConfig) => {
    const letters = wordConfig.letters.map((char, index) => ({
      id: `${char}-${index}-${Math.random()}`,
      char,
      used: false
    }))
    setLettersPool(letters)
    setInputWord([])
    setSolvedAnswers([])
    solvedAnswersRef.current = [] // Sync ref synchronously!
    setValidAnswersPool(wordConfig.answers || wordConfig.answer)
    validAnswersPoolRef.current = wordConfig.answers || wordConfig.answer // Sync ref synchronously!
  }

  // ==========================================
  // REALTIME TIMER ENGINE
  // ==========================================
  useEffect(() => {
    if (view !== 'battle') return

    gameIntervalRef.current = setInterval(() => {
      if (activeMode === 'story') {
        setBattleTimeElapsed((prev) => prev + 1) // Increment total combat time
        const nextTime = timeLeftRef.current - 1
        timeLeftRef.current = Math.max(0, nextTime)
        if (nextTime <= 0) {
          triggerEnemyAttack()
          setTimeLeft(roundLimit)
          timeLeftRef.current = roundLimit
        } else {
          setTimeLeft(nextTime)
        }
      } else {
        // Classic Practice Mode Timer decrements global clocks
        const nextTime = globalTimeLeftRef.current - 1
        globalTimeLeftRef.current = Math.max(0, nextTime)
        timeLeftRef.current = Math.max(0, nextTime)
        if (nextTime <= 0) {
          setGlobalTimeLeft(0)
          setTimeLeft(0)
          endClassicRound()
        } else {
          setGlobalTimeLeft(nextTime)
          setTimeLeft(nextTime)
        }
      }
    }, 1000)

    return () => clearInterval(gameIntervalRef.current)
  }, [view, activeMode, roundLimit])

  // Handles physical keyboard inputs
  useEffect(() => {
    if (view !== 'battle') return

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        submitInputWord()
      } else if (e.key === 'Backspace') {
        removeLastLetter()
      } else if (e.key === 'Escape') {
        clearInput()
      } else {
        const char = e.key.toLowerCase()
        if (/[a-z]/.test(char) && char.length === 1) {
          // Find unused tile matching character
          const tile = lettersPool.find(t => t.char === char && !t.used)
          if (tile) handleSelectTile(tile)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, lettersPool, inputWord])

  // ==========================================
  // COMBAT LOGIC
  // ==========================================
  const triggerEnemyAttack = () => {
    setEnemyLunge(true)
    setTimeout(() => setEnemyLunge(false), 500)

    setHeroHit(true)
    setTimeout(() => setHeroHit(false), 300)

    const nextHP = playerHPRef.current - 20
    setPlayerHP(Math.max(0, nextHP))
    if (nextHP <= 0) {
      endStoryBattle(false)
    }
  }

  const handleSelectTile = (tile) => {
    if (tile.used) return
    setLettersPool(prev => prev.map(t => t.id === tile.id ? { ...t, used: true } : t))
    setInputWord(prev => [...prev, tile])
  }

  const handleReturnTile = (tile) => {
    setInputWord(prev => prev.filter(t => t.id !== tile.id))
    setLettersPool(prev => prev.map(t => t.id === tile.id ? { ...t, used: false } : t))
  }

  const removeLastLetter = () => {
    if (inputWord.length === 0) return
    const last = inputWord[inputWord.length - 1]
    handleReturnTile(last)
  }

  const clearInput = () => {
    setInputWord([])
    setLettersPool(prev => prev.map(t => ({ ...t, used: false })))
  }

  const submitInputWord = async () => {
    // Convert selected letters to UPPERCASE to match database formatting
    const word = inputWord.map(t => t.char.toUpperCase()).join('')
    
    // Check if correct, unused anagram matching database list
    if (validAnswersPool.includes(word) && !solvedAnswers.includes(word)) {
      setSolvedAnswers(prev => [...prev, word])
      solvedAnswersRef.current = [...solvedAnswersRef.current, word] // Update synchronously!
      clearInput()

      // P3 Evoker flash visual effect
      setEvokerAim(true)
      setTimeout(() => {
        setEvokerFlash(true)
        setEnemyHit(true)
        setTimeout(() => {
          setEvokerAim(false)
          setEvokerFlash(false)
          setEnemyHit(false)
        }, 400)
      }, 300)

      // 1. Calculate and update solve streak
      const nextStreak = streakCount + 1
      setStreakCount(nextStreak)
      const isStreakBonus = nextStreak > 0 && nextStreak % 3 === 0

      if (activeMode === 'story') {
        const baseDmg = damageConfig[word.length.toString()] || 15
        // If streak is a multiple of 3, deal base damage + 25 bonus damage
        const totalDmg = isStreakBonus ? baseDmg + 25 : baseDmg

        const nextHP = enemyHPRef.current - totalDmg
        setEnemyHP(Math.max(0, nextHP))
        enemyHPRef.current = Math.max(0, nextHP) // Update synchronously!
        if (nextHP <= 0) {
          endStoryBattle(true)
        } else {
          // Check if all anagrams for current letters solved
          const totalMatchingAnswers = validAnswersPool.length
          if (solvedAnswers.length + 1 >= totalMatchingAnswers) {
            await moveToNextStoryWord()
          }
        }
      } else {
        // Classic Practice Mode Scoring
        const letterScore = word.split('').reduce((sum, char) => sum + (LETTER_POINTS[char] || 1), 0)
        const wordScore = letterScore * 10
        setRoundScore(prev => prev + wordScore)
        roundScoreRef.current = roundScoreRef.current + wordScore // Update synchronously!

        // If streak is a multiple of 3, award 5 extra seconds to the clocks
        if (isStreakBonus) {
          setGlobalTimeLeft((prev) => prev + 5)
          setTimeLeft((prev) => prev + 5)
          globalTimeLeftRef.current = globalTimeLeftRef.current + 5 // Update synchronously!
          timeLeftRef.current = timeLeftRef.current + 5 // Update synchronously!
        }

        // Load new letters automatically once completed
        if (solvedAnswers.length + 1 >= validAnswersPool.length) {
          await loadClassicChallenge()
        }
      }
    } else {
      // Shake input red on failure
      setInputErrorShake(true)
      setTimeout(() => setInputErrorShake(false), 300)
    }
  }

  const moveToNextStoryWord = async () => {
    const nextIndex = wordIndex + 1
    if (nextIndex < battleWords.length) {
      setWordIndex(nextIndex)
      setupWordChallenge(battleWords[nextIndex])
      setTimeLeft(roundLimit) // Reset round timer
      timeLeftRef.current = roundLimit // Update ref synchronously!
    } else {
      // Bypassed final preloaded word. Fetch a new progressive set for this floor!
      try {
        const res = await fetch(`/api/story?username=${encodeURIComponent(user.username)}`)
        const data = await res.json()
        if (res.ok && data.battleWords) {
          setBattleWords((prev) => [...prev, ...data.battleWords])
          setupWordChallenge(data.battleWords[0])
          setWordIndex(nextIndex)
          setTimeLeft(roundLimit)
          timeLeftRef.current = roundLimit // Update ref synchronously!
        } else {
          throw new Error()
        }
      } catch (err) {
        await endStoryBattle(false) // Fallback to defeat on API error
      }
    }
  }

  // End game triggers
  const endStoryBattle = async (isVictory) => {
    if (isStoryEndingRef.current) return
    isStoryEndingRef.current = true
    clearInterval(gameIntervalRef.current)
    setLoading(true)

    // Calculate missed anagrams: union of accumulated skips and final unsolved words
    const latestPool = validAnswersPoolRef.current
    const latestSolved = solvedAnswersRef.current
    const latestAccumulated = accumulatedMissedRef.current

    const finalUnsolved = isVictory ? [] : latestPool.filter(w => !latestSolved.includes(w.toUpperCase()))
    const combinedMissed = [...latestAccumulated, ...finalUnsolved]
    setMissedWordsList(combinedMissed)

    if (isVictory) {
      try {
        const res = await fetch('/api/story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username, floorCompleted: currentFloorRef.current })
        })
        const data = await res.json()
        if (res.ok) {
          setCurrentFloor(data.newFloor)
        }
      } catch (err) {
        console.error(err)
      }
    }
    
    // Fetch leaderboard records for result summary
  await fetchLeaderboard(3)
  setLoading(false)
  
  // Delay transition if victory, letting defeat animation finish
  const delay = isVictory ? 2000 : 1000;
  setTimeout(() => {
    setView('result')
  }, delay);
  }

  const endClassicRound = async () => {
    if (isClassicEndingRef.current) return
    isClassicEndingRef.current = true
    clearInterval(gameIntervalRef.current)
    setLoading(true)

    // Gather unsolved anagrams of the final active challenge and merge with accumulated skips
    const latestPool = validAnswersPoolRef.current
    const latestSolved = solvedAnswersRef.current
    const latestAccumulated = accumulatedMissedRef.current

    const finalUnsolved = latestPool.filter(w => !latestSolved.includes(w.toUpperCase()))
    const combinedMissed = [...latestAccumulated, ...finalUnsolved]
    setMissedWordsList(combinedMissed)

    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          score: roundScoreRef.current,
          timeTaken: 60 - globalTimeLeftRef.current,
          wordLength: classicLengthRef.current
        })
      })
    } catch (err) {
      console.error(err)
    }

    await fetchLeaderboard(classicLengthRef.current)
    setLoading(false)
    
    setTimeout(() => {
      setView('result')
    }, 1000); // Small delay to let final hit animation play
  }

  const fetchLeaderboard = async (length) => {
    try {
      const res = await fetch(`/api/leaderboard?length=${length}`)
      const data = await res.json()
      if (res.ok) setLeaderboardData(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleModeConfirm = () => {
    if (activeMode === 'story') {
      if (currentFloor > 50) {
        setActiveModal('gameCleared')
        return
      }
      setView('story-prep')
    } else {
      setView('classic-prep')
    }
  }

  const isSpecialFloor = currentFloor % 10 === 9 || currentFloor % 10 === 0;
  const bgClass = (view === 'story-prep' || view === 'lobby') 
    ? (isSpecialFloor ? 'bg-fullmoon' : 'bg-tartarus')
    : 'bg-fullmoon';

  return (
    <div className={`start-screen view-${view} ${bgClass}`}>
      {/* 1. Shared Background Visual Elements (only shown when not fighting or reviewing results) */}
      {view !== 'battle' && view !== 'result' && (
        <>
          <div className="full-moon"></div>
          <div className="clouds-container">
            <svg className="cloud-svg" viewBox="0 0 1000 100" fill="rgba(255, 255, 255, 0.4)">
              <path d="M 0 80 Q 200 40 400 80 T 800 80 T 1000 80 L 1000 100 L 0 100 Z" />
              <path d="M 100 90 Q 300 60 500 90 T 900 90 L 1000 100 L 0 100 Z" fill="rgba(255, 255, 255, 0.2)" />
            </svg>
            <svg className="cloud-svg" viewBox="0 0 1000 100" fill="rgba(255, 255, 255, 0.4)">
              <path d="M 0 80 Q 200 40 400 80 T 800 80 T 1000 80 L 1000 100 L 0 100 Z" />
              <path d="M 100 90 Q 300 60 500 90 T 900 90 L 1000 100 L 0 100 Z" fill="rgba(255, 255, 255, 0.2)" />
            </svg>
          </div>
          <div className="tartarus-container">
            <svg className="tartarus-svg" viewBox="0 0 400 600" fill="none">
              <path d="M 150 600 L 180 150 L 220 150 L 250 600 Z" fill="#0c111d" stroke="#22d3ee" strokeWidth="2" />
              <path d="M 170 600 L 190 200 L 210 200 L 230 600 Z" fill="#090d16" />
              <line x1="200" y1="150" x2="200" y2="80" stroke="#22d3ee" strokeWidth="3" />
              <circle cx="200" cy="80" r="4" fill="#22d3ee" />
            </svg>
          </div>
          <div className="butterfly" style={{ top: '25%', left: '20%' }}>
            <svg width="35" height="35" viewBox="0 0 50 50" fill="none">
              <path d="M 25 25 Q 10 10 5 25 Q 10 35 25 25 Z" fill="#22d3ee" opacity="0.8" />
              <path d="M 25 25 Q 40 10 45 25 Q 40 35 25 25 Z" fill="#22d3ee" opacity="0.8" />
            </svg>
          </div>
        </>
      )}

      {/* ==========================================
         VIEW SELECTOR
         ========================================== */}
      {view === 'start' && <StartScreen openModal={openModal} />}

      {view === 'lobby' && (
        <Lobby
          user={user}
          handleLogout={handleLogout}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          currentFloor={currentFloor}
          handleModeConfirm={handleModeConfirm}
        />
      )}

      {(view === 'story-prep' || view === 'classic-prep') && (
        <PrepScreen
          view={view}
          currentFloor={currentFloor}
          getMoonPhase={getMoonPhase}
          classicLength={classicLength}
          setClassicLength={setClassicLength}
          setView={setView}
          startBattle={startBattle}
        />
      )}

      {view === 'battle' && (
        <BattleArena
          activeMode={activeMode}
          enemyType={enemyType}
          playerHP={playerHP}
          playerMaxHP={playerMaxHP}
          enemyHP={enemyHP}
          enemyMaxHP={enemyMaxHP}
          roundScore={roundScore}
          inputWord={inputWord}
          lettersPool={lettersPool}
          solvedAnswers={solvedAnswers}
          validAnswersPool={validAnswersPool}
          streakCount={streakCount}
          timeLeft={timeLeft}
          roundLimit={roundLimit}
          inputErrorShake={inputErrorShake}
          handleSelectTile={handleSelectTile}
          handleReturnTile={handleReturnTile}
          removeLastLetter={removeLastLetter}
          clearInput={clearInput}
          submitInputWord={submitInputWord}
          handleRetreat={handleRetreat}
          handleSkip={handleSkip}
          loading={loading}
        />
      )}

      {view === 'result' && (
        <ResultScreen
          activeMode={activeMode}
          enemyHP={enemyHP}
          enemyMaxHP={enemyMaxHP}
          playerHP={playerHP}
          playerMaxHP={playerMaxHP}
          currentFloor={currentFloor}
          roundScore={roundScore}
          resultTab={resultTab}
          setResultTab={setResultTab}
          battleTimeElapsed={battleTimeElapsed}
          classicLength={classicLength}
          leaderboardData={leaderboardData}
          missedWordsList={missedWordsList}
          setView={setView}
        />
      )}

      {/* Form Modals */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-inner">
              {activeModal === 'gameCleared' ? (
                <>
                  <h2 className="modal-title" style={{ color: 'var(--color-yellow)', textShadow: '2px 2px 0px var(--color-red)' }}>Tower Cleared!</h2>
                  <p style={{ margin: '20px 0', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text-light)', textAlign: 'center' }}>
                    Congratulations, S.E.E.S. Member! You have conquered the first 50 floors of Tartarus Tower.
                    <br /><br />
                    There are no further floors available at this time. Please wait for a future content update.
                  </p>
                  <div className="modal-actions" style={{ justifyContent: 'center' }}>
                    <button type="button" className="p3-btn" onClick={() => setActiveModal(null)}>OK</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="modal-title">
                    {activeModal === 'login' ? 'Login Authentication' : 'Register Member'}
                  </h2>
                  {errorMsg && <div className="form-error">{errorMsg}</div>}
                  {successMsg && <div className="form-success">{successMsg}</div>}
                  <form onSubmit={activeModal === 'login' ? handleLoginSubmit : handleRegisterSubmit}>
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input type="text" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" maxLength={15} disabled={loading} autoFocus />
                    </div>
                    <div className="form-group">
                      <label className="form-label">4-Digit PIN</label>
                      <input type="password" className="form-input" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" maxLength={4} disabled={loading} />
                    </div>
                    {activeModal === 'register' && (
                      <div className="form-group">
                        <label className="form-label">Confirm PIN</label>
                        <input type="password" className="form-input" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" maxLength={4} disabled={loading} />
                      </div>
                    )}
                    <div className="modal-actions">
                      <button type="button" className="p3-btn btn-red" style={{ border: '2px solid var(--color-red)' }} onClick={() => setActiveModal(null)} disabled={loading}>Cancel</button>
                      <button type="submit" className="p3-btn" disabled={loading}>Submit</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
