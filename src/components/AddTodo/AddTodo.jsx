import { useState } from 'react';
import { createTodo } from "../../services/api";
import { Plus, Sparkles, Flame, Zap, Coffee } from 'lucide-react';

function AddTodo({ user }) {
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState(2); // 1 = Critical, 2 = Medium, 3 = Low
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || loading) return;

    try {
      setLoading(true);
      await createTodo(trimmed, user?.uid, priority);
      setInputText('');
    } catch (err) {
      console.error("Failed to add todo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const priorityOptions = [
    { level: 1, label: 'P1 // URGENT', icon: Flame, bg: 'bg-[#FF6B6B]', text: 'text-white' },
    { level: 2, label: 'P2 // MEDIUM', icon: Zap, bg: 'bg-[#FFD93D]', text: 'text-black' },
    { level: 3, label: 'P3 // LOW', icon: Coffee, bg: 'bg-[#C4B5FD]', text: 'text-black' },
  ];

  return (
    <div className="mb-10">
      {/* Container Card */}
      <div className="bg-white border-4 border-black p-4 sm:p-5 shadow-[8px_8px_0px_0px_#000] relative">
        
        {/* Floating Tag */}
        <div className="absolute -top-4 left-5 bg-[#FFD93D] border-4 border-black px-3 py-0.5 text-[11px] font-black uppercase tracking-widest -rotate-1 shadow-[3px_3px_0px_#000] flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 stroke-[3px]" />
          <span>NEW TASK ENTRY</span>
        </div>

        {/* Input & Button Composite Form */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <input 
              className="input-neo w-full text-base font-bold placeholder:text-black/40"
              type="text"
              placeholder="ENTER A NEW TASK HERE..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button 
            onClick={handleAdd} 
            disabled={loading || !inputText.trim()}
            className="btn-neo bg-[#FF6B6B] text-white px-6 sm:px-8 py-3.5 text-sm font-black tracking-wider shrink-0"
          >
            <Plus className="h-5 w-5 stroke-[4px]" />
            <span>{loading ? 'ADDING...' : 'ADD TASK'}</span>
          </button>
        </div>

        {/* Priority Level Selector */}
        <div className="mt-4 pt-3 border-t-2 border-dashed border-black/20 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs uppercase tracking-wider text-black">
              PRIORITY:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {priorityOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = priority === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setPriority(opt.level)}
                    className={`btn-neo border-3 border-black px-2.5 sm:px-3 py-1 text-xs font-black uppercase tracking-wider transition-all ${
                      opt.bg
                    } ${opt.text} ${
                      isSelected
                        ? "shadow-[3px_3px_0px_#000] ring-2 ring-black -translate-y-0.5"
                        : "opacity-60 shadow-none hover:opacity-100"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 stroke-[2.5px]" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <span className="text-xs font-bold text-black/60 uppercase tracking-wider hidden md:inline-block">
            PRESS <strong>ENTER ↵</strong> TO SUBMIT
          </span>
        </div>

      </div>
    </div>
  );
}

export default AddTodo;