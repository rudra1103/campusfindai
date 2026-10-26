import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/storage';
import { SEED_USERS, SEED_INSTITUTION, SEED_CAMPUS } from '../data/seedData';
import { Profile, UserRole } from '../types';
import { Button } from '../components/common/Button';
import { Compass, CheckCircle2, Shield, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [academicYear, setAcademicYear] = useState('1st Year (Freshman)');
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDemoLogin = (user: Profile) => {
    db.setCurrentUser(user);
    if (user.role === 'admin' || user.role === 'staff') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const all = db.getAllProfiles();
    const found = all.find(u => u.college_email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      db.setCurrentUser(found);
      navigate('/dashboard');
    } else {
      setErrorMsg('No user registered with this email. Try one of the 1-click demo accounts below or create an account.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter all required fields.');
      return;
    }

    try {
      const newUser = db.registerUser({
        full_name: fullName.trim(),
        college_email: email.trim().toLowerCase(),
        institution_id: SEED_INSTITUTION.id,
        institution_name: SEED_INSTITUTION.name,
        campus_id: SEED_CAMPUS.id,
        campus_name: SEED_CAMPUS.name,
        department,
        academic_year: role === 'student' ? academicYear : undefined,
        role: role as UserRole, // Never allow self-assigned admin
        verification_status: role === 'student' ? 'verified_student' : 'verified_staff',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });

      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7 text-accent-teal" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-navy">
            {mode === 'signin' ? 'Sign in to CampusFind AI' : 'Join Your Campus Community'}
          </h2>
          <p className="mt-2 text-xs text-brand-secondary">
            {mode === 'signin'
              ? 'Access your reports, potential matches, and verified claims.'
              : 'Register with your college email to discover and recover items.'}
          </p>
        </div>

        {/* 1-Click Fast Demo Switcher Card */}
        <div className="bg-electric-subtle/70 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-electric mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Instant Demo Account Sign-In:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {SEED_USERS.map(u => (
              <button
                key={u.id}
                onClick={() => handleDemoLogin(u)}
                className="bg-white hover:bg-slate-50 border border-blue-200 text-left p-2.5 rounded-xl shadow-xs transition-all hover:border-electric flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-brand-main text-xs">{u.full_name}</div>
                  <div className="text-[10px] text-brand-secondary capitalize">{u.role}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-brand-border">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-brand-border mb-6">
            <button
              onClick={() => { setMode('signin'); setErrorMsg(''); }}
              className={`flex-1 pb-3 text-center text-xs font-bold transition-colors border-b-2 ${
                mode === 'signin'
                  ? 'border-electric text-electric'
                  : 'border-transparent text-brand-secondary hover:text-brand-main'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`flex-1 pb-3 text-center text-xs font-bold transition-colors border-b-2 ${
                mode === 'signup'
                  ? 'border-electric text-electric'
                  : 'border-transparent text-brand-secondary hover:text-brand-main'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-main mb-1">
                  College Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex.chen@metro.edu"
                  className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-brand-main">Password</label>
                  <span className="text-[11px] text-electric hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" size="md">
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-main mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-main mb-1">
                  College Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jordan.m@metro.edu"
                  className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
                />
                <span className="text-[10px] text-brand-secondary mt-1 block">
                  Must end with an approved campus domain (@metro.edu)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-main mb-1">Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as 'student' | 'staff')}
                    className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="staff">Campus Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-main mb-1">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none bg-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Biological Sciences">Biological Sciences</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Campus Facilities">Campus Facilities</option>
                  </select>
                </div>
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-brand-main mb-1">Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none bg-white"
                  >
                    <option value="1st Year (Freshman)">1st Year (Freshman)</option>
                    <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                    <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                    <option value="4th Year (Senior)">4th Year (Senior)</option>
                    <option value="Graduate Student">Graduate Student</option>
                  </select>
                </div>
              )}

              <Button type="submit" variant="secondary" className="w-full" size="md">
                Register Account
              </Button>
            </form>
          )}

          {/* Google OAuth Simulation */}
          <div className="mt-6 pt-6 border-t border-brand-border text-center">
            <button
              onClick={() => handleDemoLogin(SEED_USERS[0])}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-brand-border hover:bg-surface text-xs font-semibold text-brand-main transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with University Google Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
