import { useEffect, useRef, useState } from 'react';

type Point = {
  x: number;
  y: number;
};

export function useCursorDrag(throttleMs = 16) {
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragEnd, setDragEnd] = useState<Point | null>(null);

  const isMouseDown = useRef(false);

  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      const point = { x: e.clientX, y: e.clientY };
      setPosition(point);

      if (isMouseDown.current) {
        setIsDragging(true);
      }
    }, throttleMs);

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true;
      setIsDragging(false);

      setDragStart({ x: e.clientX, y: e.clientY });
      setDragEnd(null);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDown.current) return;

      isMouseDown.current = false;
      setIsDragging(false);
      setDragEnd({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [throttleMs]);

  return {
    position,
    isDragging,
    dragStart,
    dragEnd,
  };
}
