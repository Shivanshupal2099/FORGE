import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import {
  isMobileDevice,
  isPushNotificationSupported,
  getDeviceType
} from '../utils/mobileDetection';

/**
 * Hook for managing push notifications
 * Only works on mobile devices (Android/iOS)
 */
export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if push notifications are supported and device is mobile
  useEffect(() => {
    const mobile = isMobileDevice();
    const supported = isPushNotificationSupported();
    
    setIsMobile(mobile);
    setIsSupported(supported && mobile);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are only supported on mobile devices (Android/iOS)');
      return false;
    }

    if (!('Notification' in window)) {
      setError('This browser does not support notifications');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Automatically subscribe after permission is granted
        await subscribe();
        return true;
      } else if (result === 'denied') {
        setError('Notification permission was denied');
        return false;
      }
      
      return result === 'granted';
    } catch (err) {
      setError('Failed to request notification permission');
      console.error('Error requesting notification permission:', err);
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      setError('Push notifications not supported or permission not granted');
      return false;
    }

    if (!user?.email) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: await getVapidPublicKey()
      });

      // Send subscription to backend
      await axios.post('/api/push/subscribe', {
        subscription: pushSubscription.toJSON(),
        user_agent: navigator.userAgent
      });

      setSubscription(pushSubscription);
      return true;
    } catch (err) {
      setError('Failed to subscribe to push notifications');
      console.error('Error subscribing to push notifications:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, user]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription) {
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Send unsubscribe request to backend
      await axios.post('/api/push/unsubscribe', {
        endpoint: subscription.endpoint
      });

      // Unsubscribe from push manager
      await subscription.unsubscribe();
      setSubscription(null);
      return true;
    } catch (err) {
      setError('Failed to unsubscribe from push notifications');
      console.error('Error unsubscribing from push notifications:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  // Get VAPID public key from backend
  const getVapidPublicKey = useCallback(async () => {
    try {
      const response = await axios.get('/api/push/vapid-public-key');
      return urlBase64ToUint8Array(response.data.publicKey);
    } catch (err) {
      setError('Failed to get VAPID public key');
      console.error('Error getting VAPID public key:', err);
      throw err;
    }
  }, []);

  // Auto-subscribe on mount if permission is already granted
  useEffect(() => {
    if (isSupported && permission === 'granted' && user?.email && !subscription) {
      subscribe();
    }
  }, [isSupported, permission, user, subscription, subscribe]);

  return {
    isSupported,
    isMobile,
    permission,
    subscription,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    deviceType: getDeviceType()
  };
};

// Helper function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
