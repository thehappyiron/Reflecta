"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface PointerProps {
  children: React.ReactNode;
  className?: string;
  name?: string;
}

export function Pointer({ children, className, name = "REFLECTA" }: PointerProps) {
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // High-performance spring physics for ultra-smooth 120Hz tracking
  const smoothX = useSpring(rawX, { damping: 30, stiffness: 500, mass: 0.1 });
  const smoothY = useSpring(rawY, { damping: 30, stiffness: 500, mass: 0.1 });

  const [isInside, setIsInside] = useState<boolean>(false);
  const [isClicking, setIsClicking] = useState<boolean>(false);

  useEffect(() => {
    // Use native window pointermove event to capture motion CONTINUOUSLY,
    // including during canvas dragging, map panning, scrolling & node movements!
    const handlePointerMove = (e: PointerEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      if (!isInside) setIsInside(true);
    };

    const handlePointerDown = () => setIsClicking(true);
    const handlePointerUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsInside(false);
    const handleMouseEnter = () => setIsInside(true);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isInside, rawX, rawY]);

  return (
    <div className={cn("relative min-h-screen w-full custom-pointer-active", className)}>
      <AnimatePresence>
        {isInside && (
          <FollowPointer
            x={smoothX}
            y={smoothY}
            name={name}
            isClicking={isClicking}
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

interface FollowPointerProps {
  x: any;
  y: any;
  name: string;
  isClicking: boolean;
}

function FollowPointer({ x, y, name, isClicking }: FollowPointerProps) {
  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[99999] flex items-center gap-2"
      style={{
        x,
        y,
        pointerEvents: "none",
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: isClicking ? 0.90 : 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      {/* Sleek Precision Vector Pointer Arrow */}
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="1"
        viewBox="0 0 16 16"
        className="h-6 w-6 -translate-x-[12px] -translate-y-[10px] -rotate-[70deg] transform stroke-violet-700 text-violet-600 drop-shadow-md"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
      </svg>

      {/* Ultra-Sleek Glass Label Badge */}
      <div className="w-fit rounded-full bg-stone-900/90 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-violet-200 uppercase shadow-md border border-violet-400/40 backdrop-blur-md whitespace-nowrap">
        {name}
      </div>
    </motion.div>
  );
}
