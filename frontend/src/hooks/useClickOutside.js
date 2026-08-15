import { useEffect } from 'react';

export function useClickOutside(ref, handler, ignoreRef = null) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      if (ignoreRef && ignoreRef.current && ignoreRef.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler, ignoreRef]);
}