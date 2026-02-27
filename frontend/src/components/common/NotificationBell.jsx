// frontend/src/components/common/NotificationBell.jsx


import { useState, useEffect, useRef, useCallback } from 'react';
import { HiBell, HiX, HiCheckCircle } from 'react-icons/hi';
import { studentAPI, teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── WebSocket base URL (set in .env) ───────────────────────────────────────
const WS_BASE = import.meta.env.VITE_WS_URL || 'wss://eduvibe-backend.onrender.com';

export default function NotificationBell() {
  const { user }                              = useAuth();
  const navigate                              = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [notifications, setNotifications]     = useState([]);
  const [unreadCount, setUnreadCount]         = useState(0);
  const [open, setOpen]                       = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [wsConnected, setWsConnected]         = useState(false);
  const [toasts, setToasts]                   = useState([]); // live push popups

  // ── Refs ─────────────────────────────────────────────────────────────────
  const dropdownRef     = useRef(null);
  const wsRef           = useRef(null);
  const reconnectRef    = useRef(null);
  const reconnectDelay  = useRef(1000); // exponential backoff starts at 1s

  // ── Pick correct API based on role ───────────────────────────────────────
  const api = user?.role === 'teacher' ? teacherAPI
            : user?.role === 'student' ? studentAPI
            : null;

  // ═════════════════════════════════════════════════════════════════════════
  //  REST API — fetch notifications (your original logic, unchanged)
  // ═════════════════════════════════════════════════════════════════════════
  const fetchNotifications = useCallback(async () => {
    if (!api) return;
    try {
      const res  = await api.getNotifications();
      const data = res.data?.notifications || [];
      setNotifications(data);
      setUnreadCount(res.data?.unread_count || 0);
    } catch {
      // Silently fail — don't crash dashboard
    }
  }, [api]);

  // ═════════════════════════════════════════════════════════════════════════
  //  WEBSOCKET — real-time push layer
  // ═════════════════════════════════════════════════════════════════════════
  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    // Don't open a second connection if already open
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_BASE}/ws/notifications/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      reconnectDelay.current = 1000; // reset backoff on successful connect
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // ── Server pushed unread count (sent on connect) ──────────────
        if (data.type === 'unread_count') {
          setUnreadCount(data.count);
        }

        // ── New real-time notification arrived ────────────────────────
        if (data.type === 'new_notification') {
          // 1. Bump unread badge
          setUnreadCount(prev => prev + 1);

          // 2. Prepend to notification list instantly
          const newNotif = {
            id:         data.notification_id || Date.now(),
            title:      data.title,
            message:    data.message,
            is_read:    false,
            created_at: data.created_at
              ? new Date(data.created_at).toLocaleString('en-IN', {
                  hour: '2-digit', minute: '2-digit',
                  day: '2-digit',  month: 'short',
                })
              : 'Just now',
          };
          setNotifications(prev => [newNotif, ...prev].slice(0, 50));

          // 3. Show floating toast popup (auto-dismiss in 5s)
          const toastId = Date.now();
          setToasts(prev => [...prev, { id: toastId, title: data.title, message: data.message }]);
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toastId));
          }, 5000);

          // 4. Browser-level notification (if user allowed)
          if ('Notification' in window && window.Notification.permission === 'granted') {
            new window.Notification(data.title, {
              body: data.message,
              icon: '/favicon.ico',
            });
          }
        }
      } catch (err) {
        console.error('[EduVibe WS] Parse error:', err);
      }
    };

    ws.onclose = (event) => {
      setWsConnected(false);
      // Auto-reconnect with exponential backoff (max 30s)
      if (!event.wasClean && user) {
        const delay = Math.min(reconnectDelay.current, 30000);
        reconnectDelay.current = delay * 2;
        reconnectRef.current = setTimeout(connectWebSocket, delay);
      }
    };

    ws.onerror = () => {
      ws.close(); // triggers onclose → reconnect
    };
  }, [user]);

  // ═════════════════════════════════════════════════════════════════════════
  //  EFFECTS
  // ═════════════════════════════════════════════════════════════════════════

  // Initial fetch + 30s polling (your original logic, preserved as fallback)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // WebSocket connect on mount, disconnect on unmount
  useEffect(() => {
    connectWebSocket();

    // Request browser notification permission once
    if ('Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }

    return () => {
      clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connectWebSocket]);

  // Close dropdown on outside click (your original logic, unchanged)
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ═════════════════════════════════════════════════════════════════════════
  //  ACTIONS (your original logic, unchanged)
  // ═════════════════════════════════════════════════════════════════════════

  const markRead = async (id) => {
    if (!api) return;
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    if (!api) return;
    try {
      setLoading(true);
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      // Also tell WebSocket server so count stays in sync
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'mark_read' }));
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  // Your original navigate-on-click logic, unchanged
  const handleNotifClick = (n) => {
    if (!n.is_read) markRead(n.id);
    setOpen(false);
    if (n.title?.includes('Doubt') || n.title?.includes('Reply')) {
      navigate(user?.role === 'teacher' ? '/teacher/doubts' : '/student/doubts');
    }
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          FLOATING TOAST POPUPS  (bottom-right, appear on live WS push)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 max-w-sm w-full
                       bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
                       border border-gray-100 dark:border-gray-700 p-4
                       animate-slide-up"
          >
            {/* Icon */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500
                            flex items-center justify-center shrink-0">
              <HiBell className="w-4 h-4 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {toast.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                {toast.message}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-gray-400 hover:text-gray-600
                         dark:hover:text-gray-200 transition-colors"
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BELL BUTTON + DROPDOWN
      ══════════════════════════════════════════════════════════════════ */}
      <div className="relative" ref={dropdownRef}>

        {/* ── Bell Button ─────────────────────────────────────────────── */}
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Notifications"
        >
          <HiBell className="w-6 h-6" />

          {/* Unread badge (your original) */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white
                             text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}

          {/* Live green dot — shows WebSocket is connected */}
          {wsConnected && (
            <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-green-400
                             rounded-full ring-1 ring-white dark:ring-gray-900" />
          )}
        </button>

        {/* ── Dropdown ────────────────────────────────────────────────── */}
        {open && (
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800
                          rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700
                          z-50 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3
                            border-b border-gray-200 dark:border-gray-700
                            bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <HiBell className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30
                                   text-red-600 dark:text-red-400 text-xs
                                   rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Live / Offline pill */}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${wsConnected
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {wsConnected ? '● Live' : '○ Offline'}
                </span>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    disabled={loading}
                    className="text-xs text-indigo-600 dark:text-indigo-400
                               hover:underline font-medium disabled:opacity-50
                               flex items-center gap-1"
                  >
                    <HiCheckCircle className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notification List (your original logic, unchanged) */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <HiBell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`px-4 py-3 cursor-pointer transition-colors
                        hover:bg-gray-50 dark:hover:bg-gray-700/50
                        ${!n.is_read
                          ? 'bg-indigo-50 dark:bg-indigo-900/20'
                          : 'bg-white dark:bg-gray-800'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread dot */}
                        <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0
                          ${!n.is_read
                            ? 'bg-indigo-500'
                            : 'bg-gray-200 dark:bg-gray-600'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400
                                        mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            🕐 {n.created_at}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700
                              bg-gray-50 dark:bg-gray-900 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing last {notifications.length} notifications
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}














// import { useState, useEffect, useRef } from 'react';
// import { HiBell } from 'react-icons/hi';
// import { studentAPI, teacherAPI } from '../../services/api';
// import { useAuth } from '../../context/AuthContext';
// import { useNavigate } from 'react-router-dom';

// export default function NotificationBell() {
//   const { user } = useAuth();
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount]     = useState(0);
//   const [open, setOpen]                   = useState(false);
//   const [loading, setLoading]             = useState(false);
//   const dropdownRef = useRef();
//   const navigate = useNavigate();

// //   const api = user?.role === 'teacher' ? teacherAPI : studentAPI;
// const getAPI = () => {
//   if (user?.role === 'teacher') return teacherAPI;
//   if (user?.role === 'student') return studentAPI;
//   return null;
// };
// const api = getAPI();

//   // Fetch on mount + every 30 seconds
//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // Close on outside click
//   useEffect(() => {
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const res = await api.getNotifications();
//       const data = res.data?.notifications || [];
//       setNotifications(data);
//       setUnreadCount(res.data?.unread_count || 0);
//     } catch {
//       // Silently fail — don't crash dashboard
//     }
//   };

//   const markRead = async (id) => {
//     try {
//       await api.markNotificationRead(id);
//       setNotifications(prev =>
//         prev.map(n => n.id === id ? { ...n, is_read: true } : n)
//       );
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch { /* ignore */ }
//   };

//   const markAllRead = async () => {
//     try {
//       setLoading(true);
//       await api.markAllNotificationsRead();
//       setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//     } catch { /* ignore */ }
//     finally { setLoading(false); }
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>

//       {/* ── Bell Button ── */}
//       <button
//         onClick={() => setOpen(!open)}
//         className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300
//                    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//         title="Notifications"
//       >
//         <HiBell className="w-6 h-6" />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white
//                            text-xs rounded-full flex items-center justify-center font-bold">
//             {unreadCount > 9 ? '9+' : unreadCount}
//           </span>
//         )}
//       </button>

//       {/* ── Dropdown ── */}
//       {open && (
//         <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800
//                         rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700
//                         z-50 overflow-hidden">

//           {/* Header */}
//           <div className="flex items-center justify-between px-4 py-3
//                           border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
//             <div className="flex items-center gap-2">
//               <HiBell className="w-5 h-5 text-indigo-500" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
//               {unreadCount > 0 && (
//                 <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30
//                                  text-red-600 dark:text-red-400 text-xs rounded-full font-medium">
//                   {unreadCount} new
//                 </span>
//               )}
//             </div>
//             {unreadCount > 0 && (
//               <button
//                 onClick={markAllRead}
//                 disabled={loading}
//                 className="text-xs text-indigo-600 dark:text-indigo-400
//                            hover:underline font-medium disabled:opacity-50"
//               >
//                 Mark all read
//               </button>
//             )}
//           </div>

//           {/* List */}
//           <div className="max-h-96 overflow-y-auto">
//             {notifications.length === 0 ? (
//               <div className="px-4 py-12 text-center">
//                 <HiBell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-500 dark:text-gray-400 text-sm">
//                   No notifications yet
//                 </p>
//               </div>
//             ) : (
//               <div className="divide-y divide-gray-100 dark:divide-gray-700">
//                 {notifications.map(n => (
//                   <div
//                     key={n.id}
//                     // onClick={() => !n.is_read && markRead(n.id)}
//                     // onClick={() => {
//                     // if (!n.is_read) markRead(n.id);
//                     // setOpen(false);
//                     // // navigate based on notification type
//                     // if (n.title.includes('Doubt') || n.title.includes('Reply')) {
//                     // navigate('/student/doubts'); // ← your actual path here
//                     // }
//                     // }}
//                     onClick={() => {
//                     if (!n.is_read) markRead(n.id);
//                     setOpen(false);
//                     if (n.title.includes('Doubt') || n.title.includes('Reply')) {
//                     if (user?.role === 'teacher') {
//                     navigate('/teacher/doubts');
//                     } else {
//                     navigate('/student/doubts');
//                     }
//                     }
//                     }}
//                     className={`px-4 py-3 cursor-pointer transition-colors
//                       hover:bg-gray-50 dark:hover:bg-gray-700/50
//                       ${!n.is_read
//                         ? 'bg-indigo-50 dark:bg-indigo-900/20'
//                         : 'bg-white dark:bg-gray-800'
//                       }`}
//                   >
//                     <div className="flex items-start gap-3">
//                       {/* Unread indicator */}
//                       <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0
//                         ${!n.is_read ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-600'}`}
//                       />
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                           {n.title}
//                         </p>
//                         <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
//                           {n.message}
//                         </p>
//                         <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
//                           🕐 {n.created_at}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           {notifications.length > 0 && (
//             <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700
//                             bg-gray-50 dark:bg-gray-900 text-center">
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Showing last {notifications.length} notifications
//               </p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }