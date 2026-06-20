'use client';

import { useEffect, useRef } from 'react';
import {
  useInView,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
} from 'framer-motion';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
}

export function AnimatedCounter({ target, duration = 2, suffix = '' }: AnimatedCounterProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (shouldReduceMotion || !isInView) return;
    const controls = animate(count, target, { duration });
    return () => controls.stop();
  }, [count, duration, target, isInView, shouldReduceMotion]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (shouldReduceMotion) {
      node.textContent = `${target}${suffix}`;
      return;
    }
    const unsubscribe = rounded.on('change', (v) => {
      node.textContent = `${v}${suffix}`;
    });
    return () => unsubscribe();
  }, [rounded, suffix, target, shouldReduceMotion]);

  return <span ref={containerRef} aria-label={`${target}${suffix}`} />;
}
