// file: performanceMonitor.js
// ============================================================================
// Performance Monitoring Middleware
// ----------------------------------------------------------------------------
// Tracks API response times, logs slow queries, monitors request rates,
// and tracks error rates for system performance analysis
// ============================================================================

// In-memory storage for performance metrics (in production, consider using Redis)
const performanceMetrics = {
  requests: [],
  slowQueries: [],
  errorCounts: {},
  endpointStats: {},
  maxRequestsHistory: 1000, // Keep last 1000 requests
  maxSlowQueries: 100, // Keep last 100 slow queries
};

/**
 * Performance monitoring middleware
 * Tracks response times, slow queries, and error rates
 */
export const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const endpoint = `${req.method} ${req.path}`;

  // Track original end function
  const originalEnd = res.end;

  // Override end function to capture response time
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;

    // Record request metrics
    const requestMetric = {
      endpoint,
      method: req.method,
      path: req.path,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress,
    };

    // Add to requests history
    performanceMetrics.requests.push(requestMetric);
    if (performanceMetrics.requests.length > performanceMetrics.maxRequestsHistory) {
      performanceMetrics.requests.shift();
    }

    // Track slow queries (>500ms)
    if (responseTime > 500) {
      performanceMetrics.slowQueries.push(requestMetric);
      if (performanceMetrics.slowQueries.length > performanceMetrics.maxSlowQueries) {
        performanceMetrics.slowQueries.shift();
      }

      // Log slow queries in development
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `⚠️ Slow query detected: ${endpoint} - ${responseTime}ms (Status: ${res.statusCode})`
        );
      }
    }

    // Track error rates
    if (res.statusCode >= 400) {
      if (!performanceMetrics.errorCounts[endpoint]) {
        performanceMetrics.errorCounts[endpoint] = 0;
      }
      performanceMetrics.errorCounts[endpoint]++;

      // Log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error(
          `❌ Error: ${endpoint} - ${responseTime}ms (Status: ${res.statusCode})`
        );
      }
    }

    // Update endpoint statistics
    if (!performanceMetrics.endpointStats[endpoint]) {
      performanceMetrics.endpointStats[endpoint] = {
        count: 0,
        totalResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        errorCount: 0,
      };
    }

    const stats = performanceMetrics.endpointStats[endpoint];
    stats.count++;
    stats.totalResponseTime += responseTime;
    stats.minResponseTime = Math.min(stats.minResponseTime, responseTime);
    stats.maxResponseTime = Math.max(stats.maxResponseTime, responseTime);

    if (res.statusCode >= 400) {
      stats.errorCount++;
    }

    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Get performance metrics
 * Returns aggregated performance data for analysis
 */
export const getPerformanceMetrics = () => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Filter recent requests
  const recentRequests = performanceMetrics.requests.filter(
    (req) => new Date(req.timestamp).getTime() > oneHourAgo
  );
  const dailyRequests = performanceMetrics.requests.filter(
    (req) => new Date(req.timestamp).getTime() > oneDayAgo
  );

  // Calculate average response times
  const avgResponseTime =
    recentRequests.length > 0
      ? recentRequests.reduce((sum, req) => sum + req.responseTime, 0) /
        recentRequests.length
      : 0;

  // Calculate error rate
  const errorCount = recentRequests.filter((req) => req.statusCode >= 400).length;
  const errorRate = recentRequests.length > 0 ? (errorCount / recentRequests.length) * 100 : 0;

  // Get top slow endpoints
  const slowEndpoints = Object.entries(performanceMetrics.endpointStats)
    .map(([endpoint, stats]) => ({
      endpoint,
      avgResponseTime: stats.count > 0 ? stats.totalResponseTime / stats.count : 0,
      count: stats.count,
      errorRate: stats.count > 0 ? (stats.errorCount / stats.count) * 100 : 0,
    }))
    .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
    .slice(0, 10);

  return {
    summary: {
      totalRequests: {
        lastHour: recentRequests.length,
        lastDay: dailyRequests.length,
        allTime: performanceMetrics.requests.length,
      },
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      slowQueriesCount: performanceMetrics.slowQueries.length,
    },
    slowEndpoints,
    recentSlowQueries: performanceMetrics.slowQueries.slice(-10),
    errorCounts: performanceMetrics.errorCounts,
  };
};

/**
 * Clear performance metrics
 * Useful for testing or periodic cleanup
 */
export const clearPerformanceMetrics = () => {
  performanceMetrics.requests = [];
  performanceMetrics.slowQueries = [];
  performanceMetrics.errorCounts = {};
  performanceMetrics.endpointStats = {};
};

export default performanceMonitor;

