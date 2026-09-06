import React, { useState } from 'react';
import { Hash, Plus, RotateCcw, AlertCircle, Info } from 'lucide-react';

const TABLE_SIZE = 10;

export default function HashTableVisualizer() {
  const [table, setTable] = useState<(number | null)[]>(Array(TABLE_SIZE).fill(null));
  const [keyInput, setKeyInput] = useState('');
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [probedCells, setProbedCells] = useState<number[]>([]);
  const [logs, setLogs] = useState<string[]>(['Hash table initialized with size 10 (indices 0-9).']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [msg, ...prev]);
  };

  const insertKey = () => {
    setErrorMsg(null);
    setActiveCell(null);
    setProbedCells([]);

    const key = parseInt(keyInput, 10);
    if (isNaN(key) || key < 0) {
      setErrorMsg('Please enter a valid positive integer.');
      return;
    }

    // Check if table is full
    const isFull = table.every((cell) => cell !== null);
    if (isFull) {
      setErrorMsg('Hash Table Overflow! Table is fully populated.');
      addLog(`Failed insertion of key ${key}: Table Full.`);
      return;
    }

    const initialHash = key % TABLE_SIZE;
    let idx = initialHash;
    const probed: number[] = [];

    // Linear Probing logic
    while (table[idx] !== null) {
      probed.push(idx);
      idx = (idx + 1) % TABLE_SIZE;
    }

    // Animate insertion
    let i = 0;
    addLog(`Calculating Hash: ${key} % ${TABLE_SIZE} = ${initialHash}`);

    const interval = setInterval(() => {
      if (i < probed.length) {
        setActiveCell(probed[i]);
        setProbedCells((prev) => [...prev, probed[i]]);
        addLog(`Collision at index ${probed[i]}. Probing next slot...`);
        i++;
      } else {
        clearInterval(interval);
        const updatedTable = [...table];
        updatedTable[idx] = key;
        setTable(updatedTable);
        setActiveCell(idx);
        addLog(`Inserted key ${key} successfully at index ${idx}.`);
        setKeyInput('');
      }
    }, 600);
  };

  const resetTable = () => {
    setTable(Array(TABLE_SIZE).fill(null));
    setActiveCell(null);
    setProbedCells([]);
    setErrorMsg(null);
    setLogs(['Table reset. All slots cleared.']);
  };

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl text-gray-900 dark:text-white dark:font-display dark:font-display font-mono">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
          <Hash size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display font-sans">
            Program 12: Hash Table collision resolution (Linear Probing)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">
            Trace key insertions and collision resolutions step-by-step.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 mb-6 font-sans">
        {/* Controls */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-cyan-500/20 rounded-xl space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Insert Key</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Key (e.g. 25)"
                className="flex-grow min-w-[120px] px-3 py-2 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-semibold"
              />
              <button
                onClick={insertKey}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-500 text-white rounded-lg font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow"
              >
                <Plus size={14} /> Insert
              </button>
            </div>
          </div>

          <button
            onClick={resetTable}
            className="w-full py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs hover:text-red-500 flex justify-center items-center gap-1"
          >
            <RotateCcw size={12} /> Clear Table
          </button>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-semibold text-red-600 dark:text-red-300 flex items-center gap-1.5">
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-200 dark:border-cyan-500/20 rounded-xl font-mono text-xs">
          <span className="font-extrabold uppercase text-cyan-500 dark:text-cyan-400 tracking-wider font-sans">
            Hash Trace Logger
          </span>
          <div className="h-28 overflow-y-auto font-mono text-[10px] space-y-1 bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-200 dark:border-gray-900 mt-2">
            {logs.map((log, i) => (
              <div key={i} className="text-gray-700 dark:text-gray-300">
                &gt; {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hash Table Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        {table.map((cellValue, idx) => {
          const isActive = activeCell === idx;
          const isProbed = probedCells.includes(idx);

          let border = 'border-gray-200 dark:border-cyan-500/20 bg-white dark:bg-gray-950/20';
          let textColor = 'text-gray-900 dark:text-white dark:font-display dark:font-display';

          if (isActive) {
            border = 'border-green-500 bg-green-500/10 scale-105';
            textColor = 'text-green-600 dark:text-green-400 font-extrabold';
          } else if (isProbed) {
            border = 'border-cyan-500 bg-cyan-500/10 scale-105 animate-pulse';
            textColor = 'text-cyan-600 dark:text-cyan-400 font-extrabold';
          }

          return (
            <div
              key={idx}
              className={`p-4 border-2 rounded-xl flex flex-col items-center justify-between min-h-[90px] text-center transition-all ${border}`}
            >
              <span className="text-[10px] text-gray-400 font-bold block mb-2 font-sans">
                Slot {idx}
              </span>
              <span className={`text-base font-extrabold ${textColor}`}>
                {cellValue !== null ? cellValue : <span className="text-gray-300 dark:text-gray-800 text-xs font-normal">empty</span>}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20">
        <Info className="text-cyan-500 dark:text-cyan-400 dark:text-cyan-400 shrink-0 mt-0.5 font-sans" size={18} />
        <p className="text-xs text-cyan-800 dark:text-cyan-300 dark:font-code leading-relaxed font-medium font-sans">
          <strong>Linear Probing:</strong> When collision occurs (two keys map to same index), the algorithm probes sequentially: `idx = (idx + 1) % TABLE_SIZE` until an empty slot is encountered.
        </p>
      </div>
    </div>
  );
}
