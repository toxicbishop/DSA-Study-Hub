import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ArrowRight } from 'lucide-react';

interface StringMatchStep {
  c: number;
  m: number;
  i: number;
  res: string[];
  currentMatch: number[];
  status: string;
  type: 'init' | 'match' | 'replace' | 'mismatch' | 'completed';
  final?: string;
  found?: boolean;
}

export default function StringMatchVisualizer() {
  const [str, setStr] = useState('AABCCAADDEE');
  const [pat, setPat] = useState('AAD');
  const [rep, setRep] = useState('XYZ');

  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<StringMatchStep[]>([]);
  const [step, setStep] = useState(0);

  // Generate pattern matching steps
  const generateSteps = useCallback(() => {
    const steps: StringMatchStep[] = [];
    const sArr = str.split('');
    const pArr = pat.split('');
    const rArr = rep.split('');

    const textLen = sArr.length;
    const patLen = pArr.length;

    let res: string[] = [];
    let c = 0;
    let m = 0;
    let i = 0;
    let found = false;

    // Initial state
    steps.push({
      c, m, i, res: [], currentMatch: [], status: 'Starting search...', type: 'init'
    });

    while (c < textLen) {
      m = c;
      i = 0;
      const matchedIndices: number[] = [];

      while (m < textLen && i < patLen && sArr[m] === pArr[i]) {
        matchedIndices.push(m);
        steps.push({
          c, m, i,
          res: [...res],
          currentMatch: [...matchedIndices],
          status: `Character '${sArr[m]}' matches '${pArr[i]}'. Moving patterns.`,
          type: 'match'
        });
        i++;
        m++;
      }

      if (i === patLen) {
        // Full match found
        found = true;
        res = res.concat(rArr);
        steps.push({
          c, m: m - 1, i: i - 1,
          res: [...res],
          currentMatch: [...matchedIndices],
          status: `Full pattern match at text index ${c}! Replacing with '${rep}'.`,
          type: 'replace'
        });
        c = m; // Jump to end of match
      } else {
        // Mismatch or end of string
        steps.push({
          c, m, i,
          res: [...res, sArr[c]],
          currentMatch: [...matchedIndices],
          status: `Mismatch at text index ${m} ('${sArr[m] ?? 'end'}' != '${pArr[i] ?? 'end'}'). Backtracking and adding '${sArr[c]}'.`,
          type: 'mismatch'
        });
        res.push(sArr[c]);
        c++;
      }
    }

    steps.push({
      c, m, i,
      res: [...res],
      currentMatch: [],
      status: found ? `Process completed. Pattern matched & replaced successfully!` : `Process completed. Pattern not found!`,
      type: 'completed',
      final: res.join(''),
      found
    });

    setHistory(steps);
    setStep(0);
  }, [pat, rep, str]);

  useEffect(() => {
    generateSteps();
    setIsPlaying(false);
  }, [generateSteps]);

  // Handle auto playback
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setStep((prev) => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, history]);

  const currentInfo = history[step] ?? {
    c: 0,
    m: 0,
    i: 0,
    res: [],
    currentMatch: [],
    status: '',
    type: 'init' as const,
  };

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
          <ArrowRight size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display">
            Program 2: Pattern Matching & Replacement
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Step-by-step visual tracker of string alignment, matching, and replacements.
          </p>
        </div>
      </div>

      {/* Input Variables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Main String</label>
          <input
            type="text"
            value={str}
            onChange={(e) => setStr(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Pattern String</label>
          <input
            type="text"
            value={pat}
            onChange={(e) => setPat(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Replacement</label>
          <input
            type="text"
            value={rep}
            onChange={(e) => setRep(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1 px-4 py-2 bg-cyan-500 text-white rounded-lg font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-md"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setStep((prev) => Math.max(0, prev - 1));
          }}
          disabled={step === 0}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Prev
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setStep((prev) => Math.min(history.length - 1, prev + 1));
          }}
          disabled={step === history.length - 1}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Next
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setStep(0);
          }}
          className="p-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:text-cyan-500 dark:text-cyan-400"
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Visual Alignment Area */}
      <div className="p-6 bg-gray-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200 dark:border-cyan-500/20 mb-6 font-mono overflow-x-auto">
        {/* Main String */}
        <div className="flex items-center gap-1 mb-6">
          <span className="w-24 text-xs font-bold text-gray-400 shrink-0">MAIN TEXT:</span>
          <div className="flex gap-1">
            {str.split('').map((char, index) => {
              const isChecking = index === currentInfo.m;
              const isMatched = currentInfo.currentMatch?.includes(index);
              const isPassed = index < currentInfo.c;

              let bg = 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700';
              if (isMatched) bg = 'bg-green-500 text-white border-green-600';
              else if (isChecking) bg = currentInfo.type === 'mismatch' ? 'bg-red-500 text-white border-red-600' : 'bg-cyan-500 text-white border-cyan-600';
              else if (isPassed) bg = 'bg-gray-200/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 opacity-60';

              return (
                <div
                  key={index}
                  className={`w-10 h-10 flex items-center justify-center border-2 rounded-lg font-bold text-lg transition-all ${bg}`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern Alignment */}
        <div className="flex items-center gap-1 mb-6">
          <span className="w-24 text-xs font-bold text-gray-400 shrink-0">PATTERN:</span>
          <div className="flex gap-1" style={{ marginLeft: `${currentInfo.c * 44}px` }}>
            {pat.split('').map((char, index) => {
              const isActive = index === currentInfo.i;
              let bg = 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700';
              if (isActive) {
                bg = currentInfo.type === 'match' ? 'bg-green-500 text-white border-green-600' :
                  currentInfo.type === 'mismatch' ? 'bg-red-500 text-white border-red-600' : 'bg-cyan-500 text-white border-cyan-600';
              }
              return (
                <div
                  key={index}
                  className={`w-10 h-10 flex items-center justify-center border-2 rounded-lg font-bold text-lg transition-all ${bg}`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        </div>

        {/* Output Buffer */}
        <div className="flex items-center gap-1 border-t border-gray-200 dark:border-cyan-500/20 pt-4">
          <span className="w-24 text-xs font-bold text-gray-400 shrink-0">OUTPUT:</span>
          <div className="flex gap-1">
            {currentInfo.res?.map((char: string, index: number) => (
              <div
                key={index}
                className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg font-bold text-lg text-gray-700 dark:text-gray-300 animate-pop"
              >
                {char}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Status */}
      <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/10 rounded-xl border border-cyan-200/50 dark:border-cyan-900/30 text-sm font-medium text-gray-700 dark:text-gray-300">
        <span className="font-bold text-cyan-500 dark:text-cyan-400 mr-2 uppercase tracking-wide">STATUS:</span>
        {currentInfo.status}
      </div>
    </div>
  );
}
