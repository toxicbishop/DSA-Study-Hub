import React, { useState } from 'react';
import { RefreshCw, RotateCcw, AlertTriangle, Info } from 'lucide-react';

const QUEUE_SIZE = 5;

export default function CircularQueue() {
  const [queue, setQueue] = useState<(string | null)[]>(Array(QUEUE_SIZE).fill(null));
  const [front, setFront] = useState(-1);
  const [rear, setRear] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState<string[]>(['Circular Queue initialized with size 5.']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [msg, ...prev]);
  };

  const isFull = () => {
    return (rear + 1) % QUEUE_SIZE === front;
  };

  const isEmpty = () => {
    return front === -1;
  };

  const enqueue = (val: string) => {
    setErrorMsg(null);
    if (!val.trim()) {
      setErrorMsg('Please enter a valid character.');
      return;
    }
    const cleanVal = val.toUpperCase().charAt(0);

    if (isFull()) {
      setErrorMsg('Queue Overflow! Cannot enqueue element.');
      addLog('Failed Enqueue: Queue is Full.');
      return;
    }

    let newFront = front;
    let newRear = rear;
    const newQueue = [...queue];

    if (isEmpty()) {
      newFront = 0;
      newRear = 0;
    } else {
      newRear = (rear + 1) % QUEUE_SIZE;
    }

    newQueue[newRear] = cleanVal;
    setQueue(newQueue);
    setFront(newFront);
    setRear(newRear);
    addLog(`Enqueued element '${cleanVal}' at index ${newRear}.`);
    setInputValue('');
  };

  const dequeue = () => {
    setErrorMsg(null);
    if (isEmpty()) {
      setErrorMsg('Queue Underflow! Cannot dequeue from empty queue.');
      addLog('Failed Dequeue: Queue is Empty.');
      return;
    }

    const removed = queue[front];
    const newQueue = [...queue];
    newQueue[front] = null;

    let newFront = front;
    let newRear = rear;

    if (front === rear) {
      // Last element is removed
      newFront = -1;
      newRear = -1;
    } else {
      newFront = (front + 1) % QUEUE_SIZE;
    }

    setQueue(newQueue);
    setFront(newFront);
    setRear(newRear);
    addLog(`Dequeued element '${removed}' from index ${front}.`);
  };

  const clearQueue = () => {
    setQueue(Array(QUEUE_SIZE).fill(null));
    setFront(-1);
    setRear(-1);
    setErrorMsg(null);
    setLogs(['Circular Queue cleared.']);
  };

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl text-gray-900 dark:text-white dark:font-display dark:font-display">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
          <RefreshCw size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display">
            Program 6: Circular Queue
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualizes circular buffers and front/rear pointer calculations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20">
            <h4 className="font-extrabold text-sm uppercase tracking-wide mb-3 text-cyan-500 dark:text-cyan-400">
              Operations
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Char (A-Z)"
                maxLength={1}
                className="flex-grow min-w-[80px] px-3 py-2 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
              />
              <button
                onClick={() => enqueue(inputValue)}
                className="flex-grow sm:flex-grow-0 px-4 py-2 bg-cyan-500 text-white rounded-lg font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                Enqueue
              </button>
              <button
                onClick={dequeue}
                className="flex-grow sm:flex-grow-0 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-bold text-xs hover:bg-gray-300 dark:hover:bg-gray-700 active:scale-95 transition-all"
              >
                Dequeue
              </button>
              <button
                onClick={clearQueue}
                className="p-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:text-red-500"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertTriangle size={14} /> {errorMsg}
              </div>
            )}
          </div>

          {/* Pointer values */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20 text-center">
              <span className="text-xs text-gray-400 font-bold block">FRONT</span>
              <span className="text-lg font-mono font-extrabold text-cyan-500 dark:text-cyan-400">{front}</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20 text-center">
              <span className="text-xs text-gray-400 font-bold block">REAR</span>
              <span className="text-lg font-mono font-extrabold text-pink-500">{rear}</span>
            </div>
          </div>

          {/* Logs */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20">
            <h4 className="font-extrabold text-sm uppercase tracking-wide mb-2 text-gray-500">
              Transaction History
            </h4>
            <div className="h-28 overflow-y-auto font-mono text-[11px] space-y-1 bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-200 dark:border-gray-900">
              {logs.map((log, i) => (
                <div key={i} className="text-gray-700 dark:text-gray-300">
                  &gt; {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Circular Representation */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50/50 dark:bg-gray-950/20 rounded-2xl border border-gray-200 dark:border-cyan-500/20 min-h-[300px]">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Round boundary */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-300 dark:border-cyan-500/20" />

            {/* Circular Ring slots */}
            {queue.map((val, index) => {
              const angle = (index * 360) / QUEUE_SIZE;
              // Compute coordinates on radius = 80px
              const rad = (angle - 90) * (Math.PI / 180);
              const x = 80 * Math.cos(rad);
              const y = 80 * Math.sin(rad);

              const isFront = index === front;
              const isRear = index === rear;

              let border = 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900';
              if (isFront && isRear) {
                border = 'border-purple-500 bg-purple-500/10 scale-105';
              } else if (isFront) {
                border = 'border-cyan-500 bg-cyan-500/10 scale-105';
              } else if (isRear) {
                border = 'border-pink-500 bg-pink-500/10 scale-105';
              }

              return (
                <div
                  key={index}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute w-12 h-12 flex flex-col items-center justify-center rounded-full border-2 font-mono transition-all font-bold ${border}`}
                >
                  <span className="text-sm">{val || '-'}</span>
                  <span className="text-[8px] text-gray-400 absolute mt-8">i={index}</span>
                  {/* Indicators */}
                  {isFront && (
                    <span className="absolute -top-5 text-[8px] px-1 bg-cyan-500 text-white rounded font-sans uppercase">
                      F
                    </span>
                  )}
                  {isRear && (
                    <span className="absolute -bottom-5 text-[8px] px-1 bg-pink-500 text-white rounded font-sans uppercase">
                      R
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20">
        <Info className="text-cyan-500 dark:text-cyan-400 dark:text-cyan-400 shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-cyan-800 dark:text-cyan-300 dark:font-code leading-relaxed font-medium">
          <strong>Circular Logic:</strong> When enqueueing or dequeueing, the pointer index moves circularly: `idx = (idx + 1) % MAX`. This prevents memory fragmentation by reusing released slots at the beginning of the array once the pointers wrap around.
        </p>
      </div>
    </div>
  );
}
