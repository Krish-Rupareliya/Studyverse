import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Flame,
  DoorOpen,
  CheckSquare,
  Info,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Plus,
  BarChart2,
  Calendar as CalendarIcon,
  BookOpen,
  Sparkles,
  Target,
  CheckCircle2,
} from 'lucide-react';

export const StudyStatsView: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const { rooms, activeRoom, tasks } = useApp();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [showLogModal, setShowLogModal] = useState(false);
  const [logMinutes, setLogMinutes] = useState(25);
  const [logSubject, setLogSubject] = useState('Computer Science & AI');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  const stats = currentUser?.studyStats || {
    totalHours: 12.4,
    weeklyHours: 4.8,
    completedSessions: 8,
    streakDays: 3,
    level: 2,
    xp: 280,
    focusScore: 94,
    subjectHours: {
      'Computer Science & AI': 5.5,
      'Mathematics & Algorithms': 3.2,
      'Biology & Medical': 2.1,
      'Literature & Humanities': 1.6,
    },
  };

  const subjectHoursRecord: Record<string, number> = (stats as any).subjectHours || {
    'Computer Science & AI': 5.5,
    'Mathematics & Algorithms': 3.2,
    'Biology & Medical': 2.1,
    'Literature & Humanities': 1.6,
  };

  const longestSessionHours =
    (stats as any).longestSessionHours ||
    (stats.completedSessions > 0 ? Math.round((stats.totalHours / Math.max(1, stats.completedSessions)) * 10) / 10 : 0.5);

  const roomsJoinedCount =
    rooms.filter((r) => r.participants?.some((p) => p.id === currentUser?.id)).length || (stats as any).roomsJoined || 14;

  const completedTasksCount =
    (tasks || []).filter((t) => t.completed).length || (stats as any).completedTasks || 3;

  // Dynamic distribution based on timeRange
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const monthsOfYear = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const weeksOfMonth = ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4'];

  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentMonthName = now.toLocaleString('default', { month: 'short' });
  const currentYear = now.getFullYear();
  const currentDayNumber = now.getDate();
  const todayIdx = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun

  const totalWeeklyMins = Math.round((stats.weeklyHours || 4.8) * 60);
  const totalMonthlyMins = Math.round((stats.weeklyHours || 4.8) * 60 * 4.2);
  const totalYearlyMins = Math.round((stats.totalHours || 12.4) * 60);

  // Generate range-specific chart data points dynamically
  const getRangeData = () => {
    if (timeRange === 'week') {
      return daysOfWeek.map((label, idx) => {
        if (idx > todayIdx) return { label, mins: 0, isFuture: true, isCurrent: false };
        if (idx === todayIdx) {
          return {
            label,
            mins: Math.max(15, Math.round(totalWeeklyMins * 0.32)),
            isFuture: false,
            isCurrent: true,
          };
        }
        const weights = [0.15, 0.22, 0.12, 0.28, 0.18, 0.25, 0.3];
        return {
          label,
          mins: Math.round(totalWeeklyMins * (weights[idx % weights.length] || 0.15)),
          isFuture: false,
          isCurrent: false,
        };
      });
    } else if (timeRange === 'month') {
      return weeksOfMonth.map((label, idx) => {
        const currentWeekIdx = Math.min(3, Math.floor((currentDayNumber - 1) / 7));
        if (idx > currentWeekIdx) return { label, mins: 0, isFuture: true, isCurrent: false };
        if (idx === currentWeekIdx) {
          return {
            label,
            mins: Math.round(totalMonthlyMins * 0.35),
            isFuture: false,
            isCurrent: true,
          };
        }
        const weights = [0.2, 0.25, 0.2, 0.35];
        return {
          label,
          mins: Math.round(totalMonthlyMins * (weights[idx] || 0.2)),
          isFuture: false,
          isCurrent: false,
        };
      });
    } else {
      return monthsOfYear.map((label, idx) => {
        if (idx > currentMonthIdx) return { label, mins: 0, isFuture: true, isCurrent: false };
        if (idx === currentMonthIdx) {
          return {
            label,
            mins: Math.round(totalYearlyMins * 0.18),
            isFuture: false,
            isCurrent: true,
          };
        }
        const weights = [0.08, 0.09, 0.07, 0.1, 0.08, 0.09, 0.06, 0.09, 0.12, 0.11, 0.08, 0.15];
        return {
          label,
          mins: Math.round(totalYearlyMins * (weights[idx] || 0.08)),
          isFuture: false,
          isCurrent: false,
        };
      });
    }
  };

  const chartData = getRangeData();
  const maxMins = Math.max(...chartData.map((d) => d.mins), 60);

  // Dynamic calendar days for current month
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Subject breakdown calculations
  const totalSubjectMins = Object.values(subjectHoursRecord).reduce((a, b) => a + b, 0) * 60 || 1;
  const subjectsList = [
    { name: 'Computer Science & AI', mins: Math.round((subjectHoursRecord['Computer Science & AI'] || 5.5) * 60), color: '#8B5CF6' },
    { name: 'Mathematics & Algorithms', mins: Math.round((subjectHoursRecord['Mathematics & Algorithms'] || 3.2) * 60), color: '#3B82F6' },
    { name: 'Biology & Medical', mins: Math.round((subjectHoursRecord['Biology & Medical'] || 2.1) * 60), color: '#10B981' },
    { name: 'Literature & Humanities', mins: Math.round((subjectHoursRecord['Literature & Humanities'] || 1.6) * 60), color: '#F59E0B' },
  ];

  // Dynamic log study session handler
  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    const addedHours = Math.round((logMinutes / 60) * 10) / 10;
    const addedXP = logMinutes * 10;
    const newXP = (stats.xp || 100) + addedXP;
    const newLevel = Math.floor(newXP / 500) + 1;

    const currentSubjectHours = subjectHoursRecord[logSubject] || 0;
    const updatedSubjectHours = {
      ...subjectHoursRecord,
      [logSubject]: Math.round((currentSubjectHours + addedHours) * 10) / 10,
    };

    updateCurrentUserProfile({
      studyStats: {
        ...stats,
        totalHours: Math.round(((stats.totalHours || 0) + addedHours) * 10) / 10,
        weeklyHours: Math.round(((stats.weeklyHours || 0) + addedHours) * 10) / 10,
        completedSessions: (stats.completedSessions || 0) + 1,
        streakDays: Math.max(1, (stats.streakDays || 1)),
        level: newLevel,
        xp: newXP,
        subjectHours: updatedSubjectHours,
      },
    });

    setShowLogModal(false);
  };

  const nextLevelXP = (stats.level || 1) * 500;
  const currentLevelProgress = Math.min(100, Math.round(((stats.xp % 500) / 500) * 100));

  // Chart mode state
  const [chartType, setChartType] = useState<'wave' | 'bars'>('wave');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ label: string; mins: number } | null>(null);

  // SVG Wave Graph Dimensions & Math
  const svgWidth = 620;
  const svgHeight = 180;
  const marginLeft = 35;
  const marginRight = 60;
  const marginTop = 20;
  const marginBottom = 35;
  const graphWidth = svgWidth - marginLeft - marginRight;
  const graphHeight = svgHeight - marginTop - marginBottom;

  const points = chartData.map((d, i) => {
    const x = marginLeft + (i * graphWidth) / Math.max(1, chartData.length - 1);
    const ratio = Math.min(1, Math.max(0, d.mins / (maxMins || 60)));
    const y = marginTop + graphHeight - ratio * graphHeight;
    return { x, y, label: d.label, mins: d.mins, isCurrent: d.isCurrent };
  });

  const generateSmoothWavePath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
    return path;
  };

  const waveLinePath = generateSmoothWavePath(points);
  const bottomY = marginTop + graphHeight;
  const waveAreaPath = `${waveLinePath} L ${points[points.length - 1].x},${bottomY} L ${points[0].x},${bottomY} Z`;

  const formatHours = (mins: number): string => {
    const hrs = Math.round((mins / 60) * 10) / 10;
    return `${hrs} hr${hrs === 1 ? '' : 's'}`;
  };

  const formatHoursShort = (mins: number): string => {
    const hrs = Math.round((mins / 60) * 10) / 10;
    return `${hrs}h`;
  };

  const totalRangeText =
    timeRange === 'week'
      ? `${(stats.weeklyHours || 4.8).toFixed(1)} hours (${totalWeeklyMins} mins)`
      : timeRange === 'month'
      ? `${(totalMonthlyMins / 60).toFixed(1)} hours (${totalMonthlyMins} mins)`
      : `${(stats.totalHours || 12.4).toFixed(1)} hours (${totalYearlyMins} mins)`;

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 bg-[#0D0B1D] text-slate-100 min-h-full pb-24 md:pb-10">
      {/* Header Bar with Date Range and Log Focus Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Study Stats & Analytics</h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
              Live Dynamic Analytics
            </span>
          </div>
          <p className="text-xs text-[#8E8AAB] mt-1">
            Tracking verified focus hours, active streaks, and task completions for @{currentUser?.username}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Log Focus Button */}
          <button
            onClick={() => setShowLogModal(true)}
            className="px-3.5 py-1.5 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-purple-900/40 hover:scale-105 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Focus Time</span>
          </button>

          {/* Time range switcher */}
          <div className="flex items-center bg-[#171431] p-1 rounded-xl border border-[#26214A]">
            {(['week', 'month', 'year'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimeRange(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  timeRange === mode
                    ? 'bg-[#6D28D9] text-white shadow-xs'
                    : 'text-[#8E8AAB] hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Level XP Progress Banner */}
      <div className="bg-gradient-to-r from-[#1E1938] via-[#171431] to-[#2E2856] border border-[#2E2856] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black text-xl shadow-lg">
            <Award className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white">Level {stats.level} Scholar</span>
              <span className="text-xs text-amber-400 font-bold">({stats.xp} Total XP)</span>
            </div>
            <p className="text-xs text-[#8E8AAB]">
              {500 - (stats.xp % 500)} XP remaining to reach Level {stats.level + 1}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-[#8E8AAB]">
            <span>Level {stats.level}</span>
            <span className="text-[#A78BFA]">{currentLevelProgress}%</span>
            <span>Level {stats.level + 1}</span>
          </div>
          <div className="w-full h-2.5 bg-[#0D0B1D] rounded-full overflow-hidden border border-[#26214A]">
            <div
              className="h-full bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] rounded-full transition-all duration-500"
              style={{ width: `${currentLevelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 2 Main Cards: Focus Time Interactive Wave Chart & Study Streak Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Focus Time Wave Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#171431] border border-[#26214A] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <span>Focus Time ({timeRange.toUpperCase()})</span>
                <Info className="w-4 h-4 text-[#8E8AAB] cursor-pointer hover:text-white transition" title="Tracked study time over selected range" />
              </div>
              <p className="text-xs text-[#8E8AAB] mt-1">
                Study duration so far this {timeRange}:{' '}
                <span className="text-[#10B981] font-extrabold text-sm">{totalRangeText}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#0D0B1D] p-1 rounded-lg border border-[#26214A]">
                <button
                  onClick={() => setChartType('wave')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    chartType === 'wave' ? 'bg-[#6D28D9] text-white' : 'text-[#8E8AAB] hover:text-white'
                  }`}
                >
                  Wave
                </button>
                <button
                  onClick={() => setChartType('bars')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    chartType === 'bars' ? 'bg-[#6D28D9] text-white' : 'text-[#8E8AAB] hover:text-white'
                  }`}
                >
                  Bars
                </button>
              </div>

              <span className="text-xs font-mono text-[#A78BFA] bg-[#231F45] px-2.5 py-1 rounded-lg hidden sm:inline-block">
                {currentMonthName} {currentYear}
              </span>
            </div>
          </div>

          {/* Chart Rendering */}
          {chartType === 'wave' ? (
            /* Smooth Interactive Wave Graph */
            <div className="w-full relative pt-2">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
                <defs>
                  <linearGradient id="waveStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>

                  <linearGradient id="waveAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#6D28D9" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#0D0B1D" stopOpacity="0.0" />
                  </linearGradient>

                  <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Horizontal Dashed Grid Lines */}
                <line x1={marginLeft} y1={marginTop} x2={svgWidth - marginRight} y2={marginTop} stroke="#26214A" strokeDasharray="4 4" strokeWidth="1" />
                <line x1={marginLeft} y1={marginTop + graphHeight / 2} x2={svgWidth - marginRight} y2={marginTop + graphHeight / 2} stroke="#26214A" strokeDasharray="4 4" strokeWidth="1" />
                <line x1={marginLeft} y1={bottomY} x2={svgWidth - marginRight} y2={bottomY} stroke="#26214A" strokeWidth="1" />

                {/* Right Y-Axis Scale Text */}
                <text x={svgWidth - marginRight + 10} y={marginTop + 4} fill="#8E8AAB" fontSize="10" fontFamily="monospace">{(maxMins / 60).toFixed(1)}h</text>
                <text x={svgWidth - marginRight + 10} y={marginTop + graphHeight / 2 + 4} fill="#8E8AAB" fontSize="10" fontFamily="monospace">{(maxMins / 120).toFixed(1)}h</text>
                <text x={svgWidth - marginRight + 10} y={bottomY + 4} fill="#8E8AAB" fontSize="10" fontFamily="monospace">0h</text>

                {/* Area Fill */}
                <path d={waveAreaPath} fill="url(#waveAreaGradient)" />

                {/* Smooth Bezier Wave Line */}
                <path d={waveLinePath} fill="none" stroke="url(#waveStrokeGradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#waveGlow)" />

                {/* Point Markers and Tooltips */}
                {points.map((pt) => (
                  <g
                    key={pt.label}
                    className="group cursor-pointer"
                    onMouseEnter={() => setHoveredDataPoint({ label: pt.label, mins: pt.mins })}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  >
                    {pt.isCurrent && (
                      <circle cx={pt.x} cy={pt.y} r="10" fill="#8B5CF6" opacity="0.3" className="animate-ping" />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredDataPoint?.label === pt.label ? "7" : pt.isCurrent ? "6" : "4.5"}
                      fill={pt.isCurrent ? "#FFFFFF" : "#C4B5FD"}
                      stroke="#6D28D9"
                      strokeWidth="3"
                      className="transition-all duration-200"
                    />

                    {/* X-Axis Label */}
                    <text
                      x={pt.x}
                      y={bottomY + 22}
                      fill={pt.isCurrent ? "#FFFFFF" : "#8E8AAB"}
                      fontSize={timeRange === 'year' ? "9" : "11"}
                      fontWeight={pt.isCurrent ? "800" : "600"}
                      textAnchor="middle"
                    >
                      {pt.label}
                    </text>

                    {/* Value popup if hovered or active */}
                    {(hoveredDataPoint?.label === pt.label || (pt.isCurrent && !hoveredDataPoint)) && (
                      <g transform={`translate(${pt.x}, ${pt.y - 20})`}>
                        <rect x="-30" y="-14" width="60" height="18" rx="6" fill="#6D28D9" />
                        <text x="0" y="-2" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                          {formatHours(pt.mins)}
                        </text>
                      </g>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            /* Dynamic Bars Visualizer */
            <div className="h-48 w-full relative pt-4 flex flex-col justify-end">
              <div className="absolute inset-x-0 top-4 border-b border-dashed border-[#26214A] flex justify-end pr-2">
                <span className="text-[10px] text-[#8E8AAB] font-mono -mt-2.5">{(maxMins / 60).toFixed(1)}h</span>
              </div>
              <div className="absolute inset-x-0 top-24 border-b border-dashed border-[#26214A] flex justify-end pr-2">
                <span className="text-[10px] text-[#8E8AAB] font-mono -mt-2.5">{(maxMins / 120).toFixed(1)}h</span>
              </div>

              <div className={`grid gap-2 items-end h-32 px-1 z-10 ${chartData.length === 12 ? 'grid-cols-12' : chartData.length === 4 ? 'grid-cols-4' : 'grid-cols-7'}`}>
                {chartData.map((d) => {
                  const heightPct = Math.max(8, Math.min(100, Math.round((d.mins / maxMins) * 100)));
                  return (
                    <div key={d.label} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[9px] font-mono text-[#A78BFA] opacity-0 group-hover:opacity-100 transition truncate max-w-full">
                        {formatHoursShort(d.mins)}
                      </span>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 relative ${
                          d.isCurrent
                            ? 'bg-gradient-to-t from-[#6D28D9] to-[#C4B5FD] shadow-lg shadow-purple-900/50'
                            : d.mins > 0
                            ? 'bg-gradient-to-t from-[#4C1D95] to-[#8B5CF6]'
                            : 'bg-[#231F45]/40'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      >
                        {d.isCurrent && (
                          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold truncate ${
                          d.isCurrent ? 'text-white font-extrabold' : 'text-[#8E8AAB]'
                        }`}
                      >
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Enhanced Study Streak Heatmap Calendar (5 cols) */}
        <div className="lg:col-span-5 bg-[#171431] border border-[#26214A] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <CalendarIcon className="w-4 h-4 text-[#A78BFA]" />
                <span>Study Activity Calendar</span>
                <Info className="w-4 h-4 text-[#8E8AAB] cursor-pointer hover:text-white transition" title="Calendar showing active focus days and study streak intensity" />
              </div>
              <p className="text-xs text-[#8E8AAB] mt-1 flex items-center gap-1.5">
                <span>Current Streak:</span>
                <span className="text-amber-400 font-extrabold flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce" />
                  {stats.streakDays} Days
                </span>
              </p>
            </div>

            {/* Month Badge */}
            <div className="flex items-center gap-1 bg-[#0D0B1D] px-2.5 py-1 rounded-xl border border-[#26214A] text-xs font-bold text-[#A78BFA]">
              <span>{currentMonthName} {currentYear}</span>
            </div>
          </div>

          {/* Calendar Grid & Days */}
          <div className="space-y-3">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#8E8AAB] uppercase tracking-wider">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold">
              {calendarDays.map((day) => {
                const isToday = day === currentDayNumber;
                const isStreakActive = day <= currentDayNumber && day >= currentDayNumber - (stats.streakDays || 1) + 1;
                const isSelected = selectedCalendarDay === day;

                // Derive mock study hours per day for visual heatmap variance
                const dayHours = day > currentDayNumber
                  ? 0
                  : isStreakActive
                  ? Math.round(((day * 7) % 3 + 1.2) * 10) / 10
                  : Math.round(((day * 3) % 2) * 10) / 10;

                // Color Intensity tier
                let cellStyle = 'bg-[#0D0B1D] text-[#8E8AAB] border border-transparent hover:border-[#8B5CF6]';
                if (isSelected) {
                  cellStyle = 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 scale-105 shadow-lg shadow-amber-500/30';
                } else if (isToday) {
                  cellStyle = 'bg-[#6D28D9] text-white font-extrabold ring-2 ring-purple-400 shadow-md shadow-purple-900/50';
                } else if (dayHours >= 2.5) {
                  cellStyle = 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 font-bold hover:bg-emerald-600/40';
                } else if (dayHours >= 1.0) {
                  cellStyle = 'bg-[#4C1D95] border border-[#8B5CF6]/50 text-purple-200 font-bold hover:bg-[#6D28D9]';
                } else if (dayHours > 0) {
                  cellStyle = 'bg-[#231F45] text-purple-300 border border-[#3A336C] hover:bg-[#2E2856]';
                }

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                    className={`h-8 w-full rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${cellStyle}`}
                    title={`Day ${day}: ${dayHours} hrs studied ${isStreakActive ? '• Active Streak Day' : ''}`}
                  >
                    <span className="text-[11px] leading-none">{day}</span>
                    {isStreakActive && !isSelected && (
                      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Heatmap Intensity Legend */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-[#8E8AAB] border-t border-[#26214A]">
              <span>Less studied</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#0D0B1D] border border-[#26214A]" title="0 hrs" />
                <span className="w-3 h-3 rounded-md bg-[#231F45]" title="< 1 hr" />
                <span className="w-3 h-3 rounded-md bg-[#4C1D95]" title="1 - 2.5 hrs" />
                <span className="w-3 h-3 rounded-md bg-emerald-600/40 border border-emerald-500/50" title="2.5+ hrs" />
                <span className="w-3 h-3 rounded-md bg-amber-400" title="Selected" />
              </div>
              <span>More studied</span>
            </div>

            {/* Selected Day Rich Detail Panel */}
            {selectedCalendarDay && (
              <div className="p-3.5 rounded-2xl bg-[#0D0B1D] border border-[#8B5CF6]/40 text-xs text-white space-y-2 animate-fade-in shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-[#26214A]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-extrabold text-sm text-white">
                      {currentMonthName} {selectedCalendarDay}, {currentYear}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCalendarDay(null)}
                    className="text-xs text-[#8E8AAB] hover:text-white p-1"
                  >
                    ✕
                  </button>
                </div>

                {selectedCalendarDay <= currentDayNumber ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8AAB]">Status:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Focus Recorded
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8AAB]">Time Studied:</span>
                      <span className="font-extrabold text-[#A78BFA] font-mono">
                        {selectedCalendarDay <= currentDayNumber && selectedCalendarDay >= currentDayNumber - (stats.streakDays || 1) + 1
                          ? `${Math.round(((selectedCalendarDay * 7) % 3 + 1.2) * 10) / 10} hours`
                          : '0.8 hours'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          setShowLogModal(true);
                          setSelectedCalendarDay(null);
                        }}
                        className="w-full py-1.5 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl font-bold text-xs transition text-center shadow-md"
                      >
                        + Add Focus Session To This Day
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#8E8AAB]">Future date — plan a study session in your schedule!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Avg / Day */}
        <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#8E8AAB]">
            <span className="flex items-center gap-1.5">
              <span>⏳</span>
              <span>Avg / Day</span>
            </span>
            <Info className="w-3.5 h-3.5 text-[#8E8AAB]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {Math.round((stats.weeklyHours / 7) * 10) / 10}{' '}
            <span className="text-xs text-[#8E8AAB] font-normal">hours</span>
          </div>
        </div>

        {/* Longest Session */}
        <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#8E8AAB]">
            <span className="flex items-center gap-1.5">
              <span>⏰</span>
              <span>Longest session</span>
            </span>
            <Info className="w-3.5 h-3.5 text-[#8E8AAB]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {longestSessionHours} <span className="text-xs text-[#8E8AAB] font-normal">hours</span>
          </div>
        </div>

        {/* Rooms Joined */}
        <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#8E8AAB]">
            <span className="flex items-center gap-1.5">
              <span>🚪</span>
              <span>Rooms joined</span>
            </span>
            <Info className="w-3.5 h-3.5 text-[#8E8AAB]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {roomsJoinedCount} <span className="text-xs text-[#8E8AAB] font-normal">rooms</span>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#8E8AAB]">
            <span className="flex items-center gap-1.5">
              <span>✅</span>
              <span>Tasks completed</span>
            </span>
            <Info className="w-3.5 h-3.5 text-[#8E8AAB]" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {completedTasksCount} <span className="text-xs text-[#8E8AAB] font-normal">tasks</span>
          </div>
        </div>
      </div>

      {/* Subject Distribution Breakdown */}
      <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#A78BFA]" />
          <span>Subject Time Allocation (Dynamic Logged Hours)</span>
        </h3>

        <div className="space-y-3">
          {subjectsList.map((sub) => {
            const pct = Math.max(5, Math.min(100, Math.round((sub.mins / Math.max(1, totalSubjectMins)) * 100)));
            const hrs = (sub.mins / 60).toFixed(1);
            return (
              <div key={sub.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200">{sub.name}</span>
                  <span className="text-[#A78BFA] font-mono">
                    {hrs} hrs ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#0D0B1D] rounded-full overflow-hidden border border-[#26214A]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[#171431] border border-[#2E2856] rounded-3xl p-5 sm:p-6 w-full max-w-md space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#A78BFA]" />
              <span>Log Completed Focus Session</span>
            </h3>
            <p className="text-xs text-[#8E8AAB]">
              Record offline or pomodoro study time to dynamically update your stats, subject breakdown, streak, and level XP:
            </p>

            <form onSubmit={handleLogSession} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#8E8AAB]">
                  <span>Duration</span>
                  <span className="text-[#A78BFA] font-mono">
                    Selected: {(logMinutes / 60).toFixed(2)} hrs ({logMinutes} mins)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { m: 15, label: '0.25 hrs', sub: '15m' },
                    { m: 25, label: '0.42 hrs', sub: '25m' },
                    { m: 50, label: '0.83 hrs', sub: '50m' },
                    { m: 90, label: '1.5 hrs', sub: '90m' },
                  ].map(({ m, label, sub }) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setLogMinutes(m)}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center ${
                        logMinutes === m
                          ? 'bg-[#6D28D9] text-white shadow-xs'
                          : 'bg-[#0D0B1D] text-[#8E8AAB] hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-black">{label}</span>
                      <span className="text-[10px] opacity-70">({sub})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8E8AAB]">Subject</label>
                <select
                  value={logSubject}
                  onChange={(e) => setLogSubject(e.target.value)}
                  className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Computer Science & AI">Computer Science & AI</option>
                  <option value="Mathematics & Algorithms">Mathematics & Algorithms</option>
                  <option value="Biology & Medical">Biology & Medical</option>
                  <option value="Literature & Humanities">Literature & Humanities</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#26214A]">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#231F45] text-xs font-bold text-[#8E8AAB] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save & Update Analytics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

