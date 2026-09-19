// App.jsx

import './App.css';
import TodoList from './components/TodoList/TodoList';
import AddTodo from './components/AddTodo/AddTodo';
import TodoContext from './components/context/TodoContext';
import TodoDispatchContext from './components/context/TodoDispatchContext';
import todoReducer from './reducers/todoReducer';

import { useEffect, useReducer, useState, useRef } from 'react';
import { onAuthChange, signOutUser, isFirebaseConfigured } from './services/api';
import Auth from './components/Auth/Auth';
import FocusTimer from './components/Timer/FocusTimer';
import { CheckSquare, LogOut, Zap, Star, Volume2, VolumeX, ArrowUp, Timer as TimerIcon } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playClickSound } from './utils/audio';
import Lenis from 'lenis';

function App() {
  const [list, dispatch] = useReducer(todoReducer, []);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const lenisRef = useRef(null);

  // Buttery smooth momentum scrolling via Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ({ scroll }) => {
      setShowScrollTop(scroll > 200);
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToTop = () => {
    playClickSound();
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.1 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playClickSound();
    }
  };

  // Listen to authentication state (Firebase or LocalStorage Demo)
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
        <div className="card-neo p-8 text-center bg-[#FFD93D] -rotate-1 border-4 border-black shadow-[8px_8px_0px_#000]">
          <p className="font-black text-2xl uppercase tracking-wider flex items-center gap-3">
            <Zap className="h-7 w-7 fill-black stroke-[3px]" />
            LOADING SYSTEM...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in → show Auth screen
  if (!user) {
    return <Auth />;
  }

  return (
    <TodoContext.Provider value={{ list }}>
      <TodoDispatchContext.Provider value={{ dispatch }}>
        {/* Neo-brutalist Top Bar */}
        <header className="w-full bg-[#FFFDF5] border-b-4 border-black px-4 sm:px-8 py-3.5 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            
            {/* Brand Sticker */}
            <div className="flex items-center gap-3">
              <div className="bg-[#FFD93D] border-4 border-black px-3.5 py-1.5 font-black text-xl tracking-tighter uppercase -rotate-2 shadow-[4px_4px_0px_#000] flex items-center gap-2">
                <CheckSquare className="h-6 w-6 stroke-[3px]" />
                <span>TODO // RAW</span>
              </div>
              <span className="hidden sm:inline-block bg-[#C4B5FD] border-2 border-black px-2 py-0.5 font-bold text-xs uppercase tracking-widest rotate-1">
                v2.0 NEO
              </span>
            </div>

            {/* Badges & User Session */}
            <div className="flex items-center gap-3 flex-wrap">
              {!isFirebaseConfigured && (
                <div className="bg-[#FFD93D] border-2 border-black px-2.5 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1.5 rotate-1">
                  <Zap className="h-3.5 w-3.5 fill-black stroke-[2px]" />
                  <span>DEMO MODE (LOCAL)</span>
                </div>
              )}

              {/* Focus Timer Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsTimerOpen(true);
                }}
                className="btn-neo bg-[#FFD93D] text-black border-2 border-black px-2.5 sm:px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1.5 -rotate-1"
                title="Open Focus Timer (1s - 99h)"
              >
                <TimerIcon className="h-3.5 w-3.5 stroke-[2.5px]" />
                <span>TIMER</span>
              </button>

              <button
                type="button"
                onClick={toggleSound}
                className={`btn-neo border-2 border-black px-2.5 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all ${
                  soundOn ? "bg-[#C4B5FD] text-black" : "bg-gray-200 text-gray-500"
                }`}
                title={soundOn ? "Mute audio sound FX" : "Unmute audio sound FX"}
              >
                {soundOn ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 stroke-[2.5px]" />
                    <span className="hidden sm:inline">SFX: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 stroke-[2.5px]" />
                    <span className="hidden sm:inline">SFX: OFF</span>
                  </>
                )}
              </button>

              <div className="bg-white border-2 border-black px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_#000] truncate max-w-[180px] sm:max-w-none">
                {user.email}
              </div>

              <button
                onClick={signOutUser}
                className="btn-neo bg-[#FF6B6B] text-white px-3 sm:px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000]"
                title="Log out of session"
              >
                <LogOut className="h-3.5 w-3.5 stroke-[3px]" />
                <span>EXIT</span>
              </button>
            </div>

          </div>
        </header>

        {/* Main Application Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-28">
          
          {/* Hero Header Section */}
          <div className="text-center mb-10 relative">
            
            {/* Top decorative floating sticker */}
            <div className="inline-flex items-center gap-1.5 bg-[#FF6B6B] text-white border-4 border-black px-3.5 py-1 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_#000] -rotate-3 mb-3">
              <Star className="h-3.5 w-3.5 fill-white stroke-[2px]" />
              <span>PUNK PRODUCTIVITY</span>
            </div>

            {/* Main Headline with Outline & Contrast */}
            <h1 className="font-black text-5xl sm:text-7xl uppercase tracking-tighter leading-none text-black drop-shadow-[4px_4px_0px_#FFD93D]">
              TODO APP
            </h1>

            <p className="mt-2 text-sm sm:text-base font-bold uppercase tracking-wider text-black/70">
              NO SUBTLE GRADIENTS. NO BLUR. JUST HARD WORK.
            </p>

            {/* Thick Divider */}
            <div className="mt-6 mx-auto w-32 h-2.5 bg-black border-2 border-black shadow-[4px_4px_0px_#FF6B6B]" />
          </div>

          {/* Add Todo Component */}
          <AddTodo user={user} />

          {/* Todo List Component */}
          <TodoList user={user} />

        </main>

        {/* Smooth Scroll To Top Floating Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="btn-neo fixed bottom-6 right-6 z-50 bg-[#FFD93D] text-black border-4 border-black p-3.5 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] transition-all"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-6 w-6 stroke-[3.5px]" />
          </button>
        )}

        {/* Focus Timer Modal / Fullscreen Overlay */}
        <FocusTimer isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
      </TodoDispatchContext.Provider>
    </TodoContext.Provider>
  );
}

export default App;