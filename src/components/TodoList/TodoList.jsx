import Todo from "../Todo/Todo";
import { useEffect, useState } from "react";
import { 
  subscribeTodos, 
  removeTodo, 
  updateTodoStatus, 
  updateTodo, 
  clearCompletedTodos, 
  toggleAllTodos 
} from "../../services/api";
import { 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Coffee, 
  ArrowUpDown, 
  Filter, 
  Search, 
  X, 
  Trash2, 
  CheckCheck,
  Trophy
} from "lucide-react";
import { playClickSound, playDeleteSound, playSuccessSound } from "../../utils/audio";
import { triggerNeoConfetti } from "../../utils/confetti";

function TodoList({ user }) {
  const [todos, setTodos] = useState([]);
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'dueDate' | 'newest'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 1 | 2 | 3
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeTodos(user.uid, (data) => {
      setTodos(data);
    });

    return () => unsubscribe && unsubscribe();
  }, [user?.uid]);

  // Global shortcut '/' to focus search input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        const searchInput = document.getElementById('task-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const onDelete = async (id) => {
    await removeTodo(id);
  };

  const onFinished = async (id, isFinished) => {
    await updateTodoStatus(id, isFinished);
  };

  const onEdit = async (id, newText, newPriority, newDueDate) => {
    await updateTodo(id, {
      text: newText,
      priority: Number(newPriority) || 2,
      dueDate: newDueDate || null
    });
  };

  // Bulk: Clear Completed
  const handleClearCompleted = async () => {
    if (completedCount === 0 || bulkLoading) return;
    try {
      setBulkLoading(true);
      playDeleteSound();
      await clearCompletedTodos(user?.uid);
    } catch (err) {
      console.error("Failed to clear completed:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk: Toggle All Complete / Incomplete
  const handleToggleAll = async () => {
    if (totalCount === 0 || bulkLoading) return;
    const targetFinished = completedCount !== totalCount;
    try {
      setBulkLoading(true);
      if (targetFinished) {
        playSuccessSound();
        triggerNeoConfetti();
      } else {
        playClickSound();
      }
      await toggleAllTodos(user?.uid, targetFinished);
    } catch (err) {
      console.error("Failed to toggle all:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.finished).length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const p1Count = todos.filter(t => !t.finished && Number(t.priority) === 1).length;
  const p2Count = todos.filter(t => !t.finished && (Number(t.priority) === 2 || !t.priority)).length;
  const p3Count = todos.filter(t => !t.finished && Number(t.priority) === 3).length;

  // Filter by priority and search query
  const filteredTodos = todos.filter((todo) => {
    if (filterPriority !== 'all' && Number(todo.priority || 2) !== Number(filterPriority)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = (todo.text || '').toLowerCase().includes(q);
      const matchDate = (todo.dueDate || '').toLowerCase().includes(q);
      if (!matchText && !matchDate) return false;
    }
    return true;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Finished tasks sink to the bottom
    if (a.finished !== b.finished) {
      return a.finished ? 1 : -1;
    }

    if (sortBy === 'priority') {
      const pA = Number(a.priority) || 2;
      const pB = Number(b.priority) || 2;
      if (pA !== pB) return pA - pB; // 1 before 2 before 3
      return (b.createdAt || 0) - (a.createdAt || 0);
    } else if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return (b.createdAt || 0) - (a.createdAt || 0);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return (b.createdAt || 0) - (a.createdAt || 0);
    } else {
      // Newest first
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });

  const cycleSort = () => {
    playClickSound();
    if (sortBy === 'priority') setSortBy('dueDate');
    else if (sortBy === 'dueDate') setSortBy('newest');
    else setSortBy('priority');
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'priority':
        return '⚡ BY PRIORITY';
      case 'dueDate':
        return '📅 BY DEADLINE';
      case 'newest':
      default:
        return '⏱️ BY NEWEST';
    }
  };

  const getProgressMotivation = () => {
    if (totalCount === 0) return 'NO ACTIVE TASKS 🎯';
    if (progressPercent === 100) return 'ALL CLEAR! MISSION ACCOMPLISHED 🏆';
    if (progressPercent >= 75) return 'ALMOST DONE! FINAL PUSH 🔥';
    if (progressPercent >= 50) return 'HALFWAY THERE! STAY STRONG ⚡';
    if (progressPercent > 0) return 'GREAT START! KEEP GOING 🚀';
    return 'READY TO START // GET TO WORK 🎯';
  };

  return (
    <div className="space-y-5">
      
      {/* Search Bar & Instant Filter */}
      <div className="bg-white border-4 border-black p-3 shadow-[6px_6px_0px_#000] flex items-center gap-3">
        <div className="relative flex-1 flex items-center">
          <Search className="h-5 w-5 stroke-[3px] text-black absolute left-3 shrink-0 pointer-events-none" />
          <input
            id="task-search-input"
            type="text"
            placeholder="SEARCH TASKS BY TITLE OR DEADLINE... (PRESS '/' TO JUMP HERE)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 font-bold text-sm bg-transparent outline-none uppercase placeholder:text-black/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setSearchQuery('');
              }}
              className="absolute right-2.5 p-1 bg-[#FF6B6B] text-white border-2 border-black shadow-[2px_2px_0px_#000]"
              title="Clear search"
            >
              <X className="h-3 w-3 stroke-[3px]" />
            </button>
          )}
        </div>

        <span className="hidden sm:inline-block bg-[#FFD93D] border-2 border-black px-2 py-1 text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] shrink-0">
          PRESS [/] TO SEARCH
        </span>
      </div>

      {/* Progress Bar Component */}
      {totalCount > 0 && (
        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_#000] space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 stroke-[3px] text-[#10B981]" />
              <span className="font-black text-xs uppercase tracking-wider text-black">
                PROGRESS:
              </span>
              <span className="bg-[#10B981] text-white border-2 border-black px-2 py-0.5 text-xs font-black shadow-[2px_2px_0px_#000]">
                {progressPercent}%
              </span>
            </div>

            <span className="font-black text-xs uppercase tracking-wider text-black/80">
              {getProgressMotivation()}
            </span>
          </div>

          {/* Thick Mechanical Progress Track */}
          <div className="w-full bg-[#FFFDF5] border-4 border-black h-6 p-0.5 shadow-[3px_3px_0px_#000] relative overflow-hidden">
            <div
              className="bg-[#10B981] h-full border-r-4 border-black transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Counter, Quick Filters, and Bulk Actions Bar */}
      {totalCount > 0 && (
        <div className="space-y-3 pb-1">
          
          {/* Main Counters and Sort / Bulk Actions */}
          <div className="flex items-center justify-between gap-3 flex-wrap px-1">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="bg-[#C4B5FD] border-4 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000]">
                TOTAL: {totalCount}
              </span>
              <span className="bg-[#FFD93D] border-4 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000]">
                PENDING: {pendingCount}
              </span>
              <span className="bg-white border-4 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 stroke-[3px] text-[#10b981]" />
                <span>DONE: {completedCount}</span>
              </span>
            </div>

            {/* Action Tools: Sort & Bulk Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={cycleSort}
                className="btn-neo bg-white border-3 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
                title="Cycle sorting method"
              >
                <ArrowUpDown className="h-3.5 w-3.5 stroke-[2.5px]" />
                <span>SORT: {getSortLabel()}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleAll}
                disabled={bulkLoading || totalCount === 0}
                className="btn-neo bg-[#FFD93D] border-3 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
                title={completedCount === totalCount ? "Mark all as incomplete" : "Mark all as done"}
              >
                <CheckCheck className="h-3.5 w-3.5 stroke-[2.5px]" />
                <span>{completedCount === totalCount ? "UNCHECK ALL" : "MARK ALL DONE"}</span>
              </button>

              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  disabled={bulkLoading}
                  className="btn-neo bg-[#FF6B6B] text-white border-3 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1.5 animate-pulse"
                  title="Remove all completed tasks"
                >
                  <Trash2 className="h-3.5 w-3.5 stroke-[2.5px]" />
                  <span>CLEAR DONE ({completedCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Priority Quick Filter Badges */}
          <div className="flex items-center gap-2 flex-wrap px-1 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1">
              <Filter className="h-3 w-3 stroke-[2.5px]" />
              FILTER:
            </span>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setFilterPriority('all');
              }}
              className={`border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider transition-all ${
                filterPriority === 'all'
                  ? "bg-black text-white shadow-[2px_2px_0px_#FFD93D]"
                  : "bg-white text-black hover:bg-black/10"
              }`}
            >
              ALL ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setFilterPriority(1);
              }}
              className={`border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                filterPriority === 1
                  ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0px_#000] ring-2 ring-black"
                  : "bg-[#FF6B6B]/25 text-black hover:bg-[#FF6B6B]/50"
              }`}
            >
              <Flame className="h-3 w-3 stroke-[2.5px]" />
              <span>P1 URGENT ({p1Count})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setFilterPriority(2);
              }}
              className={`border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                filterPriority === 2
                  ? "bg-[#FFD93D] text-black shadow-[2px_2px_0px_#000] ring-2 ring-black"
                  : "bg-[#FFD93D]/25 text-black hover:bg-[#FFD93D]/60"
              }`}
            >
              <Zap className="h-3 w-3 stroke-[2.5px]" />
              <span>P2 MEDIUM ({p2Count})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setFilterPriority(3);
              }}
              className={`border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                filterPriority === 3
                  ? "bg-[#C4B5FD] text-black shadow-[2px_2px_0px_#000] ring-2 ring-black"
                  : "bg-[#C4B5FD]/25 text-black hover:bg-[#C4B5FD]/60"
              }`}
            >
              <Coffee className="h-3 w-3 stroke-[2.5px]" />
              <span>P3 LOW ({p3Count})</span>
            </button>
          </div>

        </div>
      )}

      {/* Todo List Items */}
      {sortedTodos.length === 0 ? (
        <div className="bg-white border-4 border-black p-8 sm:p-14 text-center shadow-[10px_10px_0px_0px_#000] relative my-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#FFD93D] border-4 border-black flex items-center justify-center -rotate-3 shadow-[4px_4px_0px_#000]">
            <Sparkles className="h-8 w-8 stroke-[3px]" />
          </div>
          <h3 className="font-black text-2xl sm:text-3xl uppercase tracking-tight text-black mb-2">
            {searchQuery 
              ? `NO TASKS MATCHING "${searchQuery}"`
              : filterPriority === 'all' 
                ? "NO TASKS ON BOARD" 
                : `NO P${filterPriority} TASKS FOUND`}
          </h3>
          <p className="font-bold text-sm uppercase tracking-wider text-black/70 max-w-sm mx-auto">
            {searchQuery
              ? "TRY SEARCHING FOR ANOTHER KEYWORD OR CLEAR THE SEARCH FILTER."
              : filterPriority === 'all' 
                ? "THE QUEUE IS CLEAR. ADD YOUR FIRST TASK ABOVE TO IGNITE THE ENGINE."
                : "TRY SWITCHING FILTERS OR CREATE A TASK WITH THIS PRIORITY LEVEL."}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setSearchQuery('');
              }}
              className="btn-neo bg-[#FFD93D] text-black border-4 border-black mt-4 px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000]"
            >
              RESET SEARCH
            </button>
          )}
        </div>
      ) : (
        sortedTodos.map((todo) => (
          <Todo
            key={todo.id}
            todoData={todo.text}
            isFinished={todo.finished}
            priority={todo.priority || 2}
            dueDate={todo.dueDate || null}
            changeFinished={(isFinished) => onFinished(todo.id, isFinished)}
            onDelete={() => onDelete(todo.id)}
            onEdit={(todoText, newPriority, newDueDate) => onEdit(todo.id, todoText, newPriority, newDueDate)}
          />
        ))
      )}

    </div>
  );
}

export default TodoList;