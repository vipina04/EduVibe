import { useState, useEffect, useRef } from 'react';
import { HiBell } from 'react-icons/hi';
import { studentAPI, teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const api = user?.role === 'teacher' ? teacherAPI : studentAPI;

  // Fetch on mount + every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      const data = res.data?.notifications || [];
      setNotifications(data);
      setUnreadCount(res.data?.unread_count || 0);
    } catch {
      // Silently fail — don't crash dashboard
    }
  };

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      setLoading(true);
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div className="relative" ref={dropdownRef}>

      {/* ── Bell Button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300
                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Notifications"
      >
        <HiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white
                           text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800
                        rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700
                        z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <HiBell className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30
                                 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="text-xs text-indigo-600 dark:text-indigo-400
                           hover:underline font-medium disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
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
                    // onClick={() => !n.is_read && markRead(n.id)}
                    // onClick={() => {
                    // if (!n.is_read) markRead(n.id);
                    // setOpen(false);
                    // // navigate based on notification type
                    // if (n.title.includes('Doubt') || n.title.includes('Reply')) {
                    // navigate('/student/doubts'); // ← your actual path here
                    // }
                    // }}
                    onClick={() => {
                    if (!n.is_read) markRead(n.id);
                    setOpen(false);
                    if (n.title.includes('Doubt') || n.title.includes('Reply')) {
                    if (user?.role === 'teacher') {
                    navigate('/teacher/doubts');
                    } else {
                    navigate('/student/doubts');
                    }
                    }
                    }}
                    className={`px-4 py-3 cursor-pointer transition-colors
                      hover:bg-gray-50 dark:hover:bg-gray-700/50
                      ${!n.is_read
                        ? 'bg-indigo-50 dark:bg-indigo-900/20'
                        : 'bg-white dark:bg-gray-800'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread indicator */}
                      <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0
                        ${!n.is_read ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
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
  );
}