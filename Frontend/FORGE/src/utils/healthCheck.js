import axios from '../api/axios';

let healthCheckInterval = null;
let isRunning = false;

/**
 * Health check utility to keep the backend server awake
 * This is useful for free-tier hosting services like Render that spin down inactive servers
 */

/**
 * Perform a single health check request to the backend
 */
const performHealthCheck = async () => {
  try {
    // Use the /healthz endpoint which is lightweight and doesn't require auth
    const response = await axios.get('/healthz', {
      timeout: 5000, // 5 second timeout for health check
      // Skip caching for health checks
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    
    if (response.status === 200) {
      console.log('[HealthCheck] Server is healthy:', response.data);
      return true;
    }
    return false;
  } catch (error) {
    // Don't log errors in production to avoid console spam
    if (import.meta.env.DEV) {
      console.warn('[HealthCheck] Health check failed:', error.message);
    }
    return false;
  }
};

/**
 * Start the periodic health check
 * @param {number} intervalMs - Interval in milliseconds (default: 5 minutes)
 */
export const startHealthCheck = (intervalMs = 5 * 60 * 1000) => {
  // Don't start if already running
  if (isRunning) {
    console.warn('[HealthCheck] Already running');
    return;
  }

  // Use environment variable if available
  const envInterval = import.meta.env.VITE_HEALTH_CHECK_INTERVAL;
  const interval = envInterval ? parseInt(envInterval, 10) : intervalMs;

  // Validate interval (minimum 1 minute to avoid excessive requests)
  const finalInterval = Math.max(interval, 60 * 1000);

  console.log(`[HealthCheck] Starting with interval: ${finalInterval / 1000} seconds`);

  // Perform initial health check
  performHealthCheck();

  // Set up periodic health checks
  healthCheckInterval = setInterval(() => {
    performHealthCheck();
  }, finalInterval);

  isRunning = true;
};

/**
 * Stop the periodic health check
 */
export const stopHealthCheck = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    isRunning = false;
    console.log('[HealthCheck] Stopped');
  }
};

/**
 * Check if health check is currently running
 */
export const isHealthCheckRunning = () => {
  return isRunning;
};

/**
 * Perform a one-time health check (for manual triggering)
 */
export const checkHealth = performHealthCheck;

export default {
  startHealthCheck,
  stopHealthCheck,
  isHealthCheckRunning,
  checkHealth,
};
