import { useCallback, useEffect, useRef, useState } from "react";

export const CursorEffect: React.FC = () => {
  const [points, setPoints] = useState<{ x: number; y: number; id: number }[]>(
    []
  );
  const nextId = useRef(0);

  const addPoint = useCallback((x: number, y: number) => {
    const newPoint = { x, y, id: nextId.current++ };
    setPoints((prevPoints) => [...prevPoints, newPoint]);
    setTimeout(() => {
      setPoints((prevPoints) => prevPoints.filter((p) => p.id !== newPoint.id));
    }, 500);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      addPoint(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        addPoint(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [addPoint]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] h-screen w-screen overflow-hidden">
      {points.map((point) => (
        <div
          key={point.id}
          className="absolute w-2 h-2 bg-rose-300 rounded-full animate-cursor-sparkle"
          style={{ left: point.x - 4, top: point.y - 4 }}
        />
      ))}
    </div>
  );
};
