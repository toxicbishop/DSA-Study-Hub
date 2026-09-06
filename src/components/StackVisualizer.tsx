import React, { useState, useEffect } from 'react';
import { Layers, ArrowUp, ArrowDown, CheckCircle, AlertCircle, Info } from 'lucide-react';

const MAX_SIZE = 5;

interface PalindromeStep {
  stackState: string[];
  scannedChar: string;
  poppedChar: string;
  compareMsg: string;
  leftIdx: number;
  rightIdx: number;
  matched: boolean | null;
  completed?: boolean;
}

export default function StackVisualizer() {
  const [stack, setStack] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [statusMessage, setStatusMessage] = useState('Stack initialized. Maximum capacity is 5 items.');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');

  // Palindrome state
  const [palindromeInput, setPalindromeInput] = useState('MADAM');
  const [isAnimatingPalindrome, setIsAnimatingPalindrome] = useState(false);
  const [palindromeSteps, setPalindromeSteps] = useState<PalindromeStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const push = (item: string) => {
    if (!item.trim()) {
      setStatusMessage('Please enter a valid character or number.');
      setStatusType('error');
      return;
    }
    if (stack.length >= MAX_SIZE) {
      setStatusMessage('Stack Overflow! Stack is full.');
      setStatusType('error');
      return;
    }
    setStack((prev) => [...prev, item]);
    setStatusMessage(`Successfully pushed '${item}' onto the stack.`);
    setStatusType('success');
    setInputValue('');
  };

  const pop = () => {
    if (stack.length === 0) {
      setStatusMessage('Stack Underflow! Stack is empty.');
      setStatusType('error');
      return;
    }
    const popped = stack[stack.length - 1];
    setStack((prev) => prev.slice(0, -1));
    setStatusMessage(`Successfully popped '${popped}' from the stack.`);
    setStatusType('success');
  };

  const startPalindromeCheck = () => {
    if (!palindromeInput.trim()) return;

    setIsAnimatingPalindrome(true);
    setCurrentStep(0);

    const chars = palindromeInput.toUpperCase().split('');
    const steps: PalindromeStep[] = [];

    // Step 0: Starting
    steps.push({
      stackState: [],
      scannedChar: '',
      poppedChar: '',
      compareMsg: `Checking: "${palindromeInput.toUpperCase()}". First, we push all characters onto the stack.`,
      leftIdx: -1,
      rightIdx: -1,
      matched: null,
    });

    // Push steps
    let currentStack: string[] = [];
    chars.forEach((char, i) => {
      currentStack = [...currentStack, char];
      steps.push({
        stackState: [...currentStack],
        scannedChar: char,
        poppedChar: '',
        compareMsg: `Pushing '${char}' at index ${i} to stack.`,
        leftIdx: i,
        rightIdx: -1,
        matched: null,
      });
    });

    // Compare steps
    const tempStack = [...currentStack];
    let isPal = true;

    for (let i = 0; i < chars.length; i++) {
      const popped = tempStack.pop() || '';
      const original = chars[i];
      const match = original === popped;
      if (!match) isPal = false;

      steps.push({
        stackState: [...tempStack],
        scannedChar: original,
        poppedChar: popped,
        compareMsg: `Comparing scanned character '${original}' (index ${i}) with popped character '${popped}'. ${
          match ? 'Match!' : 'Mismatch!'
        }`,
        leftIdx: i,
        rightIdx: chars.length - 1 - i,
        matched: match,
      });
    }

    steps.push({
      stackState: [],
      scannedChar: '',
      poppedChar: '',
      compareMsg: isPal
        ? `Result: "${palindromeInput.toUpperCase()}" is a PALINDROME! All characters matched correctly.`
        : `Result: "${palindromeInput.toUpperCase()}" is NOT a palindrome. Mismatch detected.`,
      leftIdx: -1,
      rightIdx: -1,
      matched: isPal,
      completed: true,
    });

    setPalindromeSteps(steps);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isAnimatingPalindrome) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= palindromeSteps.length - 1) {
            setIsAnimatingPalindrome(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAnimatingPalindrome, palindromeSteps]);

  const activeStepInfo = palindromeSteps[currentStep] ?? {
    stackState: [],
    scannedChar: '',
    poppedChar: '',
    compareMsg: '',
    leftIdx: -1,
    rightIdx: -1,
    matched: null,
  };

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
          <Layers size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display">
            Program 3: Stack Operations & Palindrome Checker
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Interactive visualization of LIFO (Last-In-First-Out) stack operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Operations & Control */}
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20">
            <h4 className="font-extrabold text-sm uppercase tracking-wide mb-3 text-cyan-500 dark:text-cyan-400">
              Stack Push & Pop
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value (e.g. A, 1)"
                maxLength={4}
                className="flex-grow min-w-[120px] px-3 py-2 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
              />
              <button
                onClick={() => push(inputValue)}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-1 px-4 py-2 bg-cyan-500 text-white rounded-lg font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <ArrowUp size={14} /> Push
              </button>
              <button
                onClick={pop}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-bold text-xs hover:bg-gray-300 dark:hover:bg-gray-700 active:scale-95 transition-all"
              >
                <ArrowDown size={14} /> Pop
              </button>
            </div>
            {/* Status alerts */}
            <div className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
              statusType === 'success'
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-300'
                : statusType === 'error'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300'
                  : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-cyan-500/20 text-gray-600 dark:text-gray-400'
            }`}>
              {statusType === 'success' ? <CheckCircle size={14} /> : statusType === 'error' ? <AlertCircle size={14} /> : <Info size={14} />}
              {statusMessage}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20">
            <h4 className="font-extrabold text-sm uppercase tracking-wide mb-3 text-cyan-500 dark:text-cyan-400">
              Check for Palindrome
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              <input
                type="text"
                value={palindromeInput}
                onChange={(e) => setPalindromeInput(e.target.value.toUpperCase())}
                placeholder="Enter string"
                className="flex-grow min-w-[120px] px-3 py-2 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
              />
              <button
                onClick={startPalindromeCheck}
                disabled={isAnimatingPalindrome}
                className="flex-grow sm:flex-grow-0 px-4 py-2 bg-cyan-500 text-white rounded-lg font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
              >
                Validate
              </button>
            </div>

            {/* Palindrome logs */}
            {palindromeSteps.length > 0 && (
              <div className="mt-3 p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-cyan-500/20 rounded-lg text-xs leading-relaxed">
                <div className="font-bold text-cyan-500 dark:text-cyan-400 mb-1 uppercase tracking-wide">
                  Step {currentStep} of {palindromeSteps.length - 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {activeStepInfo.compareMsg}
                </p>
                {activeStepInfo.scannedChar && (
                  <div className="flex gap-4 mt-2 border-t border-gray-100 dark:border-gray-900 pt-2 font-mono">
                    <div>Scanned: <span className="font-bold text-cyan-500 dark:text-cyan-400">{activeStepInfo.scannedChar}</span></div>
                    {activeStepInfo.poppedChar && (
                      <div>Popped: <span className="font-bold text-pink-500">{activeStepInfo.poppedChar}</span></div>
                    )}
                    {activeStepInfo.matched !== null && (
                      <div className={activeStepInfo.matched ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                        {activeStepInfo.matched ? 'MATCH' : 'MISMATCH'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stack Cylinder / Visual Display */}
        <div className="flex flex-col items-center justify-end min-h-[350px] bg-gray-50/50 dark:bg-gray-950/20 rounded-2xl border border-gray-200 dark:border-cyan-500/20 p-6">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              Stack Container
            </span>
            <span className="text-xs font-mono text-gray-500">
              TOP Index: {isAnimatingPalindrome ? (activeStepInfo.stackState?.length || 0) - 1 : stack.length - 1}
            </span>
          </div>

          {/* Cylinder shape */}
          <div className="relative w-32 border-x-4 border-b-4 border-black dark:border-white rounded-b-xl flex flex-col justify-end gap-1.5 p-2 h-64 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
            {/* Display list based on mode */}
            {(() => {
              const items = isAnimatingPalindrome ? activeStepInfo.stackState || [] : stack;
              const emptySlots = MAX_SIZE - items.length;

              return (
                <>
                  {/* Empty placeholders */}
                  {Array.from({ length: emptySlots }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="w-full h-10 border border-dashed border-gray-300 dark:border-cyan-500/20 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-mono"
                    >
                      Empty
                    </div>
                  ))}
                  {/* Actual elements in reverse order so top is on top */}
                  {[...items].reverse().map((item, index) => {
                    const originalIdx = items.length - 1 - index;
                    const isTop = originalIdx === items.length - 1;
                    return (
                      <div
                        key={`${item}-${originalIdx}`}
                        className={`w-full h-10 flex items-center justify-center border-2 border-black dark:border-white rounded-lg font-bold text-sm text-gray-900 dark:text-white dark:font-display dark:font-display shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] animate-pop ${
                          isTop ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        {item}
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
