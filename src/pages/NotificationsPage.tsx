import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/storage';
import { Notification, Profile } from '../types';
import { formatDateTime } from '../lib/utils';
import { Button } from '../components/common/Button';
import { 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Calendar,
  Trash2
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Profile>(db.getCurrentUser());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterUnread, setFilterUnread] = useState(false);

  const loadNotifications = () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    setNotifications(db.getNotificationsForUser(user.id));
  };

  useEffect(() => {
    loadNotifications();
    const unsub = db.subscribe(loadNotifications);
    return () => unsub();
  }, []);

  const displayedNotifications = filterUnread
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleNotificationClick = (n: Notification) => {
    db.markNotificationAsRead(n.id);
    if (n.related_match_id) {
      navigate(`/match-results/${n.related_report_id || ''}`);
    } else if (n.related_claim_id) {
      navigate('/claims');
    } else if (n.related_report_id) {
      navigate(`/item/${n.related_report_id}`);
    }
  };

  const getIcon = (type: Notification['notification_type']) => {
    switch (type) {
      case 'match_detected':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'claim_received':
      case 'claim_status_updated':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'handover_scheduled':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      case 'recovery_confirmed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">Notifications Center</h1>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            Real-time notifications dispatched by the Coordinator Agent and campus staff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilterUnread(!filterUnread)}
          >
            {filterUnread ? 'Show All' : 'Unread Only'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => db.markAllNotificationsAsRead(currentUser.id)}
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      {displayedNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-brand-border shadow-card space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-sm text-brand-main">No Notifications</h3>
          <p className="text-xs text-brand-secondary">
            {filterUnread ? 'You have caught up with all unread notifications.' : 'No activity records found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNotifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`bg-white rounded-xl p-4 border transition-all cursor-pointer flex items-start gap-4 hover:shadow-card ${
                !n.is_read ? 'border-blue-200 bg-blue-50/30' : 'border-brand-border'
              }`}
            >
              <div className="p-2 rounded-xl bg-surface border border-brand-border shrink-0">
                {getIcon(n.notification_type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-brand-main truncate">
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-brand-secondary font-mono shrink-0">
                    {formatDateTime(n.created_at)}
                  </span>
                </div>
                <p className="text-xs text-brand-secondary leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.is_read && (
                <span className="w-2.5 h-2.5 bg-electric rounded-full shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
