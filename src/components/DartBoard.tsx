import React, { useRef } from 'react';
import { getThrowFromClick, SEGMENTS, BOARD_RADII } from '../utils/dartUtils';
import { ThrowResult, BullMode } from '../types';
import './DartBoard.css';

interface DartBoardProps {
  onThrow: (result: ThrowResult) => void;
  disabled?: boolean;
  bullMode?: BullMode;
}

const CX = 200;
const CY = 200;
const OUTER_R = 190;

function polarToXY(angleDeg: number, r: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function segmentPath(r1: number, r2: number, startDeg: number, endDeg: number): string {
  const [x1s, y1s] = polarToXY(startDeg, r1);
  const [x1e, y1e] = polarToXY(endDeg, r1);
  const [x2e, y2e] = polarToXY(endDeg, r2);
  const [x2s, y2s] = polarToXY(startDeg, r2);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${x1s} ${y1s}`,
    `A ${r1} ${r1} 0 ${largeArc} 1 ${x1e} ${y1e}`,
    `L ${x2e} ${y2e}`,
    `A ${r2} ${r2} 0 ${largeArc} 0 ${x2s} ${y2s}`,
    'Z',
  ].join(' ');
}

const r_doubleBull = OUTER_R * BOARD_RADII.doubleBull;
const r_singleBull = OUTER_R * BOARD_RADII.singleBull;
const r_tripleInner = OUTER_R * BOARD_RADII.tripleInner;
const r_tripleOuter = OUTER_R * BOARD_RADII.tripleOuter;
const r_doubleInner = OUTER_R * BOARD_RADII.doubleInner;
const r_doubleOuter = OUTER_R * BOARD_RADII.doubleOuter;

const EVEN_SINGLE = '#2a2a2a';
const ODD_SINGLE = '#f0e8d0';
const EVEN_SCORE = '#1a7a1a';
const ODD_SCORE = '#cc2222';
const WIRE = '#888';

export default function DartBoard({ onThrow, disabled = false, bullMode }: DartBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (disabled) return;
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 400 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    const result = getThrowFromClick(clickX, clickY, CX, CY, OUTER_R, bullMode);
    if (result) onThrow(result);
  }

  const segments = SEGMENTS.map((value, i) => {
    // Each segment is 18 degrees. Segment 0 (value 20) centered at top (270 degrees in SVG)
    // Start angle: 270 - 9 + i*18 = 261 + i*18
    const centerAngle = 270 + i * 18;
    const startAngle = centerAngle - 9;
    const endAngle = centerAngle + 9;
    const isEven = i % 2 === 0;
    const singleColor = isEven ? EVEN_SINGLE : ODD_SINGLE;
    const scoreColor = isEven ? EVEN_SCORE : ODD_SCORE;

    // Number label position (outside double ring)
    const labelR = OUTER_R + 14;
    const [lx, ly] = polarToXY(centerAngle, labelR);

    return (
      <g key={value}>
        {/* Inner single */}
        <path d={segmentPath(r_singleBull, r_tripleInner, startAngle, endAngle)} fill={singleColor} />
        {/* Triple */}
        <path d={segmentPath(r_tripleInner, r_tripleOuter, startAngle, endAngle)} fill={scoreColor} />
        {/* Outer single */}
        <path d={segmentPath(r_tripleOuter, r_doubleInner, startAngle, endAngle)} fill={singleColor} />
        {/* Double */}
        <path d={segmentPath(r_doubleInner, r_doubleOuter, startAngle, endAngle)} fill={scoreColor} />
        {/* Number */}
        <text
          x={lx}
          y={ly}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="13"
          fontWeight="bold"
          fill="#fff"
          style={{ userSelect: 'none' }}
        >
          {value}
        </text>
      </g>
    );
  });

  return (
    <div className={`dartboard-container${disabled ? ' dartboard-disabled' : ''}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="dartboard-svg"
        onClick={handleClick}
        style={{ cursor: disabled ? 'default' : 'crosshair' }}
      >
        {/* Black border */}
        <circle cx={CX} cy={CY} r={OUTER_R + 18} fill="#111" />
        {/* Outer wire */}
        <circle cx={CX} cy={CY} r={OUTER_R} fill="#333" />

        {/* Segments */}
        {segments}

        {/* Wire rings */}
        <circle cx={CX} cy={CY} r={r_singleBull} fill="none" stroke={WIRE} strokeWidth="0.8" />
        <circle cx={CX} cy={CY} r={r_tripleInner} fill="none" stroke={WIRE} strokeWidth="0.8" />
        <circle cx={CX} cy={CY} r={r_tripleOuter} fill="none" stroke={WIRE} strokeWidth="0.8" />
        <circle cx={CX} cy={CY} r={r_doubleInner} fill="none" stroke={WIRE} strokeWidth="0.8" />
        <circle cx={CX} cy={CY} r={r_doubleOuter} fill="none" stroke={WIRE} strokeWidth="0.8" />

        {/* Segment dividers */}
        {SEGMENTS.map((_, i) => {
          const angle = 261 + i * 18;
          const [x1, y1] = polarToXY(angle, r_singleBull);
          const [x2, y2] = polarToXY(angle, r_doubleOuter);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={WIRE} strokeWidth="0.8" />;
        })}

        {/* Bull */}
        <circle cx={CX} cy={CY} r={r_singleBull} fill="#1a7a1a" />
        <circle cx={CX} cy={CY} r={r_doubleBull} fill="#cc2222" />

        {/* Bull text */}
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fontSize="7" fill="#fff" style={{ userSelect: 'none' }}>
          Bull
        </text>
      </svg>
    </div>
  );
}
