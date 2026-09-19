import { useState } from "react";
import { Check, Edit2, Save, Trash2, Flame, Zap, Coffee } from "lucide-react";

function Todo({ todoData, isFinished, priority = 2, changeFinished, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todoData);
  const [editedPriority, setEditedPriority] = useState(priority);

  const handleToggle = () => {
    changeFinished(!isFinished);
  };

  const handleEditCommit = () => {
    if (isEditing) {
      const textToSave = editedText.trim() ? editedText.trim() : todoData;
      onEdit(textToSave, editedPriority);
      setIsEditing(false);
    } else {
      setEditedText(todoData);
      setEditedPriority(priority);
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditCommit();
    } else if (e.key === 'Escape') {
      setEditedText(todoData);
      setEditedPriority(priority);
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
              
              {/* Priority switcher in edit mode */}
              <div className="flex items-center gap-2 pt-1">
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
                      onClick={() => setEditedPriority(pNum)}
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
            onClick={onDelete}
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
