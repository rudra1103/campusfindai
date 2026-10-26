import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-slate-300 border-t border-navy-light pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-accent-teal" />
              </div>
              <span className="font-extrabold text-lg text-white">
                CampusFind<span className="text-electric">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tagline: <strong className="text-white">“Lost something? Let AI bring it back.”</strong>
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent, privacy-preserving campus lost-and-found management platform orchestrated by a Multi-Agent System.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Explore & Report
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse" className="hover:text-white transition-colors">
                  Browse Active Items
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-white transition-colors">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-white transition-colors">
                  Report a Found Item
                </Link>
              </li>
              <li>
                <Link to="/claims" className="hover:text-white transition-colors">
                  Track Recovery Claims
                </Link>
              </li>
            </ul>
          </div>

          {/* Multi-Agent Architecture */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Multi-Agent System (MAS)
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Matching Agent (7-Signal Engine)
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Verification Agent (Contradictions)
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Coordinator Agent (Orchestration)
              </li>
              <li>
                <Link to="/agent-operations" className="text-accent-teal hover:underline inline-flex items-center gap-1 mt-1 font-medium">
                  <Sparkles className="w-3 h-3" />
                  View Agent Operations
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Campus Safety */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Trust & Security
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Private verification attributes remain strictly hidden from public searches.
              </p>
              <p>Handover of sensitive IDs & wallets is mediated by Campus Safety dispatch.</p>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-navy-light text-slate-300 text-[11px] font-mono">
                  PostgreSQL RLS Protected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-navy-light/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 CampusFind AI Platform. Built for University Campuses.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Safeguards</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Campus Directory Help</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
