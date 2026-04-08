import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle debounced auto-saving of state.
 * 
 * FIX: `onSave` is stabilized via a `useRef` so the `useEffect` dependency
 * array only contains `data` and `delay`. Without this, a new inline arrow
 * function passed as `onSave` on every render would cause the effect to fire
 * on every render, defeating the debounce entirely and causing a near-infinite
 * save loop + Zustand writes.
 *
 * @param data  The state object to monitor.
 * @param onSave Callback function to execute the save logic.
 * @param delay Time in milliseconds to wait before triggering the save.
 */
export function useAutoSave<T>(data: T, onSave: (data: T) => void, delay = 1000) {
  // Always hold the latest version of the callback without re-triggering the effect.
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSaveRef.current(data);
    }, delay);
    // Proper cleanup: cancel pending save when data changes before delay elapses.
    return () => clearTimeout(timer);
  }, [data, delay]); // `onSave` intentionally omitted — held via ref above.
}
