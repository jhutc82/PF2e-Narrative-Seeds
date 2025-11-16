/**
 * PF2e Narrative Seeds - Performance Monitor
 * Tracks performance metrics for optimization
 */

/**
 * Performance monitoring and metrics tracking
 */
export class PerformanceMonitor {
  static metrics = {
    generationTimes: [],
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
    dataLoads: []
  };

  static enabled = false;

  /**
   * Enable performance monitoring
   */
  static enable() {
    this.enabled = true;
    console.log("PF2e Narrative Seeds | Performance monitoring enabled");
  }

  /**
   * Disable performance monitoring
   */
  static disable() {
    this.enabled = false;
  }

  /**
   * Measure async function performance
   * @param {string} label - Metric label
   * @param {Function} fn - Async function to measure
   * @returns {Promise<*>} Function result
   */
  static async measureAsync(label, fn) {
    if (!this.enabled) {
      return await fn();
    }

    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      return result;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Measure sync function performance
   * @param {string} label - Metric label
   * @param {Function} fn - Sync function to measure
   * @returns {*} Function result
   */
  static measure(label, fn) {
    if (!this.enabled) {
      return fn();
    }

    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      return result;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Record a metric
   * @param {string} label - Metric label
   * @param {number} duration - Duration in milliseconds
   */
  static recordMetric(label, duration) {
    if (!this.metrics[label]) {
      this.metrics[label] = [];
    }
    this.metrics[label].push(duration);

    // Keep only last 100 entries per metric
    if (this.metrics[label].length > 100) {
      this.metrics[label].shift();
    }

    // Log if slow (>100ms)
    if (duration > 100) {
      console.warn(`PF2e Narrative Seeds | Slow ${label}: ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Record cache hit
   */
  static recordCacheHit() {
    if (this.enabled) {
      this.metrics.cacheHits++;
    }
  }

  /**
   * Record cache miss
   */
  static recordCacheMiss() {
    if (this.enabled) {
      this.metrics.cacheMisses++;
    }
  }

  /**
   * Get performance report
   * @returns {Object} Performance statistics
   */
  static getReport() {
    const avg = arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const max = arr => arr.length > 0 ? Math.max(...arr) : 0;
    const min = arr => arr.length > 0 ? Math.min(...arr) : 0;

    const report = {
      cacheHitRate: this.getCacheHitRate(),
      totalErrors: this.metrics.errors,
      metrics: {}
    };

    // Add stats for each metric
    for (const [label, values] of Object.entries(this.metrics)) {
      if (Array.isArray(values) && values.length > 0) {
        report.metrics[label] = {
          avg: avg(values).toFixed(2) + 'ms',
          min: min(values).toFixed(2) + 'ms',
          max: max(values).toFixed(2) + 'ms',
          count: values.length
        };
      }
    }

    return report;
  }

  /**
   * Get cache hit rate
   * @returns {string} Hit rate percentage
   */
  static getCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (total === 0) return 'N/A';
    return ((this.metrics.cacheHits / total) * 100).toFixed(1) + '%';
  }

  /**
   * Print report to console
   */
  static printReport() {
    const report = this.getReport();
    console.log("=".repeat(60));
    console.log("PF2e Narrative Seeds - Performance Report");
    console.log("=".repeat(60));
    console.log(`Cache Hit Rate: ${report.cacheHitRate}`);
    console.log(`Total Errors: ${report.totalErrors}`);
    console.log("\nMetrics:");
    for (const [label, stats] of Object.entries(report.metrics)) {
      console.log(`  ${label}:`);
      console.log(`    Average: ${stats.avg}`);
      console.log(`    Min: ${stats.min}`);
      console.log(`    Max: ${stats.max}`);
      console.log(`    Count: ${stats.count}`);
    }
    console.log("=".repeat(60));
  }

  /**
   * Reset all metrics
   */
  static reset() {
    this.metrics = {
      generationTimes: [],
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      dataLoads: []
    };
    console.log("PF2e Narrative Seeds | Performance metrics reset");
  }
}
