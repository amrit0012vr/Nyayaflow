import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleHomeRoute } from '../lib/permissions';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 mb-5">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">404 — Record Not Found</h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          The requested page, document, or judicial resource does not exist in the court registry.
        </p>
        <button
          onClick={() => navigate(user ? getRoleHomeRoute(user.role) : '/login')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Safety</span>
        </button>
      </div>
    </div>
  );
};

