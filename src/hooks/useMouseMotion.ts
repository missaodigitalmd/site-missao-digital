import { useState, useEffect, useCallback, type RefObject } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

interface UseMouseMotionOptions {
  ref?: RefObject<HTMLElement>;
  enabled?: boolean;
}

export function useMouseMotion(options: UseMouseMotionOptions = {}) {
  const { ref, enabled = true } = options;
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!enabled) return;

      if (ref?.current) {
        const rect = ref.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const normalizedX = (x / rect.width) * 2 - 1;
        const normalizedY = (y / rect.height) * 2 - 1;

        setPosition({
          x,
          y,
          normalizedX: Math.max(-1, Math.min(1, normalizedX)),
          normalizedY: Math.max(-1, Math.min(1, normalizedY)),
        });
      } else {
        const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
        const normalizedY = (event.clientY / window.innerHeight) * 2 - 1;

        setPosition({
          x: event.clientX,
          y: event.clientY,
          normalizedX,
          normalizedY,
        });
      }
    },
    [ref, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const element = ref?.current || window;
    element.addEventListener('mousemove', handleMouseMove as EventListener);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove as EventListener);
    };
  }, [ref, enabled, handleMouseMove]);

  return position;
}

export default useMouseMotion;
