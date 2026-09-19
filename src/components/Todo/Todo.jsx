import { useState } from "react";
import { Check, Edit2, Save, Trash2, Flame, Zap, Coffee, Calendar, Clock, X } from "lucide-react";
import { playClickSound, playSuccessSound, playDeleteSound } from "../../utils/audio";
import { triggerNeoConfetti } from "../../utils/confetti";

function Todo({ todoData, isFinished, priority = 2, dueDate = null, changeFinished, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todoData);
  const [editedPriority, setEditedPriority] = useState(priority);
  const [editedDueDate, setEditedDueDate] = useState(dueDate || '');

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !isFinished && Boolean(dueDate) && dueDate < todayStr;
  const isToday = Boolean(dueDate) && dueDate === todayStr;

  const handleToggle = (e) => {
    const nextFinished = !isFinished;
    if (nextFinished) {
      playSuccessSound();
      const rect = e?.currentTarget?.getBoundingClientRect();
      const originX = rect ? rect.left + rect.width / 2 : undefined;
      const originY = rect ? rect.top + rect.height / 2 : undefined;
      triggerNeoConfetti(originX, originY);
    } else {
      playClickSound();
    }
    changeFinished(nextFinished);
  };

  const handleDelete = () => {
    playDeleteSound();
    onDelete();
  };

  const handleEditCommit = () => {
    if (isEditing) {
      playClickSound();
      const textToSave = editedText.trim() ? editedText.trim() : todoData;
      onEdit(textToSave, editedPriority, editedDueDate || null);
      setIsEditing(false);
    } else {
      playClickSound();
      setEditedText(todoData);
      setEditedPriority(priority);
      setEditedDueDate(dueDate || '');
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditCommit();
    } else if (e.key === 'Escape') {
      playClickSound();
      setEditedText(todoData);
      setEditedPriority(priority);
      setEditedDueDate(dueDate || '');
      setIsEditing(false);
    }
  };

  const getPriorityMeta = (p) => {
    switch (Number(p)) {
      case 1:
        return { label: 'P1 // URGENT', short: 'P1', icon: Flame, bg: 'bg-[#FF6B6B]', text: 'text-white' };
      case 3:
        return { label: 'P3 // LOW', short: 'P3', icon: Coffee, bg: 'bg-[#C4B5FD]', text: 'text-black' };
      case 2:
      default:
        return { label: 'P2 // MEDIUM', short: 'P2', icon: Zap, bg: 'bg-[#FFD93D]', text: 'text-black' };
    }
  };

  const currentPriorityMeta = getPriorityMeta(priority);
  const PriorityIcon = currentPriorityMeta.icon;

  return (
    <div className={`card-neo border-4 border-black p-4 sm:p-5 mb-5 transition-all duration-150 ${
      isFinished 
        ? "bg-[#F5F5F0] shadow-[4px_4px_0px_#000]" 
        : isOverdue
          ? "bg-[#FFF5F5] border-[#FF6B6B] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] shadow-[6px_6px_0px_#000]"
          : "bg-white hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] shadow-[6px_6px_0px_#000]"
    }`}>
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
        
        {/* Custom Mechanical Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          role="checkbox"
          aria-checked={isFinished}
          className={`w-8 h-8 shrink-0 border-4 border-black flex items-center justify-center transition-all cursor-pointer shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
            isFinished ? "bg-black text-[#FFD93D]" : "bg-white hover:bg-[#FFD93D]"
          }`}
          title={isFinished ? "Mark as incomplete" : "Mark as completed"}
        >
          {isFinished && <Check className="h-5 w-5 stroke-[4px]" />}
        </button>

        {/* Priority Badge */}
        {!isEditing && (
          <span
            className={`border-3 border-black px-2.5 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1.5 shrink-0 ${
              currentPriorityMeta.bg
            } ${currentPriorityMeta.text}`}
            title={`Priority ${priority}`}
          >
            <PriorityIcon className="h-3.5 w-3.5 stroke-[2.5px]" />
            <span>{currentPriorityMeta.short}</span>
          </span>
        )}

        {/* Due Date Badge (Non-edit mode) */}
        {!isEditing && dueDate && (
          <span
            className={`border-2 border-black px-2.5 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1 shrink-0 ${
              isOverdue
                ? "bg-[#FF6B6B] text-white animate-pulse"
                : isToday
                  ? "bg-[#FFD93D] text-black"
                  : "bg-white text-black"
            }`}
            title={isOverdue ? "Overdue deadline!" : `Due ${dueDate}`}
          >
            {isOverdue ? (
              <>
                <Clock className="h-3.5 w-3.5 stroke-[3px]" />
                <span>OVERDUE: {dueDate}</span>
              </>
            ) : isToday ? (
              <>
                <Calendar className="h-3.5 w-3.5 stroke-[2.5px]" />
                <span>DUE TODAY</span>
              </>
            ) : (
              <>
                <Calendar className="h-3.5 w-3.5 stroke-[2.5px]" />
                <span>{dueDate}</span>
              </>
            )}
          </span>
        )}

        {/* Task Text / Inline Edit */}
        <div className="flex-1 min-w-[200px]">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="input-neo py-2 px-3 text-base w-full bg-[#FFD93D] border-4 border-black"
              />
              
              {/* Priority and Due Date switchers in edit mode */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-black">
                    PRIORITY:
                  </span>
                  {[1, 2, 3].map((pNum) => {
                    const meta = getPriorityMeta(pNum);
                    const Icon = meta.icon;
                    const isSelected = editedPriority === pNum;
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setEditedPriority(pNum);
                        }}
                        className={`border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                          meta.bg
                        } ${meta.text} ${
                          isSelected ? "ring-2 ring-black font-black shadow-[2px_2px_0px_#000]" : "opacity-50"
                        }`}
                      >
                        <Icon className="h-3 w-3 stroke-[2.5px]" />
                        <span>{meta.short}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Due Date picker in edit mode */}
                <div className="flex items-center gap-1.5 border-2 border-black bg-white px-2 py-0.5 shadow-[2px_2px_0px_#000]">
                  <Calendar className="h-3 w-3 stroke-[2.5px]" />
                  <input
                    type="date"
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                    className="text-xs font-black uppercase outline-none bg-transparent cursor-pointer"
                  />
                  {editedDueDate && (
                    <button
                      type="button"
                      onClick={() => setEditedDueDate('')}
                      className="text-black hover:text-[#FF6B6B]"
                      title="Clear deadline"
                    >
                      <X className="h-3 w-3 stroke-[3px]" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <span
              onClick={handleToggle}
              className={`block font-bold text-base sm:text-lg tracking-tight select-none cursor-pointer transition-colors ${
                isFinished
                  ? "line-through decoration-[4px] decoration-[#FF6B6B] text-black/40"
                  : "text-black hover:text-black/80"
              }`}
            >
              {todoData}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0">
          
          {/* Edit / Save Button */}
          <button
            type="button"
            onClick={handleEditCommit}
            className={`btn-neo border-4 border-black px-3.5 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] ${
              isEditing 
                ? "bg-[#C4B5FD] text-black" 
                : "bg-[#FFD93D] text-black"
            }`}
            title={isEditing ? "Save changes" : "Edit task"}
          >
            {isEditing ? (
              <>
                <Save className="h-3.5 w-3.5 stroke-[3px]" />
                <span>SAVE</span>
              </>
            ) : (
              <>
                <Edit2 className="h-3.5 w-3.5 stroke-[3px]" />
                <span>EDIT</span>
              </>
            )}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="btn-neo bg-[#FF6B6B] text-white border-4 border-black px-3.5 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000]"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5 stroke-[3px]" />
            <span>DELETE</span>
          </button>

        </div>

      </div>
    </div>
  );
}

export default Todo;
