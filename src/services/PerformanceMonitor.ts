// Performance monitoring and optimization service
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private loadStartTime: number = performance.now();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track page load performance
  trackPageLoad(pageName: string) {
    const loadTime = performance.now() - this.loadStartTime;
    this.recordMetric(`page_load_${pageName}`, loadTime);
    
    // Log if load time is concerning (>2s)
    if (loadTime > 2000) {
      console.warn(`Slow page load detected: ${pageName} took ${loadTime.toFixed(2)}ms`);
    }
  }

  // Track API response times
  trackAPICall(endpoint: string, duration: number) {
    this.recordMetric(`api_${endpoint}`, duration);
    
    // Log slow API calls (>1s)
    if (duration > 1000) {
      console.warn(`Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
  }

  // Track component render times
  trackComponentRender(componentName: string, renderTime: number) {
    this.recordMetric(`render_${componentName}`, renderTime);
    
    // Log slow renders (>100ms)
    if (renderTime > 100) {
      console.warn(`Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  // Record metric with moving average
  private recordMetric(key: string, value: number) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const values = this.metrics.get(key)!;
    values.push(value);
    
    // Keep only last 10 values for moving average
    if (values.length > 10) {
      values.shift();
    }
    
    this.metrics.set(key, values);
  }

  // Get performance report
  getPerformanceReport(): Record<string, { avg: number; latest: number; count: number }> {
    const report: Record<string, { avg: number; latest: number; count: number }> = {};
    
    this.metrics.forEach((values, key) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const latest = values[values.length - 1];
      report[key] = { avg, latest, count: values.length };
    });
    
    return report;
  }

  // Check if performance is degraded
  isPerformanceDegraded(): boolean {
    const report = this.getPerformanceReport();
    
    // Check for concerning metrics
    for (const [key, metrics] of Object.entries(report)) {
      if (key.startsWith('page_load_') && metrics.avg > 3000) return true;
      if (key.startsWith('api_') && metrics.avg > 2000) return true;
      if (key.startsWith('render_') && metrics.avg > 200) return true;
    }
    
    return false;
  }
}

// React hook for performance tracking
export const usePerformanceTracking = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  const trackRender = () => {
    const startTime = performance.now();
    return () => {
      const renderTime = performance.now() - startTime;
      monitor.trackComponentRender(componentName, renderTime);
    };
  };
  
  const trackAPI = async <T>(
    promise: Promise<T>, 
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await promise;
      const duration = performance.now() - startTime;
      monitor.trackAPICall(endpoint, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      monitor.trackAPICall(`${endpoint}_error`, duration);
      throw error;
    }
  };
  
  return { trackRender, trackAPI };
};
