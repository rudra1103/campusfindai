import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/storage';
import { ItemReport, Claim, ItemMatch, AuditLog, Profile, CampusLocation } from '../types';
import { formatDate, formatDateTime } from '../lib/utils';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { 
  Shield, 
  FileText, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  RotateCcw,
  Building,
  UserCheck,
  BarChart3,
  ListFilter
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Profile>(db.getCurrentUser());
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);

  // Add Location Modal
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocBuilding, setNewLocBuilding] = useState('');
  const [newLocType, setNewLocType] = useState<CampusLocation['location_type']>('classroom');

  const loadAll = () => {
    setCurrentUser(db.getCurrentUser());
    setReports(db.getReports());
    setClaims(db.getClaims());
    setMatches(db.getMatches());
    setAuditLogs(db.getAuditLogs());
    setLocations(db.getLocations());
  };

  useEffect(() => {
    loadAll();
    const unsub = db.subscribe(loadAll);
    return () => unsub();
  }, []);

  const isStaffOrAdmin = currentUser.role === 'staff' || currentUser.role === 'admin';

  if (!isStaffOrAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-brand-main">Campus Staff Access Restricted</h2>
        <p className="text-xs text-brand-secondary">
          You are currently signed in as a student ({currentUser.full_name}). Use the quick demo account switcher in the top banner to switch to <strong>Officer Marcus Reed (Staff)</strong> or <strong>Director Linda Hayes (Admin)</strong>.
        </p>
        <Link to="/dashboard">
          <Button size="sm" variant="outline">Return to Student Dashboard</Button>
        </Link>
      </div>
    );
  }

  const lostCount = reports.filter(r => r.report_type === 'lost' && r.status !== 'recovered').length;
  const foundCount = reports.filter(r => r.report_type === 'found' && r.status !== 'recovered').length;
  const pendingClaimsCount = claims.filter(c => c.status === 'submitted' || c.status === 'under_review').length;
  const recoveredCount = reports.filter(r => r.status === 'recovered').length;

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocBuilding.trim()) return;

    db.addLocation({
      campus_id: 'camp-001',
      name: newLocName.trim(),
      location_type: newLocType,
      building_or_area: newLocBuilding.trim(),
      is_active: true,
    });

    setLocModalOpen(false);
    setNewLocName('');
    setNewLocBuilding('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy text-white text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-accent-teal" />
            <span>Campus Administration & Dispatch Command</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy">Campus Operations & Moderation</h1>
          <p className="text-xs sm:text-sm text-brand-secondary mt-1">
            Supervise claims, manage physical handover queues, add campus buildings, and monitor MAS execution logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/agent-operations">
            <Button size="sm" variant="secondary" leftIcon={<Bot className="w-4 h-4" />}>
              Agent Operations
            </Button>
          </Link>
          <Link to="/analytics">
            <Button size="sm" variant="outline" leftIcon={<BarChart3 className="w-4 h-4" />}>
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
            Active Lost Reports
          </span>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">{lostCount}</div>
          <span className="text-[11px] text-brand-secondary">Across all campus departments</span>
        </div>

        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
            Active Found Custody
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{foundCount}</div>
          <span className="text-[11px] text-brand-secondary">Items secured on campus</span>
        </div>

        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
            Pending Claims
          </span>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">{pendingClaimsCount}</div>
          <span className="text-[11px] text-brand-secondary">Awaiting staff moderation</span>
        </div>

        <div className="bg-white rounded-card p-5 border border-brand-border shadow-card">
          <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
            Confirmed Recoveries
          </span>
          <div className="text-3xl font-extrabold text-purple-600 mt-2">{recoveredCount}</div>
          <span className="text-[11px] text-brand-secondary">Reunited belongings</span>
        </div>
      </div>

      {/* Claims Pending Review Queue */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div>
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-electric" />
              Ownership Claims Review Queue
            </h2>
            <p className="text-xs text-brand-secondary">
              Review claimant evidence, verify private attributes, and schedule physical handover.
            </p>
          </div>
          <Link to="/claims" className="text-xs text-electric hover:underline font-semibold">
            Manage All Claims →
          </Link>
        </div>

        {claims.length === 0 ? (
          <p className="text-xs text-brand-secondary text-center py-6">
            No pending claims currently in queue.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {claims.map(claim => (
              <div key={claim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-main text-sm">
                      {claim.found_report?.item_name || 'Item'}
                    </span>
                    <Badge variant={claim.status === 'submitted' ? 'warning' : 'info'} size="sm">
                      {claim.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-brand-secondary">
                    Claimant: <strong>{claim.claimant_name}</strong> ({claim.claimant_email}) • Marks: "{claim.distinctive_marks}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to="/claims">
                    <Button size="sm" variant="secondary">
                      Moderate Claim
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campus Locations Management */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div>
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <Building className="w-5 h-5 text-accent-teal" />
              Campus Locations & Drop-off Points
            </h2>
            <p className="text-xs text-brand-secondary">
              Authorized buildings, libraries, labs, and recreation zones configured for location matching.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLocModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Location
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map(loc => (
            <div key={loc.id} className="p-3 rounded-xl bg-surface border border-slate-200 text-xs space-y-0.5">
              <div className="font-semibold text-brand-main">{loc.name}</div>
              <div className="text-[11px] text-brand-secondary">{loc.building_or_area}</div>
              <span className="inline-block mt-1 uppercase text-[9px] font-bold tracking-wider text-electric bg-blue-50 px-1.5 py-0.5 rounded">
                {loc.location_type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div>
            <h2 className="text-lg font-bold text-navy">Immutable Administrative Audit Log</h2>
            <p className="text-xs text-brand-secondary">
              PostgreSQL audit log trail of status updates, claim reviews, and system events.
            </p>
          </div>
          <span className="text-xs text-brand-secondary font-mono">
            {auditLogs.length} Records Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-surface text-brand-secondary uppercase text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Reason / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {auditLogs.slice(0, 8).map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap text-brand-secondary">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-sans font-semibold text-brand-main">
                    {log.actor_name || 'System'}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                    {log.entity_type}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-brand-secondary">
                    {log.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Location Modal */}
      <Modal
        isOpen={locModalOpen}
        onClose={() => setLocModalOpen(false)}
        title="Add Campus Location"
        description="Expand campus zones for location proximity scoring."
      >
        <form onSubmit={handleAddLocation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Location Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newLocName}
              onChange={e => setNewLocName(e.target.value)}
              placeholder="e.g. Science Pavilion — Room 302 Chemistry Lab"
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Building or Area <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newLocBuilding}
              onChange={e => setNewLocBuilding(e.target.value)}
              placeholder="e.g. Science & Technology Complex"
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Location Type
            </label>
            <select
              value={newLocType}
              onChange={e => setNewLocType(e.target.value as any)}
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 bg-white"
            >
              <option value="library">Library</option>
              <option value="classroom">Classroom</option>
              <option value="lab">Laboratory</option>
              <option value="cafeteria">Cafeteria</option>
              <option value="sports_ground">Sports Ground / Gym</option>
              <option value="hostel">Hostel / Dormitory</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setLocModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="sm">
              Save Location
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
