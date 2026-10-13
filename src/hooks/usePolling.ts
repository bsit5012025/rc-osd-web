import { useEffect, useRef } from "react";

export function usePolling(callback: () => void | Promise<void>, intervalMs: number) {
    const saved = useRef(callback);

    useEffect(() => {
        saved.current = callback;
    }, [callback]);

    useEffect(() => {
        const tick = () => {
            if (document.visibilityState === "visible") {
                saved.current();
            }
        };

        const id = window.setInterval(tick, intervalMs);
        document.addEventListener("visibilitychange", tick);

        return () => {
            window.clearInterval(id);
            document.removeEventListener("visibilitychange", tick);
        };
    }, [intervalMs]);
}
