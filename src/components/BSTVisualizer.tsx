import React, { useState, useEffect } from 'react';
import { GitCommit, Plus, Search, RotateCcw, Info } from 'lucide-react';

interface BSTNode {
  val: number;
  left?: BSTNode;
  right?: BSTNode;
  x: number;
  y: number;
  level: number;
}

export default function BSTVisualizer() {
  const [treeVals, setTreeVals] = useState<number[]>([50, 30, 70, 20, 40, 60, 80]);
  const [insertInput, setInsertInput] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Animation states
  const [searchHighlight, setSearchHighlight] = useState<number | null>(null);
  const [traversalList, setTraversalList] = useState<number[]>([]);
  const [activeTraversalIdx, setActiveTraversalIdx] = useState(-1);
  const [isTraversalPlaying, setIsTraversalPlaying] = useState(false);
  const [status, setStatus] = useState('BST ready. Add values or play traversals.');

  // Render variables for building the visual tree coordinates
  const buildTree = (values: number[]): BSTNode | undefined => {
    if (values.length === 0) return undefined;

    let root: BSTNode = { val: values[0], x: 250, y: 40, level: 0 };

    const insertHelper = (node: BSTNode, val: number, level: number, offset: number): BSTNode => {
      if (val < node.val) {
        if (!node.left) {
          node.left = { val, x: node.x - offset, y: node.y + 50, level: level + 1 };
        } else {
          insertHelper(node.left, val, level + 1, offset / 1.8);
        }
      } else if (val > node.val) {
        if (!node.right) {
          node.right = { val, x: node.x + offset, y: node.y + 50, level: level + 1 };
        } else {
          insertHelper(node.right, val, level + 1, offset / 1.8);
        }
      }
      return node;
    };

    for (let i = 1; i < values.length; i++) {
      root = insertHelper(root, values[i], 0, 100);
    }

    return root;
  };

  const activeTree = buildTree(treeVals);

  // Insert a value
  const handleInsert = () => {
    const val = parseInt(insertInput, 10);
    if (isNaN(val)) return;
    if (treeVals.includes(val)) {
      setStatus(`Value ${val} already exists in the tree.`);
      return;
    }
    setTreeVals((prev) => [...prev, val]);
    setStatus(`Inserted ${val} into BST.`);
    setInsertInput('');
    setSearchHighlight(null);
    setTraversalList([]);
    setActiveTraversalIdx(-1);
  };

  // Search a value
  const handleSearch = () => {
    const val = parseInt(searchInput, 10);
    if (isNaN(val)) return;

    let current = activeTree;
    let found = false;
    const path: number[] = [];

    while (current) {
      path.push(current.val);
      if (current.val === val) {
        found = true;
        break;
      }
      if (val < current.val) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    // Animate path highlight
    let i = 0;
    setStatus(`Searching for ${val}...`);
    const interval = setInterval(() => {
      if (i < path.length) {
        setSearchHighlight(path[i]);
        i++;
      } else {
        clearInterval(interval);
        if (found) {
          setStatus(`Value ${val} found in tree!`);
        } else {
          setStatus(`Value ${val} not found in tree.`);
          setSearchHighlight(null);
        }
      }
    }, 500);
  };

  // Traversal Helper
  const traverse = (mode: 'inorder' | 'preorder' | 'postorder') => {
    const list: number[] = [];
    const helper = (node: BSTNode | undefined) => {
      if (!node) return;
      if (mode === 'preorder') list.push(node.val);
      helper(node.left);
      if (mode === 'inorder') list.push(node.val);
      helper(node.right);
      if (mode === 'postorder') list.push(node.val);
    };

    helper(activeTree);
    setTraversalList(list);
    setActiveTraversalIdx(0);
    setIsTraversalPlaying(true);
    setSearchHighlight(null);
    setStatus(`Playing ${mode.toUpperCase()} traversal: ${list.join(' -> ')}`);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTraversalPlaying && activeTraversalIdx >= 0) {
      interval = setInterval(() => {
        setActiveTraversalIdx((prev) => {
          if (prev >= traversalList.length - 1) {
            setIsTraversalPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTraversalPlaying, activeTraversalIdx, traversalList]);

  // Reset tree
  const resetTree = () => {
    setTreeVals([50, 30, 70, 20, 40, 60, 80]);
    setSearchHighlight(null);
    setTraversalList([]);
    setActiveTraversalIdx(-1);
    setIsTraversalPlaying(false);
    setStatus('Tree reset to default structure.');
  };

  // Helper to draw lines and nodes
  const renderNodes = (node: BSTNode | undefined): React.ReactNode => {
    if (!node) return null;

    const isSearchResult = searchHighlight === node.val;
    const isTraversalActive =
      activeTraversalIdx >= 0 && traversalList[activeTraversalIdx] === node.val;

    let fill = 'fill-white dark:fill-gray-900 stroke-black dark:stroke-white';
    let text = 'fill-gray-900 dark:fill-white';

    if (isSearchResult) {
      fill = 'fill-cyan-500 stroke-cyan-600';
      text = 'fill-white';
    } else if (isTraversalActive) {
      fill = 'fill-green-500 stroke-green-600';
      text = 'fill-white';
    }

    return (
      <g key={node.val}>
        {/* Left Line */}
        {node.left && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            className="stroke-gray-300 dark:stroke-gray-700 stroke-2"
          />
        )}
        {/* Right Line */}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            className="stroke-gray-300 dark:stroke-gray-700 stroke-2"
          />
        )}

        {/* Node Circle */}
        <circle cx={node.x} cy={node.y} r={18} className={`stroke-2 transition-all ${fill}`} />
        <text
          x={node.x}
          y={node.y + 4}
          textAnchor="middle"
          className={`text-[11px] font-bold font-mono transition-all ${text}`}
        >
          {node.val}
        </text>

        {renderNodes(node.left)}
        {renderNodes(node.right)}
      </g>
    );
  };

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl text-gray-900 dark:text-white dark:font-display dark:font-display">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
          <GitCommit size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display">
            Program 10: Binary Search Tree (BST)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Interactive tree visualization with insert, search, and traversals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar Controls */}
        <div className="space-y-4">
          {/* Insertion */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Insert Value</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                value={insertInput}
                onChange={(e) => setInsertInput(e.target.value)}
                placeholder="Val"
                className="flex-grow min-w-[60px] px-2 py-1 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 rounded-lg text-xs"
              />
              <button
                onClick={handleInsert}
                className="flex-grow flex items-center justify-center gap-1 py-1.5 bg-cyan-500 text-white rounded-lg font-bold text-xs"
              >
                <Plus size={12} /> Insert
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Search Tree</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Val"
                className="flex-grow min-w-[60px] px-2 py-1 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 rounded-lg text-xs"
              />
              <button
                onClick={handleSearch}
                className="flex-grow flex items-center justify-center gap-1 py-1.5 bg-gray-950 text-white dark:bg-gray-100 dark:text-gray-950 rounded-lg font-bold text-xs"
              >
                <Search size={12} /> Search
              </button>
            </div>
          </div>

          {/* Traversals */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20 space-y-2">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Traversals</label>
            <button
              onClick={() => traverse('inorder')}
              className="w-full py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all"
            >
              Inorder (LVR)
            </button>
            <button
              onClick={() => traverse('preorder')}
              className="w-full py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all"
            >
              Preorder (VLR)
            </button>
            <button
              onClick={() => traverse('postorder')}
              className="w-full py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all"
            >
              Postorder (LRV)
            </button>
          </div>

          <button
            onClick={resetTree}
            className="w-full py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs hover:text-red-500 flex justify-center items-center gap-1"
          >
            <RotateCcw size={12} /> Reset Tree
          </button>
        </div>

        {/* Canvas Display */}
        <div className="xl:col-span-3 p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-200 dark:border-cyan-500/20 rounded-2xl flex flex-col justify-between items-center min-h-[360px]">
          <svg className="w-full max-w-[500px] h-[260px]">
            {activeTree ? renderNodes(activeTree) : (
              <text x="250" y="130" textAnchor="middle" className="fill-gray-400 font-mono text-xs">
                Tree is empty
              </text>
            )}
          </svg>

          {/* Status logs */}
          <div className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-cyan-500/20 rounded-xl text-xs font-mono text-gray-700 dark:text-gray-300">
            <span className="font-bold text-cyan-500 dark:text-cyan-400 mr-2 uppercase tracking-wide">STATUS:</span>
            {status}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20">
        <Info className="text-cyan-500 dark:text-cyan-400 dark:text-cyan-400 shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-cyan-800 dark:text-cyan-300 dark:font-code leading-relaxed font-medium">
          <strong>BST Concept:</strong> In a Binary Search Tree, for any given node, values in its left subtree must be less than the node's value, and values in its right subtree must be greater. Searching runs in average O(log N) time, partitioning the search space at each level.
        </p>
      </div>
    </div>
  );
}
