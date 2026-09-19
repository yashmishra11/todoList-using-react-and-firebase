import Todo from "../Todo/Todo";
import { useEffect, useState } from "react";
import { subscribeTodos, removeTodo, updateTodoStatus, updateTodo } from "../../services/api";
import { Sparkles, CheckCircle2, Flame, Zap, Coffee, ArrowUpDown, Filter } from "lucide-react";

function TodoList({ user }) {
  const [todos, setTodos] = useState([]);
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'newest'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 1 | 2 | 3

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeTodos(user.uid, (data) => {
      setTodos(data);
    });

    return () => unsubscribe && unsubscribe();
  }, [user?.uid]);

  const onDelete = async (id) => {
    await removeTodo(id);
  };

  const onFinished = async (id, isFinished) => {
    await updateTodoStatus(id, isFinished);
  };

  const onEdit = async (id, newText, newPriority) => {
    await updateTodo(id, {
      text: newText,
      priority: Number(newPriority) || 2
    });
  };

  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.finished).length;
  const pendingCount = totalCount - completedCount;

  const p1Count = todos.filter(t => !t.finished && Number(t.priority) === 1).length;
  const p2Count = todos.filter(t => !t.finished && (Number(t.priority) === 2 || !t.priority)).length;
  const p3Count = todos.filter(t => !t.finished && Number(t.priority) === 3).length;

  // Filter and Sort
  const filteredTodos = todos.filter(todo => {
    if (filterPriority === 'all') return true;
    return Number(todo.priority || 2) === Number(filterPriority);
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
    } else {
      // Newest first
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });

  return (
    <div className="space-y-4">
      
      {/* Stats Counter & Priority Filter Bar */}
      {totalCount > 0 && (
        <div className="space-y-3 pb-2">
          
          {/* Main Counters */}
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

            {/* Sort Toggle Button */}
            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'priority' ? 'newest' : 'priority')}
              className="btn-neo bg-white border-3 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
              title="Toggle sorting method"
            >
              <ArrowUpDown className="h-3.5 w-3.5 stroke-[2.5px]" />
              <span>SORT: {sortBy === 'priority' ? '⚡ BY PRIORITY' : '⏱️ BY NEWEST'}</span>
            </button>
          </div>

          {/* Priority Quick Filter Badges */}
          <div className="flex items-center gap-2 flex-wrap px-1 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1">
              <Filter className="h-3 w-3 stroke-[2.5px]" />
              FILTER:
            </span>

            <button
              type="button"
              onClick={() => setFilterPriority('all')}
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
              onClick={() => setFilterPriority(1)}
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
              onClick={() => setFilterPriority(2)}
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
              onClick={() => setFilterPriority(3)}
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
            {filterPriority === 'all' ? "NO TASKS ON BOARD" : `NO P${filterPriority} TASKS FOUND`}
          </h3>
          <p className="font-bold text-sm uppercase tracking-wider text-black/70 max-w-sm mx-auto">
            {filterPriority === 'all' 
              ? "THE QUEUE IS CLEAR. ADD YOUR FIRST TASK ABOVE TO IGNITE THE ENGINE."
              : "TRY SWITCHING FILTERS OR CREATE A TASK WITH THIS PRIORITY LEVEL."}
          </p>
        </div>
      ) : (
        sortedTodos.map((todo) => (
          <Todo
            key={todo.id}
            todoData={todo.text}
            isFinished={todo.finished}
            priority={todo.priority || 2}
            changeFinished={(isFinished) => onFinished(todo.id, isFinished)}
            onDelete={() => onDelete(todo.id)}
            onEdit={(todoText, newPriority) => onEdit(todo.id, todoText, newPriority)}
          />
        ))
      )}

    </div>
  );
}

export default TodoList;