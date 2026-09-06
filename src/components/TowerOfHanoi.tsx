import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

interface Move {
  disk: number;
  from: string;
  to: string;
}

export default function TowerOfHanoi() {
  const [numDisks, setNumDisks] = useState(3);
  const [moves, setMoves] = useState<Move[]>([]);
  const [moveIdx, setMoveIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);

  // Representation of pegs: key = Peg name, value = array of disk sizes
  const [pegs, setPegs] = useState<Record<string, number[]>>({
    A: [],
    B: [],
    C: [],
  });

  // Calculate Hanoi moves recursively
  const getHanoiMoves = useCallback((n: number, from: string, temp: string, to: string, list: Move[]) => {
    if (n === 0) return;
    getHanoiMoves(n - 1, from, to, temp, list);
    list.push({ disk: n, from, to });
    getHanoiMoves(n - 1, temp, from, to, list);
  }, []);

  const initSolver = useCallback(() => {
    const list: Move[] = [];
    getHanoiMoves(numDisks, 'A', 'B', 'C', list);
    setMoves(list);
    setMoveIdx(-1);
    setIsPlaying(false);

    // Initial pegs state: Peg A has disks [numDisks, ..., 1] (largest first)
    const initialA = Array.from({ length: numDisks }, (_, i) => numDisks - i);
    setPegs({
      A: initialA,
      B: [],
      C: [],
    });
  }, [getHanoiMoves, numDisks]);

  useEffect(() => {
    initSolver();
  }, [initSolver]);

  // Perform a move forward or backward
  const applyMove = useCallback((step: number, direction: 'forward' | 'backward') => {
    if (direction === 'forward') {
      const move = moves[step];
      if (!move) return;

      setPegs((prev) => {
        const fromPeg = prev[move.from].filter((d) => d !== move.disk);
        const toPeg = [...prev[move.to], move.disk];
        return {
          ...prev,
          [move.from]: fromPeg,
          [move.to]: toPeg,
        };
      });
      setMoveIdx(step);
    } else {
      const move = moves[step + 1]; // Move to reverse
      if (!move) return;

      setPegs((prev) => {
        const toPeg = prev[move.to].filter((d) => d !== move.disk);
        const fromPeg = [...prev[move.from], move.disk];
        return {
          ...prev,
          [move.from]: fromPeg,
          [move.to]: toPeg,
        };
      });
      setMoveIdx(step);
    }
  }, [moves]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      timer = setInterval(() => {
        if (moveIdx >= moves.length - 1) {
          setIsPlaying(false);
        } else {
          applyMove(moveIdx + 1, 'forward');
        }
      }, speed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [applyMove, isPlaying, moveIdx, moves.length, speed]);

  const handleStepForward = () => {
    setIsPlaying(false);
    if (moveIdx < moves.length - 1) {
      applyMove(moveIdx + 1, 'forward');
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (moveIdx >= 0) {
      applyMove(moveIdx - 1, 'backward');
    }
  };

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl text-gray-900 dark:text-white dark:font-display dark:font-display">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
          <HelpCircle size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display">
            Program 5B: Tower of Hanoi Animation
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Interactive, physics-based recursion visualizer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Disks</label>
          <select
            value={numDisks}
            onChange={(e) => setNumDisks(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-sm font-semibold"
          >
            {[3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} Disks
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Interval (ms)</label>
          <input
            type="range"
            min={400}
            max={2000}
            step={200}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-cyan-500 mt-2"
          />
          <div className="text-[10px] text-gray-400 text-right mt-1 font-mono">{speed}ms</div>
        </div>

        <div className="md:col-span-2 flex items-end gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md flex justify-center items-center gap-1.5"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Play Auto'}
          </button>
          <button
            onClick={handleStepBackward}
            disabled={moveIdx < 0}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleStepForward}
            disabled={moveIdx >= moves.length - 1}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={initSolver}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 hover:text-cyan-500 dark:text-cyan-400"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Renders Peg layout */}
      <div className="p-8 bg-gray-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200 dark:border-cyan-500/20 mb-6 flex items-end justify-around h-64 relative">
        {['A', 'B', 'C'].map((pegKey) => {
          const diskList = pegs[pegKey] || [];
          return (
            <div key={pegKey} className="relative flex flex-col items-center w-1/3 h-full justify-end">
              {/* Vertical Peg Shaft */}
              <div className="absolute bottom-0 w-2.5 h-[80%] bg-gray-300 dark:bg-gray-700 rounded-t-lg -z-10" />

              {/* Disk pile */}
              <div className="flex flex-col-reverse items-center gap-0.5 w-full">
                {diskList.map((diskSize) => {
                  // Proportional widths
                  const widthPercent = 25 + (diskSize / numDisks) * 60;
                  const colors = [
                    'bg-red-500 dark:bg-red-600',
                    'bg-cyan-500 dark:bg-cyan-600',
                    'bg-yellow-500 dark:bg-yellow-600',
                    'bg-green-500 dark:bg-green-600',
                    'bg-blue-500 dark:bg-blue-600',
                    'bg-purple-500 dark:bg-purple-600',
                  ];
                  const diskColor = colors[(diskSize - 1) % colors.length];

                  return (
                    <div
                      key={diskSize}
                      style={{ width: `${widthPercent}%` }}
                      className={`h-6 flex items-center justify-center text-[10px] font-bold text-white rounded-md shadow-sm transition-all duration-300 border border-black/10 ${diskColor}`}
                    >
                      {diskSize}
                    </div>
                  );
                })}
              </div>

              {/* Peg Base Label */}
              <div className="w-24 h-2 bg-gray-400 dark:bg-gray-600 rounded-full mt-1 flex items-center justify-center">
                <span className="text-[10px] font-extrabold text-white absolute mt-6">Peg {pegKey}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs info */}
      <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/10 rounded-xl border border-cyan-200/50 dark:border-cyan-900/30 text-xs font-mono flex justify-between">
        <div>
          <span className="font-bold text-cyan-500 dark:text-cyan-400 mr-2 uppercase tracking-wide">Logs:</span>
          {moveIdx >= 0 ? (
            `Move Disk ${moves[moveIdx].disk} from Peg ${moves[moveIdx].from} to Peg ${moves[moveIdx].to}`
          ) : (
            'Ready to solve. Press Play or Step Forward.'
          )}
        </div>
        <div className="text-gray-400">
          Move {moveIdx + 1} of {moves.length}
        </div>
      </div>
    </div>
  );
}
