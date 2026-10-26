import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="space-y-5 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto text-rose-600 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-navy">Unauthorized Access</h1>
        <p className="text-xs text-brand-secondary leading-relaxed">
          You do not have the required administrative or staff privileges to view this section. Use the top banner demo account switcher to log in as Officer Marcus Reed or Director Linda Hayes.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Dashboard
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="secondary" size="sm">
              Switch Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
