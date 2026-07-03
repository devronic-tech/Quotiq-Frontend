import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'invoice' | 'liability' | 'payroll' | 'subscription';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface FinancialCalendarProps {
  events: CalendarEvent[];
  isLoading?: boolean;
}

export default function FinancialCalendar({ events = [], isLoading }: FinancialCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Helper: Month name
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Switch month handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Check if date has events
  const getEventsForDate = (day: number) => {
    const checkDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date.startsWith(checkDateStr));
  };

  const getPriorityColor = (prio: CalendarEvent['priority']) => {
    switch (prio) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-slate-400';
      default: return 'bg-primary';
    }
  };

  const getEventBadge = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'invoice': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'liability': return 'bg-red-50 text-red-800 border-red-200';
      case 'payroll': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'subscription': return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Render grid days
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const prefixEmptySquares = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Selected date events
  const selectedDateEvents = selectedDate
    ? events.filter(e => {
        const d = new Date(e.date);
        return d.getDate() === selectedDate.getDate() &&
               d.getMonth() === selectedDate.getMonth() &&
               d.getFullYear() === selectedDate.getFullYear();
      })
    : [];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-soft grid grid-cols-1 md:grid-cols-3">
      {/* Calendar Grid */}
      <div className="md:col-span-2 p-md border-r border-outline-variant/30">
        <div className="flex justify-between items-center mb-md">
          <h4 className="font-card-title text-sm text-on-surface flex items-center gap-xs">
            <CalendarIcon size={16} className="text-primary" />
            <span>Outlays Calendar</span>
          </h4>
          <div className="flex items-center gap-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded hover:bg-slate-100 border border-outline-variant/40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-on-surface font-mono min-w-[100px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded hover:bg-slate-100 border border-outline-variant/40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days Week labels */}
        <div className="grid grid-cols-7 text-center font-bold text-[10px] text-on-surface-variant uppercase mb-xs tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-[2px] bg-outline-variant/20 border border-outline-variant/20 rounded-lg overflow-hidden">
          {prefixEmptySquares.map((_, i) => (
            <div key={`empty-${i}`} className="h-14 bg-slate-50/50" />
          ))}
          
          {daysArray.map(day => {
            const dayEvents = getEventsForDate(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
            const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth && selectedDate?.getFullYear() === currentYear;

            return (
              <button
                key={`day-${day}`}
                onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                className={clsx(
                  'h-14 bg-white p-1 flex flex-col justify-between items-start transition-all relative outline-none text-left',
                  isSelected && 'ring-2 ring-primary ring-inset z-10',
                  isToday && 'bg-primary/5'
                )}
              >
                <span className={clsx(
                  'text-xs font-bold font-mono px-1 rounded',
                  isToday ? 'bg-primary text-white' : 'text-on-surface'
                )}>
                  {day}
                </span>

                {/* Event dots */}
                <div className="flex gap-[2px] overflow-hidden w-full flex-wrap max-h-5">
                  {dayEvents.slice(0, 3).map((evt, idx) => (
                    <div
                      key={evt.id}
                      className={clsx('h-1.5 w-1.5 rounded-full shrink-0', getPriorityColor(evt.priority))}
                      title={evt.title}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] font-bold text-on-surface-variant font-mono leading-none">+{dayEvents.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Side List */}
      <div className="p-md bg-surface-container-low flex flex-col h-full">
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-md flex items-center gap-1">
          <Sparkles size={12} className="text-primary" />
          <span>Outflows for {selectedDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) || 'Selected Date'}</span>
        </h5>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-on-surface-variant font-semibold">Loading events...</span>
          </div>
        ) : selectedDateEvents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-white border border-outline-variant/30 rounded-lg p-md">
            <AlertCircle className="text-secondary mb-2" size={24} />
            <h6 className="text-xs font-bold text-on-surface">No Outlays</h6>
            <p className="text-[10px] text-on-surface-variant mt-1">No liabilities, payrolls, or renewals on this date.</p>
          </div>
        ) : (
          <div className="space-y-sm overflow-y-auto max-h-[220px] pr-xs">
            {selectedDateEvents.map(evt => (
              <div
                key={evt.id}
                className="p-sm bg-white border border-outline-variant/40 rounded-lg flex flex-col gap-1 hover:shadow-soft transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-on-surface leading-tight truncate w-2/3">{evt.title}</span>
                  <span className="text-xs font-mono font-bold text-primary">₹{evt.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex gap-sm mt-1 items-center">
                  <span className={clsx('text-[9px] font-bold uppercase border px-1.5 py-0.25 rounded-full', getEventBadge(evt.type))}>
                    {evt.type}
                  </span>
                  <span className={clsx('h-1.5 w-1.5 rounded-full', getPriorityColor(evt.priority))} />
                  <span className="text-[9px] text-on-surface-variant capitalize">{evt.priority} Priority</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
