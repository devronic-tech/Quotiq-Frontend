import { motion } from 'framer-motion';

interface SankeyNode {
  name: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface SankeyDiagramProps {
  data: SankeyData;
  isLoading?: boolean;
}

export default function SankeyDiagram({ data, isLoading }: SankeyDiagramProps) {
  if (isLoading || !data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl shimmer">
        <span className="text-xs text-on-surface-variant font-semibold">Loading money flow mapping...</span>
      </div>
    );
  }

  const nodes = data.nodes;
  const links = data.links;

  // Let's compute a simple visual layout for our fixed nodes
  // Left: Node 0 (Revenue)
  // Mid-Left: Node 1 (Wallet)
  // Right: Nodes 2-7 (Categories)
  const nodeLayouts = [
    { x: 50, y: 120, color: 'bg-emerald-500 text-emerald-500' }, // 0. Revenue
    { x: 250, y: 120, color: 'bg-primary text-primary' },      // 1. Wallet
    { x: 520, y: 30, color: 'bg-indigo-500 text-indigo-500' },   // 2. Salaries
    { x: 520, y: 70, color: 'bg-orange-500 text-orange-500' },   // 3. Office
    { x: 520, y: 110, color: 'bg-sky-500 text-sky-500' },      // 4. Cloud
    { x: 520, y: 150, color: 'bg-pink-500 text-pink-500' },     // 5. Marketing
    { x: 520, y: 190, color: 'bg-red-500 text-red-500' },       // 6. Taxes
    { x: 520, y: 230, color: 'bg-teal-500 text-teal-500' }      // 7. Remaining Cash
  ];

  const totalValue = links.filter(l => l.source === 1).reduce((sum, l) => sum + l.value, 0) || 1;

  return (
    <div className="relative w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-md overflow-x-auto">
      <h4 className="font-card-title text-sm text-on-surface mb-sm flex items-center gap-xs">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot"></span>
        <span>Interactive Money Flow Ledger</span>
      </h4>
      <div className="min-w-[600px] h-[280px] relative select-none">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="revToWallet" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#004ac6" stopOpacity="0.2" />
            </linearGradient>
            {nodeLayouts.map((node, idx) => {
              if (idx <= 1) return null;
              // Link from Wallet (Node 1) to Node idx
              const colors = ['#6366f1', '#f97316', '#0ea5e9', '#ec4899', '#ef4444', '#14b8a6'];
              const col = colors[idx - 2] || '#737686';
              return (
                <linearGradient key={`grad-${idx}`} id={`grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#004ac6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor={col} stopOpacity="0.2" />
                </linearGradient>
              );
            })}
          </defs>

          {/* Links paths */}
          {links.map((link, idx) => {
            const srcNode = nodeLayouts[link.source];
            const tgtNode = nodeLayouts[link.target];
            if (!srcNode || !tgtNode) return null;

            // Generate cubic bezier curve
            const x1 = srcNode.x + 80;
            const y1 = srcNode.y + 15;
            const x2 = tgtNode.x - 10;
            const y2 = tgtNode.y + 15;
            const controlOffset = (x2 - x1) / 2;
            const pathData = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

            // Width relative to value size
            const pct = link.value / totalValue;
            const strokeWidth = link.source === 0 ? 12 : Math.max(3, Math.min(16, pct * 24));
            const gradId = link.source === 0 ? 'revToWallet' : `grad-${link.target}`;

            return (
              <g key={`link-${idx}`}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth={strokeWidth}
                  className="transition-all duration-300"
                />
                {/* Flow particle animation */}
                <motion.path
                  d={pathData}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeDasharray="6, 12"
                  animate={{ strokeDashoffset: [-60, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                  className="opacity-70"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes layer */}
        {nodes.map((node, idx) => {
          const layout = nodeLayouts[idx];
          if (!layout) return null;

          // Find link values
          let valueText = '';
          if (idx === 0) {
            const val = links.find(l => l.source === 0)?.value || 0;
            valueText = `₹${val.toLocaleString('en-IN')}`;
          } else if (idx === 1) {
            const val = links.filter(l => l.source === 1).reduce((sum, l) => sum + l.value, 0);
            valueText = `₹${val.toLocaleString('en-IN')}`;
          } else {
            const val = links.find(l => l.target === idx)?.value || 0;
            valueText = `₹${val.toLocaleString('en-IN')}`;
          }

          return (
            <div
              key={`node-${idx}`}
              className="absolute flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-outline-variant/60 shadow-soft w-[110px] text-center"
              style={{ left: layout.x, top: layout.y }}
            >
              <span className="text-[10px] uppercase font-bold text-on-surface-variant leading-none truncate w-full">{node.name}</span>
              <span className="text-[11px] font-bold font-mono text-primary mt-1 leading-none">{valueText}</span>
              <div className={`h-[3px] w-8 rounded-full ${layout.color.split(' ')[0]} mt-1.5`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
