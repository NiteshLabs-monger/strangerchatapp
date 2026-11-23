import  { useEffect, useState } from 'react';

export function SmoothCountUp({ value, duration = 500 }: { value: number; duration?: number }) {
    const [current, setCurrent] = useState(value);

    useEffect(() => {
        const start = current;
        const end = value;
        if (start === end) return;

        const startTime = performance.now();

        const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease-out curve so it slows down near the target number
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.round(start + (end - start) * eased));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }, [value, duration]);

    return <span className="tabular-nums font-semibold">{current}</span>;
}