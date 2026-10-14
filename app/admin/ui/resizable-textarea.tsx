'use client';

import { useEffect, useId, useRef, useState, type TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { compact?: boolean };

/** A full-width resize grip that also works with touch and keyboard input. */
export function ResizableTextarea({ compact = false, id, rows = 6, style, ...props }: Props) {
  const generatedId = useId();
  const areaId = id || generatedId;
  const area = useRef<HTMLTextAreaElement>(null);
  const drag = useRef<{ pointerId: number; y: number; height: number } | null>(null);
  const [height, setHeight] = useState<number>();
  const [measured, setMeasured] = useState(0);
  const [maximum, setMaximum] = useState(compact ? 440 : 960);
  const minimum = compact ? 112 : 144;

  useEffect(() => {
    const element = area.current;
    if (!element) return;
    const observe = new ResizeObserver(() => setMeasured(Math.round(element.getBoundingClientRect().height)));
    observe.observe(element);
    const updateBounds = () => {
      const limit = Math.max(minimum, Math.floor(Math.min(compact ? 440 : 960, window.innerHeight * (compact ? .45 : .7))));
      setMaximum(limit);
      setHeight(current => current === undefined ? current : Math.min(limit, current));
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => { observe.disconnect(); window.removeEventListener('resize', updateBounds); };
  }, [compact, minimum]);

  const resize = (next: number) => setHeight(Math.round(Math.max(minimum, Math.min(maximum, next))));

  return <span className={`resize-textarea${compact ? ' resize-textarea-compact' : ''}`}>
    <textarea {...props} ref={area} id={areaId} rows={rows} style={{ ...style, ...(height === undefined ? {} : { height }) }} />
    <span
      className="textarea-resize-grip"
      role="separator"
      tabIndex={0}
      aria-label="Ubah tinggi kotak teks"
      aria-controls={areaId}
      aria-orientation="horizontal"
      aria-valuemin={minimum}
      aria-valuemax={maximum}
      aria-valuenow={measured || minimum}
      aria-valuetext={`${measured || minimum} piksel`}
      title="Tarik ke bawah atau ke atas. Gunakan tombol panah untuk mengubah tinggi dengan keyboard."
      onClick={event => event.preventDefault()}
      onPointerDown={event => {
        if (event.button !== 0 || !event.isPrimary || !area.current) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { pointerId: event.pointerId, y: event.clientY, height: area.current.getBoundingClientRect().height };
      }}
      onPointerMove={event => {
        const start = drag.current;
        if (start && event.pointerId === start.pointerId) resize(start.height + event.clientY - start.y);
      }}
      onPointerUp={event => {
        if (drag.current?.pointerId !== event.pointerId) return;
        drag.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { drag.current = null; }}
      onLostPointerCapture={() => { drag.current = null; }}
      onKeyDown={event => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const current = area.current?.getBoundingClientRect().height || minimum;
        const step = event.shiftKey ? 96 : 32;
        resize(event.key === 'Home' ? minimum : event.key === 'End' ? maximum : current + (event.key === 'ArrowDown' ? step : -step));
      }}
    ><span aria-hidden="true" className="textarea-resize-lines" /><span aria-hidden="true">Tarik untuk ubah tinggi</span></span>
  </span>;
}
