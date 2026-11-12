import React from 'react';
import { Panel } from '../../components/ui/Panel';
import { PhoneCall } from 'lucide-react';

export const LegalAidInfoPage: React.FC = () => {
  const eligibleCategories = [
    {
      clause: 'Section 12(a)',
      title: 'Scheduled Castes & Scheduled Tribes',
      desc: 'Members of SC/ST communities are entitled to free legal aid without any income ceilings.'
    },
    {
      clause: 'Section 12(c)',
      title: 'Women & Children',
      desc: 'All women and children (under 18 years) qualify for 100% free statutory legal representation irrespective of income.'
    },
    {
      clause: 'Section 12(g)',
      title: 'Persons in Custody',
      desc: 'Under-trial prisoners and detained individuals in protective homes or custody are entitled to free legal aid.'
    },
    {
      clause: 'Section 12(d)',
      title: 'Persons with Disabilities',
      desc: 'Persons with physical disabilities or mental health conditions under the Rights of Persons with Disabilities Act.'
    },
    {
      clause: 'Section 12(e)',
      title: 'Victims of Trafficking & Beggary',
      desc: 'Victims of human trafficking or individuals forced into beggary as defined in Article 23(1) of the Constitution.'
    },
    {
      clause: 'Section 12(h)',
      title: 'Citizens Meeting State Income Ceilings',
      desc: 'Citizens whose annual income does not exceed statutory state limits (e.g., ₹3,00,000 in Delhi) set by State Legal Services Authorities.'
    }
  ];

  return (
    <div className="py-6 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
      <div className="border-b border-[#C5CCD6] pb-3">
        <h1 className="text-2xl font-bold text-[#0B2A5B] m-0">Free Legal Aid Information</h1>
        <p className="text-xs text-[#4A4F57] m-0 mt-1">
          Statutory Rights under Section 12 of the Legal Services Authorities Act, 1987
        </p>
      </div>

      {/* Helpline Banner */}
      <div className="p-5 bg-[#F4F6FA] border-2 border-[#0B2A5B] rounded flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wider">
            National Legal Services Authority (NALSA) Toll-Free Helpline
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2A5B] mt-1 flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-[#138808]" aria-hidden="true" />
            <span>15100</span>
          </div>
          <p className="text-xs text-[#4A4F57] mt-1 m-0">
            Available 24x7 across India for immediate legal counsel and DLSA assistance.
          </p>
        </div>
        <div>
          <a
            href="https://nalsa.gov.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-4 py-2 rounded bg-[#0B2A5B] text-white font-semibold text-xs no-underline hover:bg-[#071C3F]"
          >
            Visit Official NALSA Portal &rarr;
          </a>
        </div>
      </div>

      {/* Statutory Entitlement Categories */}
      <Panel title="Who is Entitled to Free Legal Aid?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {eligibleCategories.map((cat) => (
            <div key={cat.clause} className="p-4 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
              <span className="text-[10px] font-bold text-[#0B5FA5] uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#C5CCD6]">
                {cat.clause}
              </span>
              <h3 className="text-sm font-bold text-[#0B2A5B] mt-2 mb-1">{cat.title}</h3>
              <p className="text-xs text-[#4A4F57] leading-relaxed m-0">{cat.desc}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Advisory Disclaimer */}
      <div className="p-4 bg-white border border-[#C5CCD6] rounded text-xs text-[#4A4F57] leading-relaxed">
        <strong>Statutory Notice:</strong> This summary provides general informational guidance on statutory provisions under the Legal Services Authorities Act, 1987. It does not constitute formal legal advice. For binding determination, please submit an application at your nearest District Legal Services Authority (DLSA) or Front Office.
      </div>
    </div>
  );
};
