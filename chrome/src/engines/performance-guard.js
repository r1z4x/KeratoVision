/**
 * PerformanceGuard
 *
 * Utility to ensure CSS injection stays within performance budget.
 * - Debounces rapid config changes
 * - Measures injection time and warns if > 16ms (one frame)
 * - Provides a guard wrapper for safe execution
 */

const PerformanceGuard = {
    /** @type {Map<string, number>} */
    _timers: new Map(),

    /** @type {Map<string, ReturnType<typeof setTimeout>>} */
    _debounceTimers: new Map(),

    /**
     * Debounce a function call.
     * @param {string} key - Unique identifier for this debounce
     * @param {Function} fn - Function to execute
     * @param {number} [delay=200] - Delay in ms
     */
    debounce(key, fn, delay = 200) {
        const existing = PerformanceGuard._debounceTimers.get(key);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
            PerformanceGuard._debounceTimers.delete(key);
            fn();
        }, delay);

        PerformanceGuard._debounceTimers.set(key, timer);
    },

    /**
     * Execute a function with performance measurement.
     * Logs a warning if execution exceeds 16ms (one frame budget).
     * @param {string} label - Label for the measurement
     * @param {Function} fn - Function to execute
     * @returns {*} Return value of fn
     */
    guard(label, fn) {
        const start = performance.now();
        const result = fn();
        const elapsed = performance.now() - start;

        if (elapsed > 16) {
            console.warn(
                `[KeratoVision] ⚠️ Performance warning: "${label}" took ${elapsed.toFixed(2)}ms (budget: 16ms)`
            );
        }

        return result;
    },

    /**
     * Start a named timer.
     * @param {string} label
     */
    startTimer(label) {
        PerformanceGuard._timers.set(label, performance.now());
    },

    /**
     * End a named timer and return elapsed ms.
     * @param {string} label
     * @returns {number} Elapsed time in ms
     */
    endTimer(label) {
        const start = PerformanceGuard._timers.get(label);
        PerformanceGuard._timers.delete(label);
        if (start === undefined) return 0;
        return performance.now() - start;
    },
};
