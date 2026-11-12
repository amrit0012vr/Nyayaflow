import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleHomeRoute } from '../lib/permissions';
import { Button } from '../components/ui/Button';

export const ForbiddenPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReturnHome = () => {
    if (user) {
      navigate(getRoleHomeRoute(user.role));
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="py-16 max-w-[600px] mx-auto px-4 text-center">
      <div className="bg-white border-2 border-[#B3261E] rounded p-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#B3261E]/10 border border-[#B3261E]/40 flex items-center justify-center mx-auto text-[#B3261E] mb-4">
          <ShieldAlert className="w-7 h-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#0B2A5B] mb-2">
          403 — Access Restricted
        </h1>
        <p className="text-sm text-[#4A4F57] mb-6 leading-relaxed">
          Your current judicial or administrative role category does not possess the requisite permissions to view this docket.
        </p>
        <Button
          onClick={handleReturnHome}
          variant="primary"
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to Authorized Dashboard</span>
        </Button>
      </div>
    </div>
  );
};
