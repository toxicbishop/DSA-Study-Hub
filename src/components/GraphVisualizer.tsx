import React, { useState, useEffect } from 'react';
import { Route, RotateCcw } from 'lucide-react';

interface Vertex {
  id: number;
  x: number;
  y: number;
  label: string;
}

const DEFAULT_VERTICES: Vertex[] = [
  { id: 0, x: 150, y: 50, label: '0' },
  { id: 1, x: 280, y: 110, label: '1' },
  { id: 2, x: 250, y: 220, label: '2' },
  { id: 3, x: 100, y: 200, label: '3' },
];

const DEFAULT_ADJACENCY: number[][] = [
  [0, 1, 1, 0], // 0 is connected to 1, 2
  [0, 0, 0, 1], // 1 is connected to 3
  [0, 0, 0, 1], // 2 is connected to 3
  [1, 0, 0, 0], // 3 is connected to 0
];

export default function GraphVisualizer() {
  const [vertices] = useState<Vertex[]>(DEFAULT_VERTICES);
  const [adjMatrix, setAdjMatrix] = useState<number[][]>(DEFAULT_ADJACENCY);
  const [startNode, setStartNode] = useState(0);

  // Animation states
  const [isTraversalPlaying, setIsTraversalPlaying] = useState(false);
  const [traversalList, setTraversalList] = useState<number[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
  const [log, setLog] = useState('Graph ready. Select a start node and play BFS/DFS.');

  // Toggle edges in adjacency matrix
  const toggleEdge = (u: number, v: number) => {
    const updated = adjMatrix.map((row, rIdx) =>
      row.map((val, cIdx) => (rIdx === u && cIdx === v ? (val === 1 ? 0 : 1) : val))
    );
    setAdjMatrix(updated);
    resetAnimation();
  };

  const resetAnimation = () => {
    setIsTraversalPlaying(false);
    setTraversalList([]);
    setActiveIdx(-1);
    setVisitedNodes([]);
    setLog('Animation reset.');
  };

  // Run Breadth-First Search (BFS)
  const runBFS = () => {
    resetAnimation();
    const visited = Array(vertices.length).fill(false);
    const queue: number[] = [startNode];
    const order: number[] = [];
    visited[startNode] = true;

    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);

      for (let v = 0; v < vertices.length; v++) {
        if (adjMatrix[u][v] === 1 && !visited[v]) {
          visited[v] = true;
          queue.push(v);
        }
      }
    }

    setTraversalList(order);
    setActiveIdx(0);
    setIsTraversalPlaying(true);
    setLog(`Starting BFS traversal: ${order.join(' -> ')}`);
  };

  // Run Depth-First Search (DFS)
  const runDFS = () => {
    resetAnimation();
    const visited = Array(vertices.length).fill(false);
    const order: number[] = [];

    const dfsHelper = (u: number) => {
      visited[u] = true;
      order.push(u);

      for (let v = 0; v < vertices.length; v++) {
        if (adjMatrix[u][v] === 1 && !visited[v]) {
          dfsHelper(v);
        }
      }
    };

    dfsHelper(startNode);
    setTraversalList(order);
    setActiveIdx(0);
    setIsTraversalPlaying(true);
    setLog(`Starting DFS traversal: ${order.join(' -> ')}`);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTraversalPlaying && activeIdx >= 0) {
      interval = setInterval(() => {
        setVisitedNodes((prev) => [...prev, traversalList[activeIdx]]);

        setActiveIdx((prev) => {
          if (prev >= traversalList.length - 1) {
            setIsTraversalPlaying(false);
            setLog('Traversal completed.');
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTraversalPlaying, activeIdx, traversalList]);

  const activeNodeVal = traversalList[activeIdx];

  return (
    <div className="p-6 neo-brutalism bg-white dark:bg-[#0D1424]/80 dark:border dark:border-cyan-500/20 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:backdrop-blur-xl rounded-xl text-gray-900 dark:text-white dark:font-display dark:font-display">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border dark:border-cyan-500/30 rounded-xl text-white">
          <Route size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white dark:font-display dark:font-display">
            Program 11: Graph Operations (BFS/DFS)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Interactive representation of vertices, directed edges, and search algorithms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-6 font-mono text-xs">
        {/* Adjacency Matrix Builder */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-cyan-500/20 rounded-xl space-y-4">
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wide text-cyan-500 dark:text-cyan-400 mb-2 font-sans">
              Start Node
            </h4>
            <select
              value={startNode}
              onChange={(e) => setStartNode(Number(e.target.value))}
              className="w-full p-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg font-bold outline-none text-xs"
            >
              {vertices.map((v) => (
                <option key={v.id} value={v.id}>
                  Vertex {v.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wide text-cyan-500 dark:text-cyan-400 mb-2 font-sans">
              Adjacency Matrix
            </h4>
            <div className="grid grid-cols-5 gap-1 text-center font-bold">
              <span />
              {vertices.map((v) => (
                <span key={v.id} className="text-gray-400">
                  {v.id}
                </span>
              ))}

              {adjMatrix.map((row, u) => (
                <React.Fragment key={u}>
                  <span className="text-gray-400 flex items-center justify-center font-bold">{u}</span>
                  {row.map((val, v) => (
                    <button
                      key={v}
                      onClick={() => toggleEdge(u, v)}
                      className={`w-6 h-6 border flex items-center justify-center rounded transition-all ${
                        val === 1
                          ? 'bg-cyan-500 border-cyan-600 text-white font-extrabold'
                          : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-cyan-500/20 text-gray-400'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>
            <span className="text-[10px] text-gray-400 block mt-2 font-sans">
              * Click any cell to toggle directed edge.
            </span>
          </div>

          <div className="flex gap-2 font-sans">
            <button
              onClick={runBFS}
              className="flex-1 py-2 bg-cyan-500 text-white rounded-lg font-bold text-xs"
            >
              Play BFS
            </button>
            <button
              onClick={runDFS}
              className="flex-1 py-2 bg-gray-950 text-white dark:bg-gray-100 dark:text-gray-950 rounded-lg font-bold text-xs"
            >
              Play DFS
            </button>
            <button
              onClick={resetAnimation}
              className="p-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Graph SVG Display */}
        <div className="md:col-span-2 lg:col-span-1 xl:col-span-2 p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-200 dark:border-cyan-500/20 rounded-2xl flex flex-col justify-between items-center min-h-[300px]">
          <svg className="w-full max-w-[400px] h-[250px]">
            {/* Draw Directed Edges */}
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-gray-400 dark:fill-gray-600" />
              </marker>
            </defs>

            {adjMatrix.map((row, u) =>
              row.map((connected, v) => {
                if (connected !== 1) return null;
                const from = vertices[u];
                const to = vertices[v];
                return (
                  <line
                    key={`${u}-${v}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className="stroke-gray-300 dark:stroke-gray-700 stroke-2"
                    markerEnd="url(#arrow)"
                  />
                );
              })
            )}

            {/* Draw Vertices */}
            {vertices.map((v) => {
              const isActive = activeNodeVal === v.id;
              const isVisited = visitedNodes.includes(v.id);

              let fill = 'fill-white dark:fill-gray-900 stroke-black dark:stroke-white';
              let text = 'fill-gray-900 dark:fill-white';

              if (isActive) {
                fill = 'fill-cyan-500 stroke-cyan-600';
                text = 'fill-white';
              } else if (isVisited) {
                fill = 'fill-green-500 stroke-green-600';
                text = 'fill-white';
              }

              return (
                <g key={v.id}>
                  <circle cx={v.x} cy={v.y} r={16} className={`stroke-2 transition-all ${fill}`} />
                  <text
                    x={v.x}
                    y={v.y + 4}
                    textAnchor="middle"
                    className={`text-[10px] font-bold transition-all ${text}`}
                  >
                    {v.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Logs */}
          <div className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-cyan-500/20 rounded-xl text-xs font-mono text-gray-700 dark:text-gray-300">
            <span className="font-bold text-cyan-500 dark:text-cyan-400 mr-2 uppercase tracking-wide">STATUS:</span>
            {log}
          </div>
        </div>
      </div>
    </div>
  );
}
