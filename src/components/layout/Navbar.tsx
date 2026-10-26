import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Search, 
  PlusCircle, 
  Bell, 
  Shield, 
  UserCheck, 
  Bot, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  FileText, 
  BarChart3,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { db } from '../../lib/storage';
import { Profile, Notification } from '../../types';
import { SEED_USERS } from '../../data/seedData';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<Profile>(db.getCurrentUser());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncState = () => {
      const user = db.getCurrentUser();
      setCurrentUser(user);
      setNotifications(db.getNotificationsForUser(user.id));
    };

    syncState();
    const unsubscribe = db.subscribe(syncState);
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSwitchUser = (user: Profile) => {
    db.setCurrentUser(user);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  const markAllRead = () => {
    db.markAllNotificationsAsRead(currentUser.id);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border">
      {/* Demo Mode Announcement Banner */}
      <div className="bg-navy text-white text-xs py-1 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto">
          <span className="bg-electric text-white font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            Demo Environment
          </span>
          <span>
            Logged in as <strong>{currentUser.full_name}</strong> ({currentUser.role.toUpperCase()}) — Switch demo roles anytime:
          </span>
          <div className="inline-flex items-center gap-1.5 ml-2">
            {SEED_USERS.map(u => (
              <button
                key={u.id}
                onClick={() => handleSwitchUser(u)}
                className={`text-[11px] px-2 py-0.5 rounded transition-all ${
                  currentUser.id === u.id
                    ? 'bg-white text-navy font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {u.full_name.split(' ')[0]} ({u.role})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white shadow-sm group-hover:bg-electric transition-colors">
                <Compass className="w-6 h-6 text-accent-teal" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-navy">
                  CampusFind<span className="text-electric">AI</span>
                </span>
                <span className="hidden sm:block text-[10px] text-brand-secondary tracking-wider uppercase font-semibold">
                  Multi-Agent Lost & Found
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/browse"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/browse')
                    ? 'bg-slate-100 text-electric font-semibold'
                    : 'text-brand-secondary hover:text-brand-main hover:bg-surface'
                }`}
              >
                Browse Items
              </Link>

              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-slate-100 text-electric font-semibold'
                    : 'text-brand-secondary hover:text-brand-main hover:bg-surface'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/my-reports"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/my-reports')
                    ? 'bg-slate-100 text-electric font-semibold'
                    : 'text-brand-secondary hover:text-brand-main hover:bg-surface'
                }`}
              >
                My Reports
              </Link>

              <Link
                to="/claims"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/claims')
                    ? 'bg-slate-100 text-electric font-semibold'
                    : 'text-brand-secondary hover:text-brand-main hover:bg-surface'
                }`}
              >
                Claims & Recovery
              </Link>

              {/* Staff / Admin Links */}
              {(currentUser.role === 'staff' || currentUser.role === 'admin') && (
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-brand-border">
                  <Link
                    to="/admin"
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isActive('/admin')
                        ? 'bg-navy text-white'
                        : 'text-navy hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-accent-teal" />
                    Admin Queue
                  </Link>
                  <Link
                    to="/agent-operations"
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isActive('/agent-operations')
                        ? 'bg-purple-700 text-white'
                        : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Agent Ops
                  </Link>
                  <Link
                    to="/analytics"
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isActive('/analytics')
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analytics
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Report CTAs */}
            <div className="flex items-center gap-2">
              <Link
                to="/report-lost"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Report Lost
              </Link>
              <Link
                to="/report-found"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Report Found
              </Link>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-lg text-brand-secondary hover:text-brand-main hover:bg-surface transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-status-error text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-brand-border py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border">
                    <span className="font-semibold text-sm text-brand-main">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-electric hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-brand-secondary">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            db.markNotificationAsRead(n.id);
                            setShowNotifDropdown(false);
                            if (n.related_match_id) navigate(`/match-results/${n.related_report_id || ''}`);
                            else if (n.related_claim_id) navigate('/claims');
                            else if (n.related_report_id) navigate(`/item/${n.related_report_id}`);
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-surface transition-colors ${
                            !n.is_read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-medium text-brand-main mb-1">
                            <span>{n.title}</span>
                            {!n.is_read && (
                              <span className="w-1.5 h-1.5 bg-electric rounded-full" />
                            )}
                          </div>
                          <p className="text-brand-secondary line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-brand-border text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-xs text-electric font-medium hover:underline"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface transition-colors border border-transparent hover:border-brand-border"
              >
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.full_name}
                  className="w-8 h-8 rounded-full object-cover border border-brand-border"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-brand-main leading-none">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-brand-secondary capitalize mt-0.5">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-brand-secondary" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-brand-border py-2 z-50">
                  <div className="px-4 py-2 border-b border-brand-border">
                    <p className="text-xs font-semibold text-brand-main">{currentUser.full_name}</p>
                    <p className="text-xs text-brand-secondary truncate">{currentUser.college_email}</p>
                    <Badge variant="info" size="sm" className="mt-1">
                      {currentUser.department}
                    </Badge>
                  </div>

                  <div className="p-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-secondary px-2 py-1">
                      Switch Demo Role
                    </div>
                    {SEED_USERS.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleSwitchUser(user)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          currentUser.id === user.id
                            ? 'bg-electric-subtle text-electric font-semibold'
                            : 'hover:bg-surface text-brand-main'
                        }`}
                      >
                        <div className="text-left">
                          <div>{user.full_name}</div>
                          <div className="text-[10px] text-brand-secondary capitalize">{user.role}</div>
                        </div>
                        {currentUser.id === user.id && <CheckCircle2 className="w-4 h-4 text-electric" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-brand-border pt-1">
                    <button
                      onClick={() => {
                        db.resetToSeed();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-brand-secondary hover:text-brand-main hover:bg-surface"
                    >
                      Reset Seed Database
                    </button>
                    <Link
                      to="/auth"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out / Switch Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-secondary hover:text-brand-main hover:bg-surface"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/report-lost"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200"
            >
              <PlusCircle className="w-4 h-4" /> Report Lost
            </Link>
            <Link
              to="/report-found"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200"
            >
              <PlusCircle className="w-4 h-4" /> Report Found
            </Link>
          </div>

          <div className="space-y-1 pt-2">
            <Link
              to="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-brand-main hover:bg-surface"
            >
              Browse Items
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-brand-main hover:bg-surface"
            >
              Dashboard
            </Link>
            <Link
              to="/my-reports"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-brand-main hover:bg-surface"
            >
              My Reports
            </Link>
            <Link
              to="/claims"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-brand-main hover:bg-surface"
            >
              Claims & Recovery
            </Link>
            {(currentUser.role === 'staff' || currentUser.role === 'admin') && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-navy bg-slate-100"
                >
                  Admin Moderation Queue
                </Link>
                <Link
                  to="/agent-operations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50"
                >
                  MAS Agent Operations
                </Link>
                <Link
                  to="/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50"
                >
                  Campus Analytics
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
