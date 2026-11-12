import React from 'react';
import { Panel } from '../../components/ui/Panel';
import { Mail, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="py-6 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
      <div className="border-b border-[#C5CCD6] pb-3">
        <h1 className="text-2xl font-bold text-[#0B2A5B] m-0">Contact & Feedback</h1>
        <p className="text-xs text-[#4A4F57] m-0 mt-1">
          NyayaFlow Engineering Group — Bharat Agentic-AI Hackathon 2026
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Technical Support Desk">
          <div className="space-y-3 text-sm text-[#1A1A1A]">
            <p className="text-xs text-[#4A4F57] leading-relaxed">
              For questions regarding deployment, user credentials, accessibility reporting, or hackathon evaluation:
            </p>
            <div className="flex items-center gap-2 p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded text-xs">
              <Mail className="w-4 h-4 text-[#0B2A5B]" aria-hidden="true" />
              <span>Email: </span>
              <a href="mailto:support@nyayaflow.demo" className="text-[#0B5FA5] font-semibold underline">
                support@nyayaflow.demo
              </a>
            </div>
            <p className="text-xs text-[#4A4F57] leading-relaxed">
              Office Hours: Monday through Saturday, 09:30 – 18:00 IST.
            </p>
          </div>
        </Panel>

        <Panel title="Feedback & Bug Reporting">
          <div className="space-y-3 text-sm text-[#1A1A1A]">
            <p className="text-xs text-[#4A4F57] leading-relaxed">
              We welcome feedback from judicial officers, advocates, and evaluators to refine triage rules and accessibility.
            </p>
            <div className="flex items-center gap-2 p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded text-xs">
              <MessageSquare className="w-4 h-4 text-[#0B2A5B]" aria-hidden="true" />
              <span>Developer Repository: </span>
              <a
                href="https://github.com/amrit0012vr/Nyayaflow"
                target="_blank"
                rel="noreferrer"
                className="text-[#0B5FA5] font-semibold underline"
              >
                github.com/amrit0012vr/Nyayaflow
              </a>
            </div>
            <p className="text-xs text-[#4A4F57] leading-relaxed">
              Submit issues or review pull requests on our public repository.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
};
