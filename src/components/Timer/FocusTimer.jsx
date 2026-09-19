import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  X, 
  Plus, 
  Zap, 
  Trophy, 
  Timer as TimerIcon,
  Flame,
  Coffee,
  Sparkles
} from "lucide-react";
import { playClickSound, playSuccessSound, playTimerAlarmSound } from "../../utils/audio";
import { triggerNeoConfetti } from "../../utils/confetti";

function FocusTimer({ isOpen, onClose }) {
  // Configured duration in seconds (defaults to 25 mins = 1500s)
  const [totalSeconds, setTotalSeconds] = useState(1500);
  const [remainingSeconds, setRemainingSeconds] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Manual input fields
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(25);
  const [inputSeconds, setInputSeconds] = useState(0);

  const timerRef = useRef(null);

  // Countdown effect
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsFinished(true);
            playTimerAlarmSound();
            triggerNeoConfetti();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, remainingSeconds]);

  // Keyboard shortcut handler (Space = Play/Pause, F = Fullscreen, Esc = Exit/Close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in a numeric input
      if (e.target.tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRunning, isFullscreen, remainingSeconds]);

  if (!isOpen) return null;

  const toggleTimer = () => {
    playClickSound();
    if (remainingSeconds === 0) {
      resetTimer();
      return;
    }
    setIsRunning((prev) => !prev);
    setIsFinished(false);
  };

  const resetTimer = () => {
    playClickSound();
    setIsRunning(false);
    setIsFinished(false);
    setRemainingSeconds(totalSeconds);
  };

  const toggleFullscreen = () => {
    playClickSound();
    setIsFullscreen((prev) => !prev);
  };

  const applyCustomDuration = (h, m, s) => {
    const validH = Math.min(99, Math.max(0, parseInt(h, 10) || 0));
    const validM = Math.min(59, Math.max(0, parseInt(m, 10) || 0));
    const validS = Math.min(59, Math.max(0, parseInt(s, 10) || 0));

    let seconds = validH * 3600 + validM * 60 + validS;
    if (seconds <= 0) seconds = 1; // Minimum 1 second

    setInputHours(validH);
    setInputMinutes(validM);
    setInputSeconds(validS);
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(false);
    setIsFinished(false);
    playClickSound();
  };

  const setPreset = (presetSecs, h, m, s) => {
    setInputHours(h);
    setInputMinutes(m);
    setInputSeconds(s);
    setTotalSeconds(presetSecs);
    setRemainingSeconds(presetSecs);
    setIsRunning(false);
    setIsFinished(false);
    playClickSound();
  };

  const addTime = (additionalSeconds) => {
    playClickSound();
    setTotalSeconds((prev) => prev + additionalSeconds);
    setRemainingSeconds((prev) => prev + additionalSeconds);
  };

  // Format HH:MM:SS
  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const pad = (num) => String(num).padStart(2, '0');
    return {
      hours: pad(hrs),
      minutes: pad(mins),
      seconds: pad(secs),
      hasHours: hrs > 0,
    };
  };

  const time = formatTime(remainingSeconds);
  const progressPercent = totalSeconds > 0 
    ? Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100) 
    : 0;

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[9999] bg-[#FFFDF5] p-6 sm:p-12 flex flex-col justify-between overflow-y-auto"
          : "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      }
    >
      {/* Modal / Container Card */}
      <div
        className={
          isFullscreen
            ? "w-full max-w-5xl mx-auto flex flex-col flex-1 justify-between my-auto"
            : "bg-[#FFFDF5] border-4 border-black p-6 sm:p-8 w-full max-w-xl shadow-[12px_12px_0px_0px_#000] relative max-h-[90vh] overflow-y-auto"
        }
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b-4 border-black mb-6 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#FFD93D] border-3 border-black p-1.5 shadow-[3px_3px_0px_#000] -rotate-2">
              <TimerIcon className="h-6 w-6 stroke-[3px] text-black" />
            </div>
            <div>
              <h2 className="font-black text-xl sm:text-2xl uppercase tracking-tight text-black leading-none">
                FOCUS PROTOCOL
              </h2>
              <span className="text-xs font-bold uppercase tracking-widest text-black/60">
                1S TO 99:59:59 FULLSCREEN TIMER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="btn-neo bg-white text-black border-3 border-black p-2 text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
              title={isFullscreen ? "Exit Fullscreen (Esc / F)" : "Expand to Fullscreen (F)"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 stroke-[3px]" />
              ) : (
                <Maximize2 className="h-4 w-4 stroke-[3px]" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="btn-neo bg-[#FF6B6B] text-white border-3 border-black p-2 text-xs font-black shadow-[2px_2px_0px_#000]"
              title="Close Timer"
            >
              <X className="h-4 w-4 stroke-[3px]" />
            </button>
          </div>
        </div>

        {/* Finished Celebration Banner */}
        {isFinished && (
          <div className="bg-[#FFD93D] border-4 border-black p-4 text-center shadow-[6px_6px_0px_#000] mb-6 animate-bounce">
            <div className="flex items-center justify-center gap-2 font-black text-base sm:text-lg uppercase">
              <Trophy className="h-6 w-6 stroke-[3px] text-[#10B981]" />
              <span>MISSION ACCOMPLISHED! SESSION COMPLETE 🏆</span>
              <Sparkles className="h-6 w-6 stroke-[3px] text-[#FF6B6B]" />
            </div>
          </div>
        )}

        {/* Giant Digital Readout */}
        <div className="text-center my-6 sm:my-8 select-none">
          <div
            className={`font-black tracking-tighter leading-none text-black drop-shadow-[6px_6px_0px_#FFD93D] transition-all ${
              isFullscreen 
                ? "text-7xl sm:text-9xl md:text-[11rem]" 
                : "text-6xl sm:text-8xl"
            }`}
          >
            <span>{time.hours}</span>
            <span className="animate-pulse">:</span>
            <span>{time.minutes}</span>
            <span className="animate-pulse">:</span>
            <span>{time.seconds}</span>
          </div>

          <p className="mt-3 text-xs sm:text-sm font-black uppercase tracking-widest text-black/70">
            {isRunning ? "⚡ TIMER RUNNING // STAY LOCKED IN" : "PAUSED // PREPARE FOR ACTION"}
          </p>
        </div>

        {/* Mechanical Progress Bar */}
        <div className="w-full bg-white border-4 border-black h-6 p-0.5 shadow-[4px_4px_0px_#000] relative overflow-hidden mb-6">
          <div
            className="bg-[#FF6B6B] h-full border-r-4 border-black transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-6">
          <button
            type="button"
            onClick={toggleTimer}
            className={`btn-neo border-4 border-black px-8 py-4 text-base sm:text-lg font-black uppercase tracking-wider shadow-[6px_6px_0px_#000] flex items-center gap-2 ${
              isRunning ? "bg-[#FFD93D] text-black" : "bg-[#10B981] text-white"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-6 w-6 stroke-[3px]" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="h-6 w-6 stroke-[3px] fill-current" />
                <span>START</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="btn-neo bg-white text-black border-4 border-black px-6 py-4 text-base font-black uppercase tracking-wider shadow-[6px_6px_0px_#000] flex items-center gap-2"
            title="Reset Timer"
          >
            <RotateCcw className="h-5 w-5 stroke-[3px]" />
            <span>RESET</span>
          </button>

          <button
            type="button"
            onClick={() => addTime(60)}
            className="btn-neo bg-[#C4B5FD] text-black border-4 border-black px-4 py-4 text-sm font-black uppercase shadow-[6px_6px_0px_#000] flex items-center gap-1"
            title="Add 1 Minute"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            <span>1 MIN</span>
          </button>

          <button
            type="button"
            onClick={() => addTime(300)}
            className="btn-neo bg-[#C4B5FD] text-black border-4 border-black px-4 py-4 text-sm font-black uppercase shadow-[6px_6px_0px_#000] flex items-center gap-1"
            title="Add 5 Minutes"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            <span>5 MIN</span>
          </button>
        </div>

        {/* Presets & Custom Configuration Section */}
        <div className="bg-white border-4 border-black p-4 shadow-[5px_5px_0px_#000] space-y-4">
          
          {/* Quick Presets */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 stroke-[2.5px]" />
              QUICK PRESETS:
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setPreset(300, 0, 5, 0)}
                className="btn-neo bg-white border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1"
              >
                <Coffee className="h-3 w-3 stroke-[2.5px]" />
                <span>5M BREAK</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset(900, 0, 15, 0)}
                className="btn-neo bg-white border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1"
              >
                <Flame className="h-3 w-3 stroke-[2.5px]" />
                <span>15M SPRINT</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset(1500, 0, 25, 0)}
                className="btn-neo bg-[#FFD93D] text-black border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1"
              >
                <TimerIcon className="h-3 w-3 stroke-[2.5px]" />
                <span>25M POMODORO</span>
              </button>

              <button
                type="button"
                onClick={() => setPreset(3000, 0, 50, 0)}
                className="btn-neo bg-[#C4B5FD] text-black border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3 stroke-[2.5px]" />
                <span>50M DEEP</span>
              </button>
            </div>
          </div>

          {/* Custom Duration Configurator (1 sec to 99:59:59 hrs) */}
          <div className="pt-3 border-t-2 border-dashed border-black/20 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs uppercase tracking-wider text-black">
                CUSTOM DURATION:
              </span>
              <div className="flex items-center gap-1.5 font-black text-sm">
                {/* Hours Input (0-99) */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={inputHours}
                    onChange={(e) => setInputHours(e.target.value)}
                    className="w-12 text-center font-black text-xs border-2 border-black p-1 bg-[#FFFDF5] shadow-[2px_2px_0px_#000]"
                    title="Hours (0-99)"
                  />
                  <span className="text-[11px] uppercase">H</span>
                </div>

                <span>:</span>

                {/* Minutes Input (0-59) */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={inputMinutes}
                    onChange={(e) => setInputMinutes(e.target.value)}
                    className="w-12 text-center font-black text-xs border-2 border-black p-1 bg-[#FFFDF5] shadow-[2px_2px_0px_#000]"
                    title="Minutes (0-59)"
                  />
                  <span className="text-[11px] uppercase">M</span>
                </div>

                <span>:</span>

                {/* Seconds Input (0-59) */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={inputSeconds}
                    onChange={(e) => setInputSeconds(e.target.value)}
                    className="w-12 text-center font-black text-xs border-2 border-black p-1 bg-[#FFFDF5] shadow-[2px_2px_0px_#000]"
                    title="Seconds (0-59)"
                  />
                  <span className="text-[11px] uppercase">S</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => applyCustomDuration(inputHours, inputMinutes, inputSeconds)}
              className="btn-neo bg-black text-white border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#FFD93D]"
            >
              SET DURATION
            </button>
          </div>

        </div>

        {/* Footer shortcuts helper */}
        <div className="mt-4 pt-2 text-center text-[11px] font-bold uppercase tracking-wider text-black/60 hidden sm:block">
          SHORTCUTS: <kbd className="border border-black px-1 py-0.5 bg-white font-mono">SPACE</kbd> START/PAUSE | <kbd className="border border-black px-1 py-0.5 bg-white font-mono">F</kbd> FULLSCREEN | <kbd className="border border-black px-1 py-0.5 bg-white font-mono">ESC</kbd> EXIT
        </div>

      </div>
    </div>
  );
}

export default FocusTimer;
