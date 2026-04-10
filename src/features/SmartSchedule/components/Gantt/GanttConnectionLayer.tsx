import React from 'react';
import { useGanttStore } from '../../store/useGanttStore';
import { motion } from 'motion/react';

export const GanttConnectionLayer: React.FC = () => {
  const { links, nodePositions, ghostLink, rowHeight } = useGanttStore();

  const getPathD = (startX: number, startY: number, endX: number, endY: number) => {
    const curvature = 0.5;
    const dx = Math.abs(endX - startX);
    const cpX1 = startX + dx * curvature;
    const cpY1 = startY;
    const cpX2 = endX - dx * curvature;
    const cpY2 = endY;
    return `M ${startX} ${startY} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${endX} ${endY}`;
  };

  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" 
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="#9ca3af" />
        </marker>
        <marker id="arrowhead-glow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
           <polygon points="0 0, 6 3, 0 6" fill="#6366f1" />
        </marker>
      </defs>

      {/* Persistent Links with Self-Drawing Animation */}
      {links.map((link, index) => {
        const sourceNode = nodePositions[link.sourceId];
        const targetNode = nodePositions[link.targetId];

        // Safety Culling: If either node is not reporting a position (e.g. collapsed category)
        // or if coordinates are invalid (NaN), skip rendering the path entirely.
        if (!sourceNode || !targetNode) return null;
        
        const startX = sourceNode.x + sourceNode.width;
        const startY = sourceNode.y + rowHeight / 2;
        const endX = targetNode.x;
        const endY = targetNode.y + rowHeight / 2;

        if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) return null;

        return (
          <motion.path
            key={link.id}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.8 + (index * 0.05), // Wait for staggered blocks to start appearing
              ease: "easeInOut" 
            }}
            d={getPathD(startX, startY, endX, endY)}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            className="transition-colors hover:stroke-indigo-500 hover:filter-url(#glow) pointer-events-none"
          />
        );
      })}

      {/* Ghost Link */}
      {ghostLink && nodePositions[ghostLink.sourceId] && (
        <path
          d={getPathD(
            nodePositions[ghostLink.sourceId].x + nodePositions[ghostLink.sourceId].width, 
            nodePositions[ghostLink.sourceId].y + rowHeight / 2, 
            ghostLink.mouseX, 
            ghostLink.mouseY
          )}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeDasharray="4 4"
          markerEnd="url(#arrowhead-glow)"
          filter="url(#glow)"
          className="opacity-70 animate-pulse pointer-events-none"
        />
      )}
    </svg>
  );
};
