// frontend/src/hooks/useNotifications.js
// EduVibe - Real-time Notification Hook using WebSocket
// 2026 Professional Standard

import { useEffect, useRef, useState, useCallback } from 'react';

// Uses env variable — wss for production, ws for local
const WS_BASE = import.meta.env.VITE_WS_URL || 'wss://eduvibe-backend.onrender.com';

export function useNotifications(isAuthenticated) {
  const [unreadCount, setUnreadCount]     = useState(0);
  const [toasts, setToasts]               = useState([]); // live popup toasts
  const [isConnected, setIsConnected]     = useState(false);
  const wsRef                             = useRef(null);
  const reconnectRef                      = useRef(null);
  const reconnectDelay                    = useRef(1000); // starts at 1s, grows

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) return;

    // Prevent double-connecting
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_BASE}/ws/notifications/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectDelay.current = 1000; // reset backoff on success
      console.log('🔔 [EduVibe] Notifications WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'unread_count') {
          setUnreadCount(data.count);
        }

        if (data.type === 'new_notification') {
          // Increment badge
          setUnreadCount(prev => prev + 1);

          // Add to toast queue (auto-remove after 5s)
          const id = Date.now();
          setToasts(prev => [...prev, { id, title: data.title, message: data.message }]);
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
          }, 5000);

          // Browser-level push notification (if permission granted)
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (window.Notification.permission === 'granted') {
              new window.Notification(data.title, {
                body: data.message,
                icon: '/favicon.ico',
              });
            }
          }
        }
      } catch (err) {
        console.error('[EduVibe WS] Message parse error:', err);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (!event.wasClean && isAuthenticated) {
        // Exponential backoff reconnect (max 30s)
        const delay = Math.min(reconnectDelay.current, 30000);
        reconnectDelay.current = delay * 2;
        console.log(`🔄 [EduVibe] WS reconnecting in ${delay / 1000}s...`);
        reconnectRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();

      // Request browser notification permission once
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (window.Notification.permission === 'default') {
          window.Notification.requestPermission();
        }
      }
    }

    return () => {
      clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [isAuthenticated, connect]);

  const markAllRead = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'mark_read' }));
      setUnreadCount(0);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { unreadCount, toasts, isConnected, markAllRead, dismissToast };
}