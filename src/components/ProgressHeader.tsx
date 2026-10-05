'use client';

/**
 * ProgressHeader — Global sequential progress indicator shown during decision flow.
 * Spec §23: "1 Understand → 2 Explore → 3 Challenge → 4 Reflect"
 *
 * Enhanced with authentic Floating Magnetic Dock interaction (magnifies items smoothly on hover
 * with physical lift & spring physics) and increased font size & readability.
 */
import React, { useRef } from 'react';
import type { DecisionStage } from '@/types';
import { Map, History } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';

interface Stage {
  key: DecisionStage;
  label: string;
  number: number;
  subtitle: string;
}

const STAGES: Stage[] = [
  { key: 'understand', label: 'Understand', number: 1, subtitle: 'What are you deciding?' },
  { key: 'explore',    label: 'Explore',    number: 2, subtitle: 'Separating facts from beliefs' },
  { key: 'challenge',  label: 'Challenge',  number: 3, subtitle: 'Questioning what might be missing' },
  { key: 'reflect',    label: 'Reflect',    number: 4, subtitle: 'Seeing your clearer view' },
];

const STAGE_ORDER: DecisionStage[] = ['understand', 'explain', 'explore', 'challenge', 'perspective', 'reflect'];

function getDisplayStage(current: DecisionStage): DecisionStage {
  if (current === 'explain') return 'understand';
  if (current === 'perspective') return 'challenge';
  return current;
}

function isCompleted(stageKey: DecisionStage, current: DecisionStage): boolean {
  const currentIdx = STAGE_ORDER.indexOf(current);
  const stageIdx = STAGE_ORDER.indexOf(stageKey);
  return stageIdx < currentIdx;
}

function isActive(stageKey: DecisionStage, current: DecisionStage): boolean {
  return getDisplayStage(current) === stageKey;
}

interface ProgressHeaderProps {
  currentStage: DecisionStage;
  isMapActive?: boolean;
  onToggleMap?: () => void;
  isHistoryActive?: boolean;
  onToggleHistory?: () => void;
}

/**
 * Magnetic Dock Item wrapper for authentic macOS/shadcn floating dock magnification
 */
function MagneticDockItem({
  mouseX,
  children,
  className = '',
  onClick,
}: {
  mouseX: MotionValue<number>;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    const center = bounds.x + bounds.width / 2;
    return val - center;
  });

  // Calculate magnetic scale and upward lift curve based on cursor distance
  const scaleSync = useTransform(distance, [-160, 0, 160], [1, 1.35, 1]);
  const ySync = useTransform(distance, [-160, 0, 160], [0, -5, 0]);

  const scale = useSpring(scaleSync, {
    mass: 0.1,
    stiffness: 300,
    damping: 22,
  });

  const y = useSpring(ySync, {
    mass: 0.1,
    stiffness: 300,
    damping: 22,
  });

  return (
    <motion.div
      ref={ref}
      style={{ scale, y }}
      onClick={onClick}
      className={`inline-flex items-center origin-bottom transition-colors duration-150 select-none ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function ProgressHeader({
  currentStage,
  isMapActive = false,
  onToggleMap,
  isHistoryActive = false,
  onToggleHistory,
}: ProgressHeaderProps) {
  const mouseX = useMotionValue(Infinity);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
  };

  const handleMouseLeave = () => {
    mouseX.set(Infinity);
  };

  return (
    <nav
      aria-label="Decision progress"
      className="w-full flex items-center justify-center py-3 px-4 gap-3.5 flex-wrap"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Stage Steps Container Pill */}
      <div className="flex items-center gap-2 sm:gap-4 bg-white/95 backdrop-blur-md rounded-full px-5 py-2.5 shadow-sm border border-stone-200/90 overflow-visible">
        {STAGES.map((stage, idx) => {
          const completed = isCompleted(stage.key, currentStage);
          const active = !isMapActive && !isHistoryActive && isActive(stage.key, currentStage);

          return (
            <div key={stage.key} className="flex items-center">
              <MagneticDockItem mouseX={mouseX}>
                {/* Stage indicator item */}
                <div
                  className={`
                    flex items-center gap-2 px-3.5 sm:px-4.5 py-1.5 rounded-full text-sm sm:text-base font-extrabold transition-colors duration-200 cursor-pointer select-none
                    ${active ? 'text-violet-800 bg-violet-100/90 font-black shadow-xs border border-violet-300' : ''}
                    ${completed ? 'text-emerald-700 font-extrabold' : ''}
                    ${!active && !completed ? 'text-stone-500 hover:text-stone-800' : ''}
                  `}
                  aria-current={active ? 'step' : undefined}
                  title={stage.subtitle}
                >
                  {/* Circle with number or checkmark */}
                  <span
                    className={`
                      flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors duration-200
                      ${active ? 'bg-violet-600 text-white shadow-xs' : ''}
                      ${completed ? 'bg-emerald-500 text-white' : ''}
                      ${!active && !completed ? 'bg-stone-200 text-stone-500' : ''}
                    `}
                  >
                    {completed ? (
                      <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      stage.number
                    )}
                  </span>
                  <span>{stage.label}</span>
                </div>
              </MagneticDockItem>

              {/* Connector line */}
              {idx < STAGES.length - 1 && (
                <div
                  className={`w-3 sm:w-6 h-0.5 mx-1 transition-colors duration-200 rounded-full ${
                    isCompleted(STAGES[idx + 1].key, currentStage) || isActive(STAGES[idx + 1].key, currentStage)
                      ? 'bg-violet-300'
                      : 'bg-stone-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── "Thinking Map" Button beside stage steps ─────────────────── */}
      {onToggleMap && (
        <MagneticDockItem mouseX={mouseX} onClick={onToggleMap}>
          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm sm:text-base font-extrabold transition-colors duration-200 cursor-pointer shadow-xs border select-none ${
              isMapActive
                ? 'bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-200'
                : 'bg-white/95 text-violet-800 hover:bg-violet-50 border-violet-200'
            }`}
            aria-label="Toggle Thinking Map View"
          >
            <Map size={16} className={isMapActive ? 'text-white' : 'text-violet-600'} />
            <span>Thinking Map</span>
          </button>
        </MagneticDockItem>
      )}

      {/* ── "History" Button beside Thinking Map ──────────────────────── */}
      {onToggleHistory && (
        <MagneticDockItem mouseX={mouseX} onClick={onToggleHistory}>
          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm sm:text-base font-extrabold transition-colors duration-200 cursor-pointer shadow-xs border select-none ${
              isHistoryActive
                ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-stone-300'
                : 'bg-white/95 text-stone-800 hover:bg-stone-100 border-stone-200'
            }`}
            aria-label="Toggle Decision History View"
          >
            <History size={16} className={isHistoryActive ? 'text-white' : 'text-stone-700'} />
            <span>History</span>
          </button>
        </MagneticDockItem>
      )}
    </nav>
  );
}
