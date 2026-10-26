import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="space-y-5 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-brand-secondary">
          <Compass className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-navy">404</h1>
        <h2 className="text-xl font-bold text-brand-main">Page Not Found</h2>
        <p className="text-xs text-brand-secondary leading-relaxed">
          The page or report you are looking for has been moved, renamed, or does not exist.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
