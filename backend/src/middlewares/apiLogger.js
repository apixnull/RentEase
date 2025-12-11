// file: apiLogger.js
// ============================================================================
// API Request/Response Logger Middleware
// ----------------------------------------------------------------------------
// Logs all API requests and responses for real-time monitoring in admin panel
// ============================================================================

// In-memory storage for API logs (in production, consider using Redis or database)
const apiLogs = {
  logs: [],
  maxLogs: 500, // Keep last 500 logs
};

/**
 * API Logger Middleware
 * Captures request and response data for real-time monitoring
 */
export const apiLogger = (req, res, next) => {
  const startTime = Date.now();
  const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Capture request data
  const requestData = {
    id: logId,
    method: req.method,
    path: req.path,
    url: req.originalUrl || req.url,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
    userId: req.user?.id || null,
    userRole: req.user?.role || null,
    requestBody: null, // Will be set if body exists
    responseStatus: null,
    responseTime: null,
    responseBody: null,
    error: null,
  };

  // Capture request body (excluding sensitive data)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields
    if (sanitizedBody.password) delete sanitizedBody.password;
    if (sanitizedBody.passwordHash) delete sanitizedBody.passwordHash;
    if (sanitizedBody.token) delete sanitizedBody.token;
    requestData.requestBody = sanitizedBody;
  }

  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;

  // Override res.send
  res.send = function (body) {
    captureResponse(this, body, 'send');
    return originalSend.call(this, body);
  };

  // Override res.json
  res.json = function (body) {
    captureResponse(this, body, 'json');
    return originalJson.call(this, body);
  };

  // Override res.end
  res.end = function (chunk, encoding) {
    if (!requestData.responseStatus) {
      captureResponse(this, chunk, 'end');
    }
    return originalEnd.call(this, chunk, encoding);
  };

  function captureResponse(response, body, method) {
    if (requestData.responseStatus) return; // Already captured

    const responseTime = Date.now() - startTime;
    
    requestData.responseStatus = response.statusCode;
    requestData.responseTime = responseTime;

    // Capture response body (limit size for performance)
    if (body) {
      try {
        const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
        // Limit response body to first 500 characters
        requestData.responseBody = bodyStr.length > 500 
          ? bodyStr.substring(0, 500) + '... (truncated)'
          : bodyStr;
      } catch (e) {
        requestData.responseBody = '[Unable to stringify response]';
      }
    }

    // Add to logs
    apiLogs.logs.push({ ...requestData });
    
    // Keep only last maxLogs
    if (apiLogs.logs.length > apiLogs.maxLogs) {
      apiLogs.logs.shift();
    }

    // Log to console in development (similar to multer style)
    if (process.env.NODE_ENV === "development") {
      const statusEmoji = response.statusCode >= 500 ? "❌" : 
                         response.statusCode >= 400 ? "⚠️" : "✅";
      const methodColor = req.method === 'GET' ? '\x1b[36m' : 
                        req.method === 'POST' ? '\x1b[32m' : 
                        req.method === 'PUT' ? '\x1b[33m' : 
                        req.method === 'DELETE' ? '\x1b[31m' : '\x1b[0m';
      const resetColor = '\x1b[0m';
      
      console.log(
        `${statusEmoji} ${methodColor}${req.method}${resetColor} ${req.path} - ${response.statusCode} (${responseTime}ms)`
      );
    }
  }

  // Handle errors
  res.on('error', (error) => {
    requestData.error = error.message;
    requestData.responseStatus = 500;
    requestData.responseTime = Date.now() - startTime;
    
    apiLogs.logs.push({ ...requestData });
    
    if (apiLogs.logs.length > apiLogs.maxLogs) {
      apiLogs.logs.shift();
    }
  });

  next();
};

/**
 * Get API logs
 * Returns recent API request/response logs
 */
export const getApiLogs = (options = {}) => {
  const {
    limit = 100,
    method = null,
    statusCode = null,
    path = null,
    startTime = null,
    endTime = null,
  } = options;

  let filteredLogs = [...apiLogs.logs];

  // Filter by method
  if (method) {
    filteredLogs = filteredLogs.filter(log => log.method === method.toUpperCase());
  }

  // Filter by status code
  if (statusCode) {
    const codes = Array.isArray(statusCode) ? statusCode : [statusCode];
    filteredLogs = filteredLogs.filter(log => codes.includes(log.responseStatus));
  }

  // Filter by path
  if (path) {
    filteredLogs = filteredLogs.filter(log => 
      log.path.includes(path) || log.url.includes(path)
    );
  }

  // Filter by time range
  if (startTime) {
    filteredLogs = filteredLogs.filter(log => 
      new Date(log.timestamp) >= new Date(startTime)
    );
  }
  if (endTime) {
    filteredLogs = filteredLogs.filter(log => 
      new Date(log.timestamp) <= new Date(endTime)
    );
  }

  // Sort by timestamp (newest first) and limit
  filteredLogs.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return filteredLogs.slice(0, limit);
};

/**
 * Clear API logs
 */
export const clearApiLogs = () => {
  apiLogs.logs = [];
};

/**
 * Get log statistics
 */
export const getLogStatistics = () => {
  const logs = apiLogs.logs;
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const recentLogs = logs.filter(log => 
    new Date(log.timestamp).getTime() > oneHourAgo
  );
  const dailyLogs = logs.filter(log => 
    new Date(log.timestamp).getTime() > oneDayAgo
  );

  const methodCounts = {};
  const statusCounts = {};
  const pathCounts = {};
  let totalResponseTime = 0;
  let errorCount = 0;

  logs.forEach(log => {
    methodCounts[log.method] = (methodCounts[log.method] || 0) + 1;
    statusCounts[log.responseStatus] = (statusCounts[log.responseStatus] || 0) + 1;
    pathCounts[log.path] = (pathCounts[log.path] || 0) + 1;
    if (log.responseTime) totalResponseTime += log.responseTime;
    if (log.responseStatus >= 400) errorCount++;
  });

  const avgResponseTime = logs.length > 0 ? totalResponseTime / logs.length : 0;
  const errorRate = logs.length > 0 ? (errorCount / logs.length) * 100 : 0;

  return {
    total: logs.length,
    lastHour: recentLogs.length,
    lastDay: dailyLogs.length,
    methodCounts,
    statusCounts,
    topPaths: Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count })),
    avgResponseTime: Math.round(avgResponseTime),
    errorRate: Math.round(errorRate * 100) / 100,
    errorCount,
  };
};

export default apiLogger;

