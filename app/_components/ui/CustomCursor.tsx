'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetPositionRef.current = { x: e.clientX, y: e.clientY };
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(animateCursor);
      }
    };

    const animateCursor = () => {
      if (!cursorRef.current) return;

      const dx = targetPositionRef.current.x - positionRef.current.x;
      const dy = targetPositionRef.current.y - positionRef.current.y;

      positionRef.current.x += dx * 0.2;
      positionRef.current.y += dy * 0.2;

      // CSS variables for position
      cursorRef.current.style.setProperty('--x', `${positionRef.current.x}px`);
      cursorRef.current.style.setProperty('--y', `${positionRef.current.y}px`);

      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        animationFrameRef.current = requestAnimationFrame(animateCursor);
      } else {
        animationFrameRef.current = undefined;
      }
    };

    const handleMouseInit = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
      targetPositionRef.current = { x: e.clientX, y: e.clientY };
      cursor.style.setProperty('--x', `${e.clientX}px`);
      cursor.style.setProperty('--y', `${e.clientY}px`);
    };

    // Hold-down shrink effect
    const handleMouseDown = () => cursor.classList.add('click');
    const handleMouseUp = () => cursor.classList.remove('click');

    // Hover grow effect
    const handleMouseOver = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-cursor-grow]')) {
        cursor.classList.add('hover');
      }
    };
    const handleMouseOut = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-cursor-grow]')) {
        cursor.classList.remove('hover');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleMouseInit, { once: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    const timer = setTimeout(() => setIsActive(true), 100);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleMouseInit);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      clearTimeout(timer);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return <div ref={cursorRef} className={`cursor-dot z-[1000] ${isActive ? 'active' : ''}`} />;
}
