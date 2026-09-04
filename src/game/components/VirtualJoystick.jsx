import React, { useRef, useState, useCallback, useEffect } from 'react';

const VirtualJoystick = ({ onChange }) => {
  const baseRef = useRef(null);
  const stickRef = useRef(null);
  const [active, setActive] = useState(false);
  const basePos = useRef({ x: 0, y: 0 });
  const touchId = useRef(null);
  const rad = 38;

  const handleStart = useCallback((e) => {
    const touch = e.touches[0];
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    basePos.current = { x: rect.left, y: rect.top };
    touchId.current = touch.identifier;
    setActive(true);
    moveStick(touch.clientX, touch.clientY);
  }, []);

  const moveStick = (cx, cy) => {
    const dx = cx - (basePos.current.x);
    const dy = cy - (basePos.current.y);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, rad);
    const angle = Math.atan2(dy, dx);
    const x = Math.cos(angle) * clamped;
    const y = Math.sin(angle) * clamped;
    if (stickRef.current) {
      stickRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
    onChange?.({
      x: x / rad,
      y: y / rad,
    });
  };

  const handleMove = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === touchId.current) {
        moveStick(e.touches[i].clientX, e.touches[i].clientY);
        break;
      }
    }
  }, []);

  const handleEnd = useCallback(() => {
    touchId.current = null;
    setActive(false);
    if (stickRef.current) stickRef.current.style.transform = 'translate(0,0)';
    onChange?.(null);
  }, []);

  return (
    <div
      ref={baseRef}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      className="w-28 h-28 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm touch-none select-none relative"
      style={{ opacity: active ? 1 : 0.6 }}
    >
      <div
        ref={stickRef}
        className="absolute top-1/2 left-1/2 -mt-6 -ml-6 w-12 h-12 rounded-full bg-white/50 border border-white/60"
        style={{ transform: 'translate(-50%,-50%)' }}
      />
    </div>
  );
};

export default VirtualJoystick;
