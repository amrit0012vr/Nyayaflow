import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleHomeRoute } from '../lib/permissions';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="py-16 max-w-[600px] mx-auto px-4 text-center">
      <div className="bg-white border border-[#C5CCD6] rounded p-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#0B2A5B]/10 border border-[#0B2A5B]/30 flex items-center justify-center mx-auto text-[#0B2A5B] mb-4">
          <HelpCircle className="w-7 h-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#0B2A5B] mb-2">
          404 — Page Not Found
        </h1>
        <p className="text-sm text-[#4A4F57] mb-6 leading-relaxed">
          The requested page, document dossier, or resource could not be found in the portal registry.
        </p>
        <Button
          onClick={() => navigate(user ? getRoleHomeRoute(user.role) : '/login')}
          variant="primary"
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to Portal Home</span>
        </Button>
      </div>
    </div>
  );
};
