import React, { useState } from 'react';
import { Calendar, Edit3, Check, Trash2, Info } from 'lucide-react';

interface DayActivity {
  dayName: string;
  date: number;
  activity: string;
}

const DEFAULT_DAYS = [
  { dayName: 'Monday', date: 1, activity: 'Read Array Data Structures' },
  { dayName: 'Tuesday', date: 2, activity: 'Implement Singly Linked List' },
  { dayName: 'Wednesday', date: 3, activity: 'Solve Stack LeetCode Problems' },
  { dayName: 'Thursday', date: 4, activity: 'Study Circular Queues' },
  { dayName: 'Friday', date: 5, activity: 'Hanoi Tower Recursion Tracing' },
  { dayName: 'Saturday', date: 6, activity: 'Build Binary Search Tree' },
  { dayName: 'Sunday', date: 7, activity: 'Revise Graph BFS and DFS' },
];

export default function CalendarVisualizer() {
  const [calendar, setCalendar] = useState<DayActivity[]>(DEFAULT_DAYS);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDate, setEditDate] = useState<number>(1);
  const [editActivity, setEditActivity] = useState<string>('');

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditDate(calendar[index].date);
    setEditActivity(calendar[index].activity);
  };

  const saveEdit = (index: number) => {
    const updated = [...calendar];
    updated[index] = {
      ...updated[index],
      date: editDate,
      activity: editActivity,
    };
    setCalendar(updated);
    setEditingIndex(null);
  };

  const clearDay = (index: number) => {
    const updated = [...calendar];
    updated[index] = {
      ...updated[index],
      activity: 'No activity scheduled',
    };
    setCalendar(updated);
  };

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
          <Calendar size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display">
            Program 1: Weekly Activity Calendar
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Interactive representation of structure-based calendar allocation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {calendar.map((item, index) => (
          <div
            key={item.dayName}
            className="flex flex-col justify-between p-4 rounded-xl border border-gray-200 dark:border-cyan-500/20 bg-gray-50/50 dark:bg-[#070B14]/50 backdrop-blur-sm transition-all hover:scale-[1.02]"
          >
            <div>
              <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                <span className="text-sm font-extrabold uppercase tracking-wider text-cyan-500 dark:text-cyan-400 break-words">
                  {item.dayName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold font-mono whitespace-nowrap shrink-0">
                  Date: {editingIndex === index ? (
                    <input
                      type="number"
                      value={editDate}
                      onChange={(e) => setEditDate(Number(e.target.value))}
                      className="w-10 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 text-center rounded outline-none"
                    />
                  ) : item.date}
                </span>
              </div>

              <div className="min-h-[60px] text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                {editingIndex === index ? (
                  <textarea
                    value={editActivity}
                    onChange={(e) => setEditActivity(e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 rounded-lg outline-none resize-none focus:border-cyan-500"
                  />
                ) : (
                  item.activity
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-200/50 dark:border-cyan-500/20/50">
              {editingIndex === index ? (
                <button
                  onClick={() => saveEdit(index)}
                  className="p-1.5 bg-green-500 text-white rounded-lg hover:scale-105 active:scale-95 transition-all"
                  title="Save Details"
                >
                  <Check size={16} />
                </button>
              ) : (
                <button
                  onClick={() => startEditing(index)}
                  className="p-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:text-cyan-500 dark:text-cyan-400 hover:scale-105 active:scale-95 transition-all"
                  title="Edit Day Details"
                >
                  <Edit3 size={16} />
                </button>
              )}
              <button
                onClick={() => clearDay(index)}
                className="p-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:text-red-500 hover:scale-105 active:scale-95 transition-all"
                title="Clear Activity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20">
        <Info className="text-cyan-500 dark:text-cyan-400 dark:text-cyan-400 shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-cyan-800 dark:text-cyan-300 dark:font-code leading-relaxed font-medium">
          <strong>DSA Concept Connection:</strong> This visualizer mimics a dynamic memory array of structures (`struct Day*`). Each calendar item acts as an index containing pointer properties mapping to values. Inline editing simulates reading from user input and saving to designated memory structures.
        </p>
      </div>
    </div>
  );
}
