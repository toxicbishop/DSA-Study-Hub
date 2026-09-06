import React, { useState } from 'react';
import { Network, Plus, Trash, ToggleLeft, ToggleRight, Info } from 'lucide-react';

interface NodeData {
  id: string;
  usn: string;
  name: string;
  branch: string;
}

const INITIAL_NODES: NodeData[] = [
  { id: '1', usn: '1RV21CS001', name: 'Alice', branch: 'CSE' },
  { id: '2', usn: '1RV21CS002', name: 'Bob', branch: 'ISE' },
  { id: '3', usn: '1RV21CS003', name: 'Charlie', branch: 'ECE' },
];

interface LinkedListVisualizerProps {
  initialIsDLL?: boolean;
}

export default function LinkedListVisualizer({ initialIsDLL = false }: LinkedListVisualizerProps) {
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [isDLL, setIsDLL] = useState(initialIsDLL); // Toggle between SLL and DLL mode

  // Input states
  const [usn, setUsn] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [logs, setLogs] = useState<string[]>(
    initialIsDLL
      ? ['List initialized. Mode: Doubly Linked List (DLL)']
      : ['List initialized. Mode: Singly Linked List (SLL)']
  );

  const addLog = (msg: string) => {
    setLogs((prev) => [msg, ...prev]);
  };

  const insertFront = () => {
    if (!usn.trim() || !name.trim()) return;
    const newNode: NodeData = {
      id: Math.random().toString(),
      usn,
      name,
      branch,
    };
    setNodes((prev) => [newNode, ...prev]);
    addLog(`Inserted node (USN: ${usn}, Name: ${name}) at Front.`);
    setUsn('');
    setName('');
  };

  const insertEnd = () => {
    if (!usn.trim() || !name.trim()) return;
    const newNode: NodeData = {
      id: Math.random().toString(),
      usn,
      name,
      branch,
    };
    setNodes((prev) => [...prev, newNode]);
    addLog(`Inserted node (USN: ${usn}, Name: ${name}) at End.`);
    setUsn('');
    setName('');
  };

  const deleteFront = () => {
    if (nodes.length === 0) {
      addLog('Failed delete: list is empty.');
      return;
    }
    const deleted = nodes[0];
    setNodes((prev) => prev.slice(1));
    addLog(`Deleted node (USN: ${deleted.usn}) from Front.`);
  };

  const deleteEnd = () => {
    if (nodes.length === 0) {
      addLog('Failed delete: list is empty.');
      return;
    }
    const deleted = nodes[nodes.length - 1];
    setNodes((prev) => prev.slice(0, -1));
    addLog(`Deleted node (USN: ${deleted.usn}) from End.`);
  };

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl text-gray-900 dark:text-white dark:font-display dark:font-display">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
            <Network size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display">
              Program {isDLL ? '8: Doubly' : '7: Singly'} Linked List
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Interactive node insertions/deletions with reference pointers.
            </p>
          </div>
        </div>

        {/* Toggle Mode */}
        <button
          onClick={() => {
            setIsDLL(!isDLL);
            addLog(`Switched list mode to: ${!isDLL ? 'Doubly' : 'Singly'} Linked List`);
          }}
          className="flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-white rounded-xl font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
        >
          {isDLL ? <ToggleRight className="text-cyan-500 dark:text-cyan-400" size={20} /> : <ToggleLeft size={20} />}
          <span>{isDLL ? 'DLL Active' : 'SLL Active'}</span>
        </button>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        {/* Controls Panel */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20">
          <h4 className="font-extrabold text-sm uppercase tracking-wide mb-3 text-cyan-500 dark:text-cyan-400">
            Node Fields
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">USN</label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                placeholder="1RV21CS001"
                className="w-full px-3 py-1.5 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                className="w-full px-3 py-1.5 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#070B14] border border-gray-300 dark:border-cyan-500/30 dark:text-slate-200 rounded-lg outline-none text-xs font-semibold"
              >
                {['CSE', 'ISE', 'ECE', 'ME', 'CIVIL'].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={insertFront}
              disabled={!usn.trim() || !name.trim()}
              className="flex items-center gap-1 px-3 py-2 bg-cyan-500 text-white rounded-lg font-bold text-xs hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow"
            >
              <Plus size={14} /> Insert Front
            </button>
            <button
              onClick={insertEnd}
              disabled={!usn.trim() || !name.trim()}
              className="flex items-center gap-1 px-3 py-2 bg-cyan-500 text-white rounded-lg font-bold text-xs hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow"
            >
              <Plus size={14} /> Insert End
            </button>
            <button
              onClick={deleteFront}
              disabled={nodes.length === 0}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-bold text-xs hover:bg-red-500 hover:text-white disabled:opacity-50 transition-all"
            >
              <Trash size={14} /> Delete Front
            </button>
            <button
              onClick={deleteEnd}
              disabled={nodes.length === 0}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-bold text-xs hover:bg-red-500 hover:text-white disabled:opacity-50 transition-all"
            >
              <Trash size={14} /> Delete End
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-cyan-500/20">
          <h4 className="font-extrabold text-sm uppercase tracking-wide mb-2 text-gray-400">
            Operations Log
          </h4>
          <div className="h-28 overflow-y-auto font-mono text-[10px] space-y-1 bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-200 dark:border-gray-900">
            {logs.map((log, i) => (
              <div key={i} className="text-gray-600 dark:text-gray-400">
                &gt; {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nodes visual representation */}
      <div className="p-6 bg-gray-50 dark:bg-gray-950/40 rounded-2xl border border-gray-200 dark:border-cyan-500/20 flex items-center gap-2 overflow-x-auto min-h-[160px] pb-4">
        {/* Starting pointer */}
        <div className="flex items-center shrink-0">
          <div className="px-3 py-1.5 bg-cyan-500 text-white rounded-md text-[10px] font-extrabold tracking-widest uppercase">
            Head
          </div>
          <div className="w-6 h-0.5 bg-cyan-500" />
          {isDLL && <div className="border-l-4 border-y-4 border-y-transparent border-l-cyan-500 -ml-1" />}
          <div className="border-r-4 border-y-4 border-y-transparent border-r-cyan-500 -mr-1" />
        </div>

        {nodes.length === 0 ? (
          <div className="text-sm font-bold text-gray-400 tracking-wide font-mono px-4">
            NULL (Empty List)
          </div>
        ) : (
          nodes.map((node, index) => {
            const isLast = index === nodes.length - 1;

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div className="p-3 bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] shrink-0 min-w-[130px] font-mono text-[10px] leading-tight flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1 text-cyan-500 dark:text-cyan-400 font-extrabold uppercase">
                    <span>Node {index + 1}</span>
                    <span className="px-1 py-0.2 bg-cyan-500/10 text-[8px] rounded">{node.branch}</span>
                  </div>
                  <div>USN: <span className="font-bold text-gray-800 dark:text-gray-200">{node.usn}</span></div>
                  <div>Name: <span className="font-bold text-gray-800 dark:text-gray-200">{node.name}</span></div>
                </div>

                {/* Arrow connector */}
                {!isLast && (
                  <div className="flex items-center shrink-0 w-8">
                    <div className="w-full h-0.5 bg-gray-400 dark:bg-gray-700" />
                    {isDLL && <div className="border-l-4 border-y-4 border-y-transparent border-l-gray-400 dark:border-l-gray-700 -ml-8" />}
                    <div className="border-r-4 border-y-4 border-y-transparent border-r-gray-400 dark:border-r-gray-700 -mr-1" />
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}

        {/* Ending null */}
        {nodes.length > 0 && (
          <div className="flex items-center shrink-0">
            <div className="w-6 h-0.5 bg-gray-400 dark:bg-gray-700" />
            <div className="border-r-4 border-y-4 border-y-transparent border-r-gray-400 dark:border-r-gray-700 -mr-1" />
            <span className="text-[10px] font-extrabold font-mono px-2 text-gray-400 uppercase">
              NULL
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20">
        <Info className="text-cyan-500 dark:text-cyan-400 dark:text-cyan-400 shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-cyan-800 dark:text-cyan-300 dark:font-code leading-relaxed font-medium">
          <strong>LinkedList Physics:</strong> Singly Linked Lists (SLL) contain values and a single `next` reference pointer linking sequentially. Doubly Linked Lists (DLL) extend this with double links (`prev` and `next`), allowing bidirectional traversal at the expense of extra memory pointer configurations.
        </p>
      </div>
    </div>
  );
}
