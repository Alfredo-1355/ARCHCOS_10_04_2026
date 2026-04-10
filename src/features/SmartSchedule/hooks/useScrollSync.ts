import { useRef, useCallback } from 'react';

/**
 * Custom hook to synchronize the vertical scrolling of two independent DOM elements.
 * Uses native DOM events to bypass React render cycles for 60 FPS performance.
 */
export const useScrollSync = () => {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);
    const isSyncing = useRef(false);

    const onRightScroll = useCallback(() => {
        if (isSyncing.current) return;
        
        if (leftRef.current && rightRef.current) {
            isSyncing.current = true;
            leftRef.current.scrollTop = rightRef.current.scrollTop;
            
            // Allow next animation frame to clear flag
            requestAnimationFrame(() => {
                isSyncing.current = false;
            });
        }
    }, []);

    const onLeftScroll = useCallback(() => {
        if (isSyncing.current) return;
        
        if (leftRef.current && rightRef.current) {
            isSyncing.current = true;
            rightRef.current.scrollTop = leftRef.current.scrollTop;
            
            requestAnimationFrame(() => {
                isSyncing.current = false;
            });
        }
    }, []);

    return { leftRef, rightRef, onRightScroll, onLeftScroll };
};
