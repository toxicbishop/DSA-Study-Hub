import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Play, Pause, FastForward } from 'lucide-react';

interface ConversionStep {
  token: string;
  stack: string[];
  postfix: string;
  action: string;
  charIdx: number;
  isFinal?: boolean;
}

export default function InfixPostfixVisualizer() {
  const [expression, setExpression] = useState('(A+B)*C-D%E');
  const [steps, setSteps] = useState<ConversionStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const getPriority = (char: string) => {
    if (char === '(') return 0;
    if (char === '+' || char === '-') return 1;
    if (char === '*' || char === '/' || char === '%') return 2;
    if (char === '^') return 3;
    return 0;
  };

  const isAlphaNum = (char: string) => {
    return /[a-zA-Z0-9]/.test(char);
  };

  const generateSteps = useCallback(() => {
    const chars = expression.replace(/\s+/g, '').split('');
    const newSteps: ConversionStep[] = [];
    const stack: string[] = [];
    let postfix = '';

    // Initial state
    newSteps.push({
      token: '',
      stack: [],
      postfix: '',
      action: 'Initialize operator stack and output buffer.',
      charIdx: -1,
    });

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      let actionMsg = '';

      if (isAlphaNum(char)) {
        postfix += char;
        actionMsg = `Operand '${char}' detected. Add directly to postfix output.`;
        newSteps.push({
          token: char,
          stack: [...stack],
          postfix,
          action: actionMsg,
          charIdx: i,
        });
      } else if (char === '(') {
        stack.push(char);
        actionMsg = `Opening parenthesis '(' detected. Push to stack.`;
        newSteps.push({
          token: char,
          stack: [...stack],
          postfix,
          action: actionMsg,
          charIdx: i,
        });
      } else if (char === ')') {
        actionMsg = `Closing parenthesis ')' detected. Pop operators and append to output until '(' is met.`;
        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          const op = stack.pop();
          if (op === undefined) continue;
          postfix += op;
          newSteps.push({
            token: char,
            stack: [...stack],
            postfix,
            action: `Popped operator '${op}' from stack and appended to output.`,
            charIdx: i,
          });
        }
        stack.pop(); // Pop '('
        newSteps.push({
          token: char,
          stack: [...stack],
          postfix,
          action: `Popped and discarded '(' matching parenthesis.`,
          charIdx: i,
        });
      } else {
        // Operator
        actionMsg = `Operator '${char}' detected. Compares priority with top of stack.`;
        while (
          stack.length > 0 &&
          getPriority(stack[stack.length - 1]) >= getPriority(char)
        ) {
          const op = stack.pop();
          if (op === undefined) continue;
          postfix += op;
          newSteps.push({
            token: char,
            stack: [...stack],
            postfix,
            action: `Pop '${op}' (priority ${getPriority(op)} >= ${getPriority(char)}) from stack and append to output.`,
            charIdx: i,
          });
        }
        stack.push(char);
        newSteps.push({
          token: char,
          stack: [...stack],
          postfix,
          action: `Push operator '${char}' onto stack.`,
          charIdx: i,
        });
      }
    }

    // Pop remaining stack elements
    while (stack.length > 0) {
      const op = stack.pop();
      if (op === undefined) continue;
      postfix += op;
      newSteps.push({
        token: '',
        stack: [...stack],
        postfix,
        action: `Input empty. Pop remaining operator '${op}' and append to output.`,
        charIdx: chars.length,
      });
    }

    newSteps.push({
      token: '',
      stack: [],
      postfix,
      action: 'Conversion completed successfully!',
      charIdx: chars.length,
      isFinal: true,
    });

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
    postfix: '',
    action: '',
    charIdx: -1,
  };

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
          <RefreshCw size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display">
            Program 4: Infix to Postfix Conversion
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Traces expression conversion step-by-step using operator stacks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Infix Expression</label>
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value.toUpperCase())}
            placeholder="Enter infix (e.g. A+B*C)"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-black dark:border-white rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 font-mono font-bold text-sm"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md flex justify-center items-center gap-1.5"
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
            <FastForward size={14} />
          </button>
        </div>
      </div>

      {/* Scanned Input Visual String */}
      <div className="mb-6">
        <span className="block text-xs font-bold uppercase text-gray-400 mb-2 font-mono">Scanned Expression:</span>
        <div className="flex gap-1 overflow-x-auto pb-2 font-mono">
          {expression.replace(/\s+/g, '').split('').map((char, index) => {
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

      {/* Grid Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* Operator Stack Pile */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 rounded-xl border border-gray-200 dark:border-cyan-500/20 flex flex-col items-center min-h-[200px] justify-between">
          <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
            Operator Stack
          </span>
          <div className="flex flex-col-reverse gap-1.5 w-24 p-2 border-b-4 border-x-4 border-black dark:border-white rounded-b-lg min-h-[120px] bg-white/40 dark:bg-slate-900/40 mt-4">
            {currentInfo.stack?.map((char: string, index: number) => (
              <div
                key={index}
                className="w-full h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-md font-bold text-sm animate-pop"
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        {/* Postfix Output */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 rounded-xl border border-gray-200 dark:border-cyan-500/20 flex flex-col items-center min-h-[200px] justify-between">
          <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
            Postfix Output
          </span>
          <div className="w-full text-center py-6 px-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-cyan-500/20 font-extrabold text-xl text-cyan-500 dark:text-cyan-400 break-words min-h-[90px] mt-4 flex items-center justify-center">
            {currentInfo.postfix || <span className="text-sm font-medium text-gray-400">Empty</span>}
          </div>
        </div>

        {/* Current Step Action Description */}
        <div className="p-4 bg-cyan-50/20 dark:bg-cyan-950/10 rounded-xl border border-cyan-200/40 dark:border-cyan-900/20 flex flex-col justify-between min-h-[200px]">
          <div>
            <span className="text-xs font-extrabold uppercase text-cyan-500 dark:text-cyan-400 tracking-wider">
              Step Logs
            </span>
            <p className="mt-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
              {currentInfo.action}
            </p>
          </div>
          <div className="text-[10px] text-gray-400 border-t border-gray-200/40 dark:border-cyan-500/20/40 pt-2 flex justify-between">
            <span>Index: {stepIdx}</span>
            <span>Stack size: {currentInfo.stack?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
