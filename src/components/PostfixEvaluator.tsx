import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Play, Pause, ChevronRight } from 'lucide-react';

interface EvaluationStep {
  token: string;
  stack: number[];
  action: string;
  charIdx: number;
  isError?: boolean;
  isCompleted?: boolean;
}

export default function PostfixEvaluator() {
  const [expression, setExpression] = useState('6532^*+5-');
  const [steps, setSteps] = useState<EvaluationStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateSteps = useCallback(() => {
    const chars = expression.replace(/\s+/g, '').split('');
    const newSteps: EvaluationStep[] = [];
    const stack: number[] = [];

    // Initial state
    newSteps.push({
      token: '',
      stack: [],
      action: 'Initialize operand stack. Read postfix expression.',
      charIdx: -1,
    });

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (/\d/.test(char)) {
        const val = parseInt(char, 10);
        stack.push(val);
        newSteps.push({
          token: char,
          stack: [...stack],
          action: `Digit '${char}' detected. Push numeric value ${val} to stack.`,
          charIdx: i,
        });
      } else {
        // Operator
        if (stack.length < 2) {
          newSteps.push({
            token: char,
            stack: [...stack],
            action: `Error: Invalid Postfix expression. Operator '${char}' requires 2 operands, but stack only has ${stack.length}.`,
            charIdx: i,
            isError: true,
          });
          break;
        }

        const op2 = stack.pop()!;
        const op1 = stack.pop()!;
        let result = 0;

        switch (char) {
          case '+':
            result = op1 + op2;
            break;
          case '-':
            result = op1 - op2;
            break;
          case '*':
            result = op1 * op2;
            break;
          case '/':
            result = Math.floor(op1 / op2);
            break;
          case '%':
            result = op1 % op2;
            break;
          case '^':
            result = Math.pow(op1, op2);
            break;
          default:
            result = 0;
        }

        stack.push(result);
        newSteps.push({
          token: char,
          stack: [...stack],
          action: `Operator '${char}' detected. Pop op2=${op2}, op1=${op1}. Compute ${op1} ${char} ${op2} = ${result}. Push ${result} to stack.`,
          charIdx: i,
        });
      }
    }

    if (stack.length === 1) {
      newSteps.push({
        token: '',
        stack: [...stack],
        action: `Evaluation complete! Final answer is ${stack[0]}.`,
        charIdx: chars.length,
        isCompleted: true,
      });
    } else if (stack.length > 1) {
      newSteps.push({
        token: '',
        stack: [...stack],
        action: `Evaluation ended, but stack still contains multiple items: ${stack.join(', ')}. Input might be invalid.`,
        charIdx: chars.length,
      });
    }

    setSteps(newSteps);
    setStepIdx(0);
  }, [expression]);

  useEffect(() => {
    generateSteps();
    setIsPlaying(false);
  }, [generateSteps]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, steps]);

  const currentInfo = steps[stepIdx] ?? {
    token: '',
    stack: [],
    action: '',
    charIdx: -1,
  };

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl font-mono text-gray-900 dark:text-white dark:font-display dark:font-display">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
          <Settings size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display font-sans">
            Program 5A: Postfix Evaluation Visualizer
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">
            Step through postfix computation logs and operand stack configurations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1 font-sans">Postfix Expression</label>
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="Enter postfix (e.g. 456*+)"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-black dark:border-white rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 font-mono font-bold text-sm"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md flex justify-center items-center gap-1.5 font-sans"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Auto Play'}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
            }}
            disabled={stepIdx === steps.length - 1}
            className="p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Scanned Timeline */}
      <div className="mb-6">
        <span className="block text-xs font-bold uppercase text-gray-400 mb-2 font-sans">Token Stream:</span>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {expression.split('').map((char, index) => {
            const isScanned = index < currentInfo.charIdx;
            const isScanning = index === currentInfo.charIdx;
            return (
              <div
                key={index}
                className={`w-9 h-9 shrink-0 flex items-center justify-center border-2 rounded-lg font-bold text-sm transition-all ${
                  isScanning
                    ? 'bg-cyan-500 text-white border-cyan-600 scale-110 shadow-lg'
                    : isScanned
                      ? 'bg-gray-200/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600'
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {char}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stack pile */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950/20 rounded-2xl border border-gray-200 dark:border-cyan-500/20 flex flex-col items-center justify-end min-h-[220px]">
          <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-4 font-sans">
            Operand Evaluation Stack
          </span>
          <div className="flex flex-col-reverse gap-1.5 w-24 p-2 border-b-4 border-x-4 border-black dark:border-white rounded-b-lg min-h-[100px] bg-white/40 dark:bg-slate-900/40">
            {currentInfo.stack?.map((val: number, index: number) => (
              <div
                key={index}
                className="w-full h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-md font-bold text-sm animate-pop"
              >
                {val}
              </div>
            ))}
          </div>
        </div>

        {/* Logs */}
        <div className="p-4 bg-cyan-50/20 dark:bg-cyan-950/10 rounded-xl border border-cyan-200/40 dark:border-cyan-900/20 flex flex-col justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase text-cyan-500 dark:text-cyan-400 tracking-wider font-sans">
              Step Logs
            </span>
            <p className="mt-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
              {currentInfo.action}
            </p>
          </div>
          <div className="text-[10px] text-gray-400 border-t border-gray-200/40 dark:border-cyan-500/20/40 pt-2 flex justify-between font-sans">
            <span>Step: {stepIdx}</span>
            <span>Items on Stack: {currentInfo.stack?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
