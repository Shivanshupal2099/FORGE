/**
 * Utility functions for mobile device detection
 * Used to determine if push notifications should be enabled
 */

/**
 * Detect if the current device is a mobile device (Android or iOS)
 * @returns {boolean} true if device is Android or iOS, false otherwise
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // iOS detection
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  
  // Android detection
  const isAndroid = /android/.test(userAgent);
  
  return isIOS || isAndroid;
};

/**
 * Detect if the current device is iOS
 * @returns {boolean} true if device is iOS, false otherwise
 */
export const isIOSDevice = () => {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

/**
 * Detect if the current device is Android
 * @returns {boolean} true if device is Android, false otherwise
 */
export const isAndroidDevice = () => {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
};

/**
 * Get the device type string
 * @returns {string} 'ios', 'android', or 'desktop'
 */
export const getDeviceType = () => {
  if (isIOSDevice()) return 'ios';
  if (isAndroidDevice()) return 'android';
  return 'desktop';
};

/**
 * Check if the browser supports push notifications
 * @returns {boolean} true if push notifications are supported
 */
export const isPushNotificationSupported = () => {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  return 'serviceWorker' in window.navigator && 
         'PushManager' in window &&
         'Notification' in window;
};

/**
 * Check if push notifications are enabled for mobile devices
 * @returns {boolean} true if device is mobile and supports push notifications
 */
export const isPushNotificationEnabled = () => {
  return isMobileDevice() && isPushNotificationSupported();
};
