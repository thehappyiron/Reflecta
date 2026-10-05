'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';

export interface MagneticDockProps {
  children?: React.ReactNode;
  className?: string;
  magneticDistance?: number;
  maxScale?: number;
}

export function MagneticDockContainer({
  children,
  className = '',
  magneticDistance = 160,
  maxScale = 1.35,
}: MagneticDockProps) {
  const mouseX = useMotionValue(Infinity);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
  };

  const handleMouseLeave = () => {
    mouseX.set(Infinity);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex items-center justify-center overflow-visible ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return (
          <MagneticDockItem
            mouseX={mouseX}
            magneticDistance={magneticDistance}
            maxScale={maxScale}
          >
            {child}
          </MagneticDockItem>
        );
      })}
    </div>
  );
}

export function MagneticDockItem({
  mouseX,
  children,
  className = '',
  onClick,
  magneticDistance = 160,
  maxScale = 1.35,
}: {
  mouseX: MotionValue<number>;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  magneticDistance?: number;
  maxScale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    const center = bounds.x + bounds.width / 2;
    return val - center;
  });

  const scaleSync = useTransform(
    distance,
    [-magneticDistance, 0, magneticDistance],
    [1, maxScale, 1]
  );

  const ySync = useTransform(
    distance,
    [-magneticDistance, 0, magneticDistance],
    [0, -5, 0]
  );

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
      className={`inline-flex items-center origin-bottom select-none ${className}`}
    >
      {children}
    </motion.div>
  );
}

export const MagneticDock = MagneticDockContainer;
