/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Table as TableIcon, 
  Plus, 
  Search, 
  Bell, 
  Settings, 
  ChevronRight,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Calendar,
  User,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layout,
  Smartphone,
  Megaphone,
  Edit2,
  Trash2,
  MessageSquare,
  Send,
  GripVertical,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { it } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { cn } from './lib/utils';
import { Project, Task, ViewType, Status, Priority, SubTask, TeamMember } from './types';
import { INITIAL_PROJECTS, INITIAL_TASKS, TEAM_MEMBERS } from './constants';

const LoginScreen = ({ onLogin, user, setUser, pass, setPass, error }: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0a0c10] border border-slate-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-4">
            <LayoutDashboard size={32} className="text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-semibold tracking-tight text-white">P</span>
            <div className="flex items-center gap-1 px-0.5">
              <div className="flex flex-col gap-1">
                <div className="w-1.5 h-1.5 bg-[#9b2226] rounded-full" />
                <div className="w-1.5 h-1.5 bg-[#9b2226] rounded-full" />
              </div>
              <div className="w-1.5 h-1.5 bg-[#9b2226] rounded-full" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">CONS</span>
          </div>
          <p className="text-slate-500 text-sm mt-2">Accedi per continuare</p>
        </div>

        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Utente</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text" 
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="Nome utente"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs py-2 px-3 rounded-lg flex items-center gap-2"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] mt-2"
          >
            Accedi
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Components ---

const CalendarView = ({ tasks, onEditTask }: { tasks: Task[], onEditTask: (task: Task) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="h-full flex flex-col bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
        <h3 className="text-lg font-bold text-white tracking-tight capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: it })}
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            Oggi
          </button>
          <button 
            onClick={nextMonth}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-slate-900/50 border-b border-slate-800">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
          <div key={day} className="py-2 text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
        {calendarDays.map((day, idx) => {
          const dayTasks = tasks.filter(task => {
            try {
              return isSameDay(parseISO(task.dueDate), day);
            } catch (e) {
              return false;
            }
          });

          return (
            <div 
              key={idx} 
              className={cn(
                "min-h-[90px] p-1.5 border-r border-b border-slate-800/50 transition-colors",
                !isSameMonth(day, monthStart) && "bg-slate-950/20",
                isSameDay(day, new Date()) && "bg-blue-500/5"
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={cn(
                  "text-[11px] font-medium",
                  !isSameMonth(day, monthStart) ? "text-slate-700" : "text-slate-400",
                  isSameDay(day, new Date()) && "text-blue-400 font-bold"
                )}>
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[8px] font-bold text-slate-600 bg-slate-800 px-1 py-0.5 rounded-full">
                    {dayTasks.length}
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                {dayTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className={cn(
                      "w-full text-left p-1 rounded-md text-[9px] font-medium truncate transition-all border border-transparent hover:border-white/10",
                      task.priority === 'high' ? "bg-rose-500/10 text-rose-400" :
                      task.priority === 'medium' ? "bg-amber-500/10 text-amber-400" :
                      "bg-slate-800/50 text-slate-400"
                    )}
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DraggableAny = Draggable as any;

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  color,
  onEdit,
  onDelete
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick?: () => void,
  color?: string,
  onEdit?: () => void,
  onDelete?: () => void,
  key?: any
}) => {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (showMenu) {
      const handleClick = () => setShowMenu(false);
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [showMenu]);

  return (
    <div className={cn("relative group/sidebar", showMenu && "z-50")}>
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
          active 
            ? "bg-white/10 text-white shadow-sm" 
            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        )}
      >
        <div className={cn(
          "p-1.5 rounded-md",
          active ? "bg-white/10" : "bg-slate-800 group-hover:bg-slate-700"
        )}>
          <Icon size={16} style={{ color: color || 'inherit' }} />
        </div>
        <span className="font-medium text-sm truncate flex-1 text-left">{label}</span>
        
        {active && !onEdit && (
          <motion.div 
            layoutId="active-pill"
            className="w-1.5 h-1.5 rounded-full bg-blue-400"
          />
        )}
      </button>

      {(onEdit || onDelete) && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={cn(
              "p-1 rounded-md hover:bg-white/10 text-slate-500 hover:text-slate-200 transition-all",
              showMenu ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"
            )}
          >
            <MoreHorizontal size={14} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-1 w-32 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-[70] overflow-hidden"
              >
                {onEdit && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles = {
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", styles[priority])}>
      {priority}
    </span>
  );
};

const TaskCard = ({ 
  task, 
  onToggleSubtask,
  onToggleTask,
  onEdit,
  onDelete,
  onDuplicate,
  onAddComment,
  onEditComment,
  onDeleteComment,
  provided,
  isDragging
}: { 
  task: Task, 
  onToggleSubtask: (taskId: string, subtaskId: string) => void,
  onToggleTask: (taskId: string) => void,
  onEdit: (task: Task) => void,
  onDelete: (taskId: string) => void,
  onDuplicate: (task: Task) => void,
  onAddComment: (taskId: string, comment: string) => void,
  onEditComment: (taskId: string, commentId: string, text: string) => void,
  onDeleteComment: (taskId: string, commentId: string) => void,
  provided?: any,
  isDragging?: boolean
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleSaveComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(task.id, commentText);
      setCommentText('');
      setIsCommenting(false);
    }
  };

  const handleEditComment = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (editingCommentText.trim()) {
      onEditComment(task.id, commentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText('');
    }
  };

  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      style={provided?.draggableProps.style}
      className={cn(
        "relative group outline-none",
        isDragging && "z-50"
      )}
    >
      <div
        className={cn(
          "bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl hover:border-slate-600 transition-all duration-200",
          isDragging && "shadow-2xl border-blue-500/50 bg-slate-800 ring-2 ring-blue-500/20 scale-[1.02]",
          "cursor-grab active:cursor-grabbing"
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <GripVertical size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsCommenting(!isCommenting);
              }}
              className="text-slate-500 hover:text-blue-400 p-1 rounded-md hover:bg-slate-700/50 transition-colors"
              title="Add comment"
            >
              <MessageSquare size={16} />
            </button>
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-slate-700/50"
              >
                <MoreHorizontal size={16} />
              </button>
              
              <AnimatePresence>
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-1 w-32 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-20 overflow-hidden"
                    >
                      <button 
                        onClick={() => {
                          onEdit(task);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Settings size={12} />
                        Edit Task
                      </button>
                      <button 
                        onClick={() => {
                          onDuplicate(task);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <Copy size={12} />
                        Duplicate
                      </button>
                      <button 
                        onClick={() => {
                          onDelete(task.id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                      >
                        <AlertCircle size={12} />
                        Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleTask(task.id);
            }}
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
              task.status === 'done' ? "bg-emerald-500 border-emerald-500" : "border-slate-700 hover:border-slate-500"
            )}
          >
            {task.status === 'done' && <CheckCircle2 size={12} className="text-white" />}
          </button>
          <h4 className={cn("text-slate-100 font-semibold line-clamp-2", task.status === 'done' && "text-slate-500 line-through")}>{task.title}</h4>
        </div>
        <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
        
        {totalSubtasks > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={10} className={cn(progress === 100 ? "text-emerald-400" : "text-slate-500")} />
                <span>Checklist</span>
              </div>
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={cn(
                  "h-full transition-all duration-500",
                  progress === 100 ? "bg-emerald-500" : "bg-blue-500"
                )}
              />
            </div>
            <div className="space-y-1.5">
              {task.subtasks.map(sub => (
                <button 
                  key={sub.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSubtask(task.id, sub.id);
                  }}
                  className="w-full flex items-center gap-2 text-[10px] text-slate-400 hover:text-slate-200 transition-colors text-left group/sub"
                >
                  <div className={cn(
                    "w-3 h-3 rounded-sm border flex items-center justify-center transition-all",
                    sub.completed 
                      ? "bg-blue-500 border-blue-500" 
                      : "border-slate-700 group-hover/sub:border-slate-500"
                  )}>
                    {sub.completed && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className={cn(
                    "transition-all",
                    sub.completed && "line-through opacity-50"
                  )}>
                    {sub.title}
                  </span>
                  {sub.assignee && (
                    <img 
                      src={sub.assignee.avatar} 
                      className="ml-auto w-4 h-4 rounded-full border border-slate-700 opacity-60 group-hover/sub:opacity-100 transition-opacity" 
                      title={sub.assignee.name} 
                      alt={sub.assignee.name}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {isCommenting && (
          <form onSubmit={handleSaveComment} className="mb-4 flex gap-2">
            <input 
              autoFocus
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Send size={14} />
            </button>
          </form>
        )}

        {task.comments && task.comments.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <MessageSquare size={10} />
              <span>Comments</span>
            </div>
            <div className="space-y-1.5">
              {task.comments.map((comment) => (
                <div key={comment.id} className="group/comment bg-slate-900/50 border border-slate-700/30 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 leading-relaxed relative">
                  {editingCommentId === comment.id ? (
                    <form onSubmit={(e) => handleEditComment(e, comment.id)} className="flex gap-2">
                      <input 
                        autoFocus
                        type="text"
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button 
                        type="submit"
                        className="text-blue-400 hover:text-blue-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Send size={10} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="pr-10">{comment.text}</div>
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCommentId(comment.id);
                            setEditingCommentText(comment.text);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                        >
                          <Edit2 size={10} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteComment(task.id, comment.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar size={12} />
            <span className="text-[10px] font-medium">{task.dueDate}</span>
          </div>
          <img 
            src={task.assignee.avatar} 
            alt={task.assignee.name} 
            className="w-6 h-6 rounded-full border border-slate-700"
          />
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === 'P-Cons2026' && loginPass === 'Estate26!') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Credenziali non valide');
    }
  };

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProject] = useState<string>(INITIAL_PROJECTS[0].id);
  const [view, setView] = useState<ViewType>('kanban');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    status: 'todo' as Status,
    dueDate: new Date().toISOString().split('T')[0],
    subtasks: [] as SubTask[],
    assigneeId: TEAM_MEMBERS[0].id
  });
  const [newProject, setNewProject] = useState({
    name: '',
    color: '#3b82f6',
    icon: 'Layout'
  });
  const [newMember, setNewMember] = useState({
    name: '',
    avatar: 'https://i.pravatar.cc/150?u=' + Math.random().toString(36).substr(2, 5)
  });
  const [tempSubtask, setTempSubtask] = useState('');
  const [tempSubtaskAssigneeId, setTempSubtaskAssigneeId] = useState<string>('');
  const [columnLabels, setColumnLabels] = useState<Record<Status, string>>({
    todo: 'To Do',
    'in-progress': 'In Progress',
    review: 'Review',
    done: 'Completed'
  });
  const [editingColumn, setEditingColumn] = useState<Status | null>(null);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [filters, setFilters] = useState<{
    priority: Priority | 'all';
    status: Status | 'all';
    assigneeId: string | 'all';
  }>({
    priority: 'all',
    status: 'all',
    assigneeId: 'all'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTask = () => {
    if (!newTask.title) return;

    const { assigneeId, ...taskData } = newTask;
    const assignee = teamMembers.find(m => m.id === assigneeId) || teamMembers[0];

    if (editingTaskId) {
      setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, ...taskData, assignee } : t));
    } else {
      const task: Task = {
        id: Math.random().toString(36).substr(2, 9),
        ...taskData,
        projectId: activeProject,
        assignee
      };
      setTasks([task, ...tasks]);
    }

    closeModal();
  };

  const handleAddProject = () => {
    if (!newProject.name) return;
    
    if (editingProjectId) {
      setProjects(prev => prev.map(p => p.id === editingProjectId ? { ...p, ...newProject } : p));
      setEditingProjectId(null);
    } else {
      const project: Project = {
        id: Math.random().toString(36).substr(2, 9),
        ...newProject
      };
      setProjects([...projects, project]);
      setActiveProject(project.id);
    }
    
    setIsProjectModalOpen(false);
    setNewProject({ name: '', color: '#3b82f6', icon: 'Layout' });
  };

  const handleAddMember = () => {
    if (!newMember.name) return;

    if (editingMemberId) {
      setTeamMembers(prev => prev.map(m => m.id === editingMemberId ? { ...m, ...newMember } : m));
      setEditingMemberId(null);
    } else {
      const member: TeamMember = {
        id: Math.random().toString(36).substr(2, 9),
        ...newMember
      };
      setTeamMembers([...teamMembers, member]);
    }

    setIsTeamModalOpen(false);
    setNewMember({ name: '', avatar: 'https://i.pravatar.cc/150?u=' + Math.random().toString(36).substr(2, 5) });
  };

  const openEditMemberModal = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setNewMember({
      name: member.name,
      avatar: member.avatar
    });
    setIsTeamModalOpen(true);
  };

  const handleDeleteMember = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Member',
      message: 'Are you sure you want to remove this team member?',
      onConfirm: () => {
        setTeamMembers(prev => prev.filter(m => m.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const openEditProjectModal = (project: Project) => {
    setEditingProjectId(project.id);
    setNewProject({
      name: project.name,
      color: project.color,
      icon: project.icon
    });
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) {
      setAlertModal({
        isOpen: true,
        title: 'Cannot Delete',
        message: 'You must have at least one project.'
      });
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? All associated tasks will be lost.',
      onConfirm: () => {
        setProjects(prev => prev.filter(p => p.id !== id));
        setTasks(prev => prev.filter(t => t.projectId !== id));
        if (activeProject === id) {
          const remainingProjects = projects.filter(p => p.id !== id);
          setActiveProject(remainingProjects[0].id);
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      subtasks: task.subtasks,
      assigneeId: task.assignee.id
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTaskId(null);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
      subtasks: [],
      assigneeId: teamMembers[0]?.id || ''
    });
  };

  const deleteTask = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      onConfirm: () => {
        setTasks(prev => prev.filter(t => t.id !== id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const duplicateTask = (task: Task) => {
    const newTaskObj: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      title: `${task.title} (Copy)`,
      subtasks: task.subtasks.map(s => ({ ...s, id: Math.random().toString(36).substr(2, 9) })),
      comments: []
    };
    setTasks(prev => [...prev, newTaskObj]);
  };

  const addSubtask = () => {
    if (!tempSubtask.trim()) return;
    const assignee = teamMembers.find(m => m.id === tempSubtaskAssigneeId);
    setNewTask({
      ...newTask,
      subtasks: [...newTask.subtasks, { 
        id: Math.random().toString(36).substr(2, 9), 
        title: tempSubtask, 
        completed: false,
        assignee
      }]
    });
    setTempSubtask('');
    setTempSubtaskAssigneeId('');
  };

  const removeSubtask = (id: string) => {
    setNewTask({
      ...newTask,
      subtasks: newTask.subtasks.filter(s => s.id !== id)
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        subtasks: task.subtasks.map(sub => {
          if (sub.id !== subtaskId) return sub;
          return { ...sub, completed: !sub.completed };
        })
      };
    }));
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        status: task.status === 'done' ? 'todo' : 'done'
      };
    }));
  };

  const addComment = (taskId: string, commentText: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== taskId) return task;
      const newComment = {
        id: Math.random().toString(36).substr(2, 9),
        text: commentText,
        createdAt: new Date().toISOString()
      };
      return {
        ...task,
        comments: [...(task.comments || []), newComment]
      };
    }));
  };

  const editComment = (taskId: string, commentId: string, newText: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        comments: (task.comments || []).map(c => 
          c.id === commentId ? { ...c, text: newText } : c
        )
      };
    }));
  };

  const deleteComment = (taskId: string, commentId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        comments: (task.comments || []).filter(c => c.id !== commentId)
      };
    }));
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId as Status;

    setTasks((prevTasks: Task[]) => {
      const newTasks = Array.from(prevTasks);
      const taskIndex = newTasks.findIndex((t: Task) => t.id === taskId);
      if (taskIndex === -1) return prevTasks;

      const [movedTask] = newTasks.splice(taskIndex, 1);
      movedTask.status = newStatus;

      // Find the correct insertion point in the newTasks array
      // based on the destination index within the destination column.
      let count = 0;
      let insertAt = newTasks.length;
      for (let i = 0; i < newTasks.length; i++) {
        if ((newTasks[i] as Task).status === newStatus) {
          if (count === destination.index) {
            insertAt = i;
            break;
          }
          count++;
        }
      }
      
      newTasks.splice(insertAt, 0, movedTask);
      return newTasks;
    });
  };

  const downloadExcel = () => {
    const data = filteredTasks.map(task => {
      const row: any = {
        'Task Name': task.title,
        'Status': task.status,
        'Priorità': task.priority,
        'Responsabile': task.assignee.name,
        'Scadenza': task.dueDate,
        'Commento': task.comments && task.comments.length > 0 ? task.comments[task.comments.length - 1].text : ''
      };

      // Add subtasks and their assignees
      task.subtasks?.forEach((sub, i) => {
        const suffix = i === 0 ? '' : ` ${i + 1}`;
        row[`Sub-task${suffix}`] = sub.title;
        row[`Responsabile Sub-task${suffix}`] = sub.assignee?.name || '';
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    
    XLSX.writeFile(workbook, `tasks_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const importExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const newTasksFromExcel: Task[] = jsonData.map((row) => {
          const taskName = row['Task name'] || row['Task Name'] || 'Untitled Task';
          const statusStr = String(row['Status'] || 'todo').toLowerCase();
          const priorityStr = String(row['Priorità'] || row['Priority'] || 'medium').toLowerCase();
          const responsabile = row['Responsabile'];
          const scadenza = row['Scadenza'];
          const commento = row['Commento'];

          // Map status
          let status: Status = 'todo';
          if (statusStr.includes('progress')) status = 'in-progress';
          else if (statusStr.includes('review')) status = 'review';
          else if (statusStr.includes('done') || statusStr.includes('completato')) status = 'done';

          // Map priority
          let priority: Priority = 'medium';
          if (priorityStr.includes('low') || priorityStr.includes('bassa')) priority = 'low';
          else if (priorityStr.includes('high') || priorityStr.includes('alta')) priority = 'high';

          // Find assignee
          const assignee = teamMembers.find(m => m.name.toLowerCase() === String(responsabile || '').toLowerCase()) || teamMembers[0];

          // Collect all subtasks from columns starting with "Sub-task" or "Sub-Task"
          const subtasks: SubTask[] = [];
          const keys = Object.keys(row);
          keys.forEach((key, index) => {
            const lowerKey = key.toLowerCase();
            if (lowerKey.startsWith('sub-task') && row[key]) {
              // Default to main task assignee
              let subAssignee = assignee;
              
              // Check if the next column is a "Responsabile" for this sub-task
              const nextKey = keys[index + 1];
              if (nextKey && nextKey.toLowerCase().includes('responsabile') && row[nextKey]) {
                const foundAssignee = teamMembers.find(m => 
                  m.name.toLowerCase() === String(row[nextKey]).toLowerCase()
                );
                if (foundAssignee) subAssignee = foundAssignee;
              }

              subtasks.push({
                id: Math.random().toString(36).substr(2, 9),
                title: String(row[key]),
                completed: false,
                assignee: subAssignee
              });
            }
          });

          return {
            id: Math.random().toString(36).substr(2, 9),
            title: taskName,
            description: '',
            status,
            priority,
            assignee,
            dueDate: scadenza || new Date().toISOString().split('T')[0],
            projectId: activeProject,
            subtasks,
            comments: commento ? [{
              id: Math.random().toString(36).substr(2, 9),
              text: String(commento),
              createdAt: new Date().toISOString()
            }] : []
          };
        });

        setTasks(prev => [...prev, ...newTasksFromExcel]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        setAlertModal({
          isOpen: true,
          title: 'Import Completato',
          message: `Importati con successo ${newTasksFromExcel.length} task.`
        });
      } catch (error) {
        console.error('Error importing excel:', error);
        setAlertModal({
          isOpen: true,
          title: 'Errore Import',
          message: 'Si è verificato un errore durante la lettura del file Excel.'
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.projectId === activeProject && 
      (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       t.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filters.priority === 'all' || t.priority === filters.priority) &&
      (filters.status === 'all' || t.status === filters.status) &&
      (filters.assigneeId === 'all' || t.assignee.id === filters.assigneeId)
    );
  }, [tasks, activeProject, searchQuery, filters]);

  const currentProject = useMemo(() => 
    projects.find(p => p.id === activeProject) || projects[0]
  , [activeProject, projects]);

  const columns = useMemo(() => [
    { id: 'todo' as Status, label: columnLabels.todo, icon: Clock, color: 'text-slate-400' },
    { id: 'in-progress' as Status, label: columnLabels['in-progress'], icon: AlertCircle, color: 'text-blue-400' },
    { id: 'review' as Status, label: columnLabels.review, icon: Search, color: 'text-amber-400' },
    { id: 'done' as Status, label: columnLabels.done, icon: CheckCircle2, color: 'text-emerald-400' },
  ], [columnLabels]);

  const getIcon = (name: string) => {
    switch(name) {
      case 'Layout': return Layout;
      case 'Smartphone': return Smartphone;
      case 'Megaphone': return Megaphone;
      default: return Layout;
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLogin={handleLogin}
        user={loginUser}
        setUser={setLoginUser}
        pass={loginPass}
        setPass={setLoginPass}
        error={loginError}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#0f1115] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col bg-[#0a0c10] relative z-40">
        <div className="p-6 flex items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-semibold tracking-tight text-white">P</span>
            <div className="flex items-center gap-1 px-0.5">
              <div className="flex flex-col gap-1">
                <div className="w-1.5 h-1.5 bg-[#9b2226] rounded-full" />
                <div className="w-1.5 h-1.5 bg-[#9b2226] rounded-full" />
              </div>
              <div className="w-1.5 h-1.5 bg-[#9b2226] rounded-full" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">CONS</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto py-4">
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Main</p>
            <div className="space-y-1">
              <SidebarItem 
                icon={LayoutDashboard} 
                label="Dashboard" 
                active={view !== 'team' && view !== 'calendar'} 
                onClick={() => setView('kanban')} 
              />
              <SidebarItem 
                icon={Calendar} 
                label="Calendar" 
                active={view === 'calendar'}
                onClick={() => setView('calendar')}
              />
              <SidebarItem 
                icon={User} 
                label="Team" 
                active={view === 'team'} 
                onClick={() => setView('team')} 
              />
            </div>
          </div>

          <div>
            <div className="px-3 flex justify-between items-center mb-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projects</p>
              <button 
                onClick={() => setIsProjectModalOpen(true)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map(project => (
                <SidebarItem 
                  key={project.id}
                  icon={getIcon(project.icon)} 
                  label={project.name} 
                  active={activeProject === project.id}
                  onClick={() => setActiveProject(project.id)}
                  color={project.color}
                  onEdit={() => openEditProjectModal(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 flex justify-center">
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-500 hover:text-white flex items-center gap-2 w-full px-4">
            <Settings size={18} />
            <span className="text-sm font-medium">Impostazioni</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-bottom border-slate-800 flex items-center justify-between px-8 bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search tasks, projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <Plus size={18} />
              New Task
            </button>
          </div>
        </header>

        {/* Modals */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-6">{editingTaskId ? 'Edit Task' : 'Create New Task'}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Task Title</label>
                    <input 
                      type="text" 
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                      placeholder="What needs to be done?"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                    <textarea 
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Add more details..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm h-20 resize-none focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Checklist (Sub-tasks)</label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        value={tempSubtask}
                        onChange={e => setTempSubtask(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addSubtask()}
                        placeholder="Add sub-task..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <select 
                        value={tempSubtaskAssigneeId}
                        onChange={e => setTempSubtaskAssigneeId(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-300"
                      >
                        <option value="">Assegna...</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={addSubtask}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-900/20"
                      >
                        <Send size={14} />
                        Invia
                      </button>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                      {newTask.subtasks.map(sub => (
                        <div key={sub.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-lg group">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-300">{sub.title}</span>
                            {sub.assignee && (
                              <div className="flex items-center gap-1 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-700/50">
                                <img src={sub.assignee.avatar} className="w-3 h-3 rounded-full" alt={sub.assignee.name} />
                                <span className="text-[9px] text-slate-500 font-medium">{sub.assignee.name}</span>
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => removeSubtask(sub.id)}
                            className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Plus size={14} className="rotate-45" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Responsabile</label>
                      <select 
                        value={newTask.assigneeId}
                        onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Priorità</label>
                      <select 
                        value={newTask.priority}
                        onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Scadenza</label>
                      <input 
                        type="date" 
                        value={newTask.dueDate}
                        onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-sm font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddTask}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                  >
                    {editingTaskId ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Team Member Modal */}
          {isTeamModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsTeamModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    {editingMemberId ? 'Edit Member' : 'Add Team Member'}
                  </h3>
                  <button onClick={() => setIsTeamModalOpen(false)} className="text-slate-500 hover:text-white">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex justify-center">
                    <div className="relative group">
                      <img src={newMember.avatar} className="w-24 h-24 rounded-full border-4 border-slate-800" alt="Avatar Preview" />
                      <button 
                        onClick={() => setNewMember(prev => ({ ...prev, avatar: 'https://i.pravatar.cc/150?u=' + Math.random().toString(36).substr(2, 5) }))}
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 transition-all"
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter member name" 
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex gap-3">
                  <button 
                    onClick={() => setIsTeamModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddMember}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
                  >
                    {editingMemberId ? 'Save Changes' : 'Add Member'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {isProjectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsProjectModalOpen(false);
                  setEditingProjectId(null);
                  setNewProject({ name: '', color: '#3b82f6', icon: 'Layout' });
                }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-6">{editingProjectId ? 'Edit Project' : 'Create New Project'}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Project Name</label>
                    <input 
                      type="text" 
                      value={newProject.name}
                      onChange={e => setNewProject({...newProject, name: e.target.value})}
                      placeholder="e.g., Marketing Q2"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Project Color</label>
                    <div className="flex gap-3">
                      {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                        <button
                          key={color}
                          onClick={() => setNewProject({...newProject, color})}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all",
                            newProject.color === color ? "border-white scale-110" : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Icon</label>
                    <div className="flex gap-3">
                      {['Layout', 'Smartphone', 'Megaphone'].map(icon => (
                        <button
                          key={icon}
                          onClick={() => setNewProject({...newProject, icon})}
                          className={cn(
                            "p-3 rounded-lg border transition-all",
                            newProject.icon === icon 
                              ? "bg-blue-600/20 border-blue-500 text-blue-400" 
                              : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
                          )}
                        >
                          {React.createElement(getIcon(icon), { size: 20 })}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => {
                      setIsProjectModalOpen(false);
                      setEditingProjectId(null);
                      setNewProject({ name: '', color: '#3b82f6', icon: 'Layout' });
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-sm font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddProject}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                  >
                    {editingProjectId ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {alertModal.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{alertModal.title}</h3>
                <p className="text-sm text-slate-400 mb-6">{alertModal.message}</p>
                <button 
                  onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                  OK
                </button>
              </motion.div>
            </div>
          )}

          {confirmModal.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{confirmModal.title}</h3>
                <p className="text-sm text-slate-400 mb-6">{confirmModal.message}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-sm font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmModal.onConfirm}
                    className="flex-1 px-4 py-2 rounded-lg bg-rose-600 text-sm font-semibold text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/20"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Project Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <span>Projects</span>
            <ChevronRight size={12} />
            <span className="text-slate-300 font-medium">{currentProject.name}</span>
          </div>
          
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-inner" style={{ backgroundColor: currentProject.color }}>
                  {React.createElement(getIcon(currentProject.icon), { size: 24 })}
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{currentProject.name}</h2>
              </div>
              <p className="text-slate-400 text-sm">Manage your team tasks and project milestones.</p>
            </div>

            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 shadow-xl">
              {[
                { id: 'kanban', icon: LayoutDashboard, label: 'Board' },
                { id: 'list', icon: ListTodo, label: 'List' },
                { id: 'table', icon: TableIcon, label: 'Table' },
                { id: 'calendar', icon: Calendar, label: 'Calendar' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id as ViewType)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    view === v.id 
                      ? "bg-slate-800 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <v.icon size={16} />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-y border-slate-800/50">
            <div className="flex items-center gap-6">
              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    isFilterOpen || filters.priority !== 'all' || filters.status !== 'all' || filters.assigneeId !== 'all'
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                      : "text-slate-400 hover:text-white border border-transparent"
                  )}
                >
                  <Filter size={16} />
                  Filter
                  {(filters.priority !== 'all' || filters.status !== 'all' || filters.assigneeId !== 'all') && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-4 space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Priority</label>
                        <div className="flex flex-wrap gap-2">
                          {['all', 'low', 'medium', 'high'].map(p => (
                            <button
                              key={p}
                              onClick={() => setFilters({ ...filters, priority: p as any })}
                              className={cn(
                                "px-2 py-1 rounded text-[10px] font-semibold capitalize transition-all",
                                filters.priority === p 
                                  ? "bg-blue-600 text-white" 
                                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                        >
                          <option value="all">All Statuses</option>
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Responsabile</label>
                        <select
                          value={filters.assigneeId}
                          onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                        >
                          <option value="all">All Members</option>
                          {teamMembers.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>

                      <button 
                        onClick={() => setFilters({ priority: 'all', status: 'all', assigneeId: 'all' })}
                        className="w-full py-2 text-[10px] font-bold text-slate-500 hover:text-rose-400 uppercase tracking-widest transition-colors border-t border-slate-800 pt-3"
                      >
                        Reset Filters
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {view === 'table' && (
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={importExcel}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors"
                  >
                    <Upload size={16} />
                    Import Excel
                  </button>
                  <button 
                    onClick={downloadExcel}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors"
                  >
                    <Download size={16} />
                    Download Excel
                  </button>
                </div>
              )}
            </div>
            <div className="text-sm text-slate-500">
              Showing <span className="text-slate-300 font-semibold">{filteredTasks.length}</span> tasks
            </div>
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
          <AnimatePresence mode="wait">
            {view === 'calendar' && (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full"
              >
                <CalendarView tasks={filteredTasks} onEditTask={openEditModal} />
              </motion.div>
            )}
            {view === 'team' && (
              <motion.div 
                key="team"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Team Members</h2>
                    <p className="text-slate-400 text-sm">
                      Active sub-tasks for project: <span className="text-blue-400 font-semibold">{projects.find(p => p.id === activeProject)?.name}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsTeamModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                  >
                    <Plus size={18} />
                    Add Member
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {teamMembers.map(member => {
                    const memberSubtasks = tasks
                      .filter(t => t.projectId === activeProject)
                      .flatMap(t => t.subtasks.map(s => ({ ...s, parentTaskTitle: t.title })))
                      .filter(s => s.assignee?.id === member.id && !s.completed);

                    const memberActiveTasksCount = tasks.filter(t => 
                      t.projectId === activeProject && 
                      t.status !== 'done' && 
                      (
                        t.assignee.id === member.id || 
                        t.subtasks.some(s => s.assignee?.id === member.id && !s.completed)
                      )
                    ).length;

                    return (
                      <div key={member.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                          <img src={member.avatar} className="w-16 h-16 rounded-full border-2 border-slate-800" alt={member.name} />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white truncate">{member.name}</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Team Member</p>
                          </div>
                        </div>

                        <div className="flex-1 space-y-3 mb-6">
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Active Sub-tasks</p>
                          {memberSubtasks.length > 0 ? (
                            <div className="space-y-2">
                              {memberSubtasks.map(sub => (
                                <div key={sub.id} className="bg-slate-900/80 border border-slate-800/50 rounded-lg p-2.5 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    <p className="text-[11px] text-slate-200 font-medium leading-tight">{sub.title}</p>
                                  </div>
                                  <p className="text-[9px] text-slate-500 italic pl-3.5">in: {sub.parentTaskTitle}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-700 italic">No active sub-tasks in this project</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <ListTodo size={14} />
                            <span>{memberActiveTasksCount} Active Tasks</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => openEditMemberModal(member)}
                              className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {view !== 'team' && view === 'kanban' && (
              <DragDropContext onDragEnd={onDragEnd}>
                <motion.div 
                  key="kanban"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-6 h-full min-w-max"
                >
                  {columns.map(col => (
                    <div key={col.id} className="w-80 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                          <col.icon size={16} className={col.color} />
                          {editingColumn === col.id ? (
                            <input 
                              autoFocus
                              className="bg-slate-800 border border-blue-500 rounded px-1 py-0.5 text-sm font-bold text-slate-200 uppercase tracking-wider outline-none"
                              value={columnLabels[col.id]}
                              onChange={(e) => setColumnLabels({...columnLabels, [col.id]: e.target.value})}
                              onBlur={() => setEditingColumn(null)}
                              onKeyPress={(e) => e.key === 'Enter' && setEditingColumn(null)}
                            />
                          ) : (
                            <h3 
                              onClick={() => setEditingColumn(col.id)}
                              className="font-bold text-slate-200 text-sm uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors"
                            >
                              {col.label}
                            </h3>
                          )}
                          <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {filteredTasks.filter(t => t.status === col.id).length}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            setNewTask(prev => ({ ...prev, status: col.id }));
                            setIsModalOpen(true);
                          }}
                          className="text-slate-600 hover:text-slate-400"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <Droppable droppableId={col.id}>
                        {(provided, snapshot) => (
                          <div 
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={cn(
                              "flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar rounded-xl transition-colors",
                              snapshot.isDraggingOver ? "bg-slate-800/20" : "bg-transparent"
                            )}
                          >
                            {filteredTasks.filter(t => t.status === col.id).map((task, index) => (
                              <DraggableAny key={task.id} draggableId={task.id} index={index}>
                                {(provided: any, snapshot: any) => (
                                  <TaskCard 
                                    task={task} 
                                    onToggleSubtask={toggleSubtask}
                                    onToggleTask={toggleTaskStatus}
                                    onEdit={openEditModal}
                                    onDelete={deleteTask}
                                    onDuplicate={duplicateTask}
                                    onAddComment={addComment}
                                    onEditComment={editComment}
                                    onDeleteComment={deleteComment}
                                    provided={provided}
                                    isDragging={snapshot.isDragging}
                                  />
                                )}
                              </DraggableAny>
                            ))}
                            {provided.placeholder}
                            {filteredTasks.filter(t => t.status === col.id).length === 0 && !snapshot.isDraggingOver && (
                              <div className="border-2 border-dashed border-slate-800 rounded-xl h-24 flex items-center justify-center text-slate-600 text-xs italic">
                                No tasks here
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </motion.div>
              </DragDropContext>
            )}

            {view === 'list' && (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto w-full space-y-4 py-4"
              >
                {filteredTasks.map(task => (
                  <div key={task.id} className="bg-slate-800/30 border border-slate-800 p-4 rounded-xl flex items-start gap-4 hover:border-slate-700 transition-all group">
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-1 shrink-0",
                        task.status === 'done' ? "bg-emerald-500 border-emerald-500" : "border-slate-700 hover:border-slate-500"
                      )}
                    >
                      {task.status === 'done' && <CheckCircle2 size={12} className="text-white" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={cn("font-semibold text-sm cursor-pointer hover:text-blue-400 transition-colors", task.status === 'done' && "text-slate-500 line-through")} onClick={() => openEditModal(task)}>{task.title}</h4>
                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded-full">
                            <MessageSquare size={10} />
                            <span>{task.comments.length}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{task.description}</p>
                      
                      {/* Sub-tasks */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-3 space-y-2 pl-4 border-l border-slate-800/50">
                          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-1">Sub-tasks</p>
                          {task.subtasks.map(sub => (
                            <div key={sub.id} className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleSubtask(task.id, sub.id)}
                                className={cn(
                                  "w-3 h-3 rounded-sm border flex items-center justify-center transition-all shrink-0",
                                  sub.completed ? "bg-blue-500 border-blue-500" : "border-slate-700 hover:border-slate-500"
                                )}
                              >
                                {sub.completed && <CheckCircle2 size={8} className="text-white" />}
                              </button>
                              <span className={cn(
                                "text-[11px] transition-all",
                                sub.completed ? "text-slate-600 line-through" : "text-slate-400"
                              )}>
                                {sub.title}
                              </span>
                              {sub.assignee && (
                                <div className="flex items-center gap-1.5 ml-auto bg-slate-900/50 px-2 py-0.5 rounded-full border border-slate-800/50">
                                  <img src={sub.assignee.avatar} className="w-3 h-3 rounded-full" alt={sub.assignee.name} />
                                  <span className="text-[9px] text-slate-500 font-medium">{sub.assignee.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comments */}
                      {task.comments && task.comments.length > 0 && (
                        <div className="mt-4 space-y-2 pl-4 border-l border-blue-500/20">
                          <p className="text-[9px] font-bold text-blue-500/50 uppercase tracking-wider mb-1">Comments</p>
                          {task.comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-2 text-[10px] text-slate-400 bg-slate-900/30 p-2 rounded-lg border border-slate-800/30">
                              <MessageSquare size={10} className="mt-0.5 text-blue-400/50 shrink-0" />
                              <span className="leading-relaxed">{comment.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <PriorityBadge priority={task.priority} />
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium bg-slate-900 px-2 py-1 rounded-md border border-slate-800/50">
                        <Calendar size={10} />
                        {task.dueDate}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => openEditModal(task)}
                          className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => duplicateTask(task)}
                          className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-all"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {view === 'table' && (
              <motion.div 
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden"
              >
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Task Name</th>
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Priorità</th>
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Responsabile</th>
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Scadenza</th>
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Commento</th>
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredTasks.map(task => (
                      <tr key={task.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <button 
                              onClick={() => toggleTaskStatus(task.id)}
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 shrink-0",
                                task.status === 'done' ? "bg-emerald-500 border-emerald-500" : "border-slate-700 hover:border-slate-500"
                              )}
                            >
                              {task.status === 'done' && <CheckCircle2 size={12} className="text-white" />}
                            </button>
                            <div className="flex-1">
                              <div className={cn("font-semibold text-slate-200", task.status === 'done' && "text-slate-500 line-through")}>{task.title}</div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[200px] mb-2">{task.description}</div>
                            </div>
                          </div>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="space-y-1.5 ml-1">
                              {task.subtasks.map(sub => (
                                <div key={sub.id} className="flex items-center gap-2 group/sub">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubtask(task.id, sub.id);
                                    }}
                                    className={cn(
                                      "w-3 h-3 rounded-sm border flex items-center justify-center transition-all",
                                      sub.completed 
                                        ? "bg-blue-500 border-blue-500" 
                                        : "border-slate-700 group-hover/sub:border-slate-500"
                                    )}
                                  >
                                    {sub.completed && <CheckCircle2 size={8} className="text-white" />}
                                  </button>
                                  <span className={cn(
                                    "text-[10px] transition-all flex-1",
                                    sub.completed ? "text-slate-600 line-through" : "text-slate-400"
                                  )}>
                                    {sub.title}
                                  </span>
                                  {sub.assignee && (
                                    <img 
                                      src={sub.assignee.avatar} 
                                      className="w-3.5 h-3.5 rounded-full border border-slate-800 opacity-60 group-hover/sub:opacity-100 transition-opacity" 
                                      title={sub.assignee.name} 
                                      alt={sub.assignee.name}
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", 
                              task.status === 'todo' ? "bg-slate-500" :
                              task.status === 'in-progress' ? "bg-blue-500" :
                              task.status === 'review' ? "bg-amber-500" : "bg-emerald-500"
                            )}></div>
                            <span className="capitalize text-xs font-medium text-slate-400">{task.status.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <img src={task.assignee.avatar} className="w-6 h-6 rounded-full" alt={task.assignee.name} />
                            <span className="text-xs text-slate-400">{task.assignee.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                          {task.dueDate}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 italic max-w-[200px] truncate">
                          {task.comments && task.comments.length > 0 ? task.comments[task.comments.length - 1].text : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => openEditModal(task)}
                              className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => duplicateTask(task)}
                              className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-all"
                            >
                              <Copy size={14} />
                            </button>
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}} />
    </div>
  );
}
