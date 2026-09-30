import {useEffect, useRef, useState} from 'react';

/** Tracks an element's rendered width so SVG charts can draw at true pixel size (crisp, constant font size). */
export function useElementWidth<T extends HTMLElement>(fallback = 600) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = () => setWidth(Math.max(240, Math.round(element.getBoundingClientRect().width)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return {ref, width};
}
