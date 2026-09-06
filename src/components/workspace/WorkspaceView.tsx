import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutGrid,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Flame,
  CheckSquare,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const WorkspaceView: React.FC = () => {
  const { currentUser } = useAuth();
  const { tasks, addTask, toggleTask, deleteTask } = useApp();

  const userTasks = tasks.filter((t) => t.userId === currentUser.id);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Computer Science');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskEstHours, setNewTaskEstHours] = useState(2);

  // Exam Sprint Roadmap Generator
  const [examGoalInput, setExamGoalInput] = useState('');
  const [daysAvailable, setDaysAvailable] = useState(7);
  const [planLoading, setPlanLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      priority: newTaskPriority,
      estimatedHours: newTaskEstHours,
      completed: false,
    });

    setNewTaskTitle('');
  };

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examGoalInput.trim()) return;
    setPlanLoading(true);
    setGeneratedPlan(null);

    setTimeout(() => {
      const target = examGoalInput.trim();
      const p1Days = Math.max(1, Math.floor(daysAvailable * 0.3));
      const p2Days = Math.max(1, Math.floor(daysAvailable * 0.4));
      const p3Days = Math.max(1, daysAvailable - p1Days - p2Days);

      const plan = `### 🎯 Sprint Study Schedule for ${target}\n\n` +
        `📅 **Total Timeline**: ${daysAvailable} Days\n\n` +
        `• **Phase 1 (Days 1-${p1Days}) — Foundations & Core Concepts**:\n` +
        `  - Review lecture slides & key definitions.\n` +
        `  - Run 2x 50-minute focused Pomodoro rounds per day.\n\n` +
        `• **Phase 2 (Days ${p1Days + 1}-${p1Days + p2Days}) — Practice Problems & Weak Spots**:\n` +
        `  - Complete past exam problems and high-yield question sets.\n` +
        `  - Schedule study room review sessions with peer partners.\n\n` +
        `• **Phase 3 (Days ${daysAvailable - p3Days + 1}-${daysAvailable}) — Timed Simulation & Final Review**:\n` +
        `  - Run 1 full timed practice simulation under test conditions.\n` +
        `  - Conduct final active recall flashcard reviews.`;

      setGeneratedPlan(plan);
      setPlanLoading(false);
    }, 250);
  };

  const completedCount = userTasks.filter((t) => t.completed).length;
  const progressPercent = userTasks.length > 0 ? Math.round((completedCount / userTasks.length) * 100) : 0;

  return (
    <div id="workspace-container" className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Workspace Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Personal Study Workspace</h1>
          </div>
          <p className="text-xs text-slate-500">
            Organize study sprints, track task completion, and create structured sprint schedules for your upcoming exams.
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl flex items-center gap-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Sprint Completion</div>
            <div className="text-lg font-bold text-slate-900">
              {completedCount} / {userTasks.length} Tasks ({progressPercent}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600/30 flex items-center justify-center font-bold text-xs text-indigo-700">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Grid: Task Organizer & Exam Sprint Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Task Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Add New Study Task</span>
            </h3>

            <div className="space-y-3 text-xs">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g., Read Chapters 4-6 on Dynamic Programming & Complete 5 LeetCode problems..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Subject</label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  >
                    <option>Computer Science</option>
                    <option>Pre-Med / MCAT</option>
                    <option>Calculus / Math</option>
                    <option>Law / Bar Prep</option>
                    <option>Physics</option>
                    <option>General Study</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority 🚨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newTaskEstHours}
                    onChange={(e) => setNewTaskEstHours(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Workspace</span>
                </button>
              </div>
            </div>
          </form>

          {/* Tasks List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <span>Active Task Queue ({userTasks.length})</span>
              </h3>
            </div>

            {userTasks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs space-y-2">
                <p className="font-medium text-slate-700">No active tasks in your queue.</p>
                <p>Create your first study goal above to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {userTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 shadow-xs ${
                      task.completed
                        ? 'bg-slate-50/70 border-slate-200 opacity-65'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="text-slate-400 hover:text-indigo-600 transition shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <span
                          className={`text-xs font-semibold block truncate ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="text-indigo-600 font-medium">{task.subject}</span>
                          <span>•</span>
                          <span>{task.estimatedHours} hrs est.</span>
                          <span>•</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                              task.priority === 'high'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : task.priority === 'medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Exam Sprint Roadmap Planner */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50/50 via-white to-white border border-indigo-100 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Exam Sprint Roadmap Planner</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe your target exam, topics, or deadline to generate a structured daily sprint roadmap tailored to your schedule.
            </p>

            <form onSubmit={handleGeneratePlan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Target Exam or Goal</label>
                <input
                  type="text"
                  required
                  value={examGoalInput}
                  onChange={(e) => setExamGoalInput(e.target.value)}
                  placeholder="e.g., CS61B Midterm 2 (Trees, Graphs, Sorting)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Days Remaining</label>
                <select
                  value={daysAvailable}
                  onChange={(e) => setDaysAvailable(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={3}>3 Days (Crash Sprint)</option>
                  <option value={7}>7 Days (1 Week Deep Dive)</option>
                  <option value={14}>14 Days (Comprehensive Plan)</option>
                  <option value={30}>30 Days (Full Semester Mastery)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={planLoading || !examGoalInput.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <span>{planLoading ? 'Generating Sprint Plan...' : 'Generate Sprint Plan'}</span>
              </button>
            </form>

            {generatedPlan && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2 text-slate-800 shadow-2xs">
                <span className="font-bold text-indigo-700 block">Personalized Study Plan</span>
                <div className="whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto text-slate-700 font-sans">
                  {generatedPlan}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

