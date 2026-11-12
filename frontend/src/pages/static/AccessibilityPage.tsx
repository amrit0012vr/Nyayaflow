import React from 'react';
import { Panel } from '../../components/ui/Panel';

export const AccessibilityPage: React.FC = () => {
  return (
    <div className="py-6 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
      <div className="border-b border-[#C5CCD6] pb-3">
        <h1 className="text-2xl font-bold text-[#0B2A5B] m-0">Accessibility Statement</h1>
        <p className="text-xs text-[#4A4F57] m-0 mt-1">
          Commitment to Guidelines for Indian Government Websites (GIGW) & WCAG 2.1 Level AA
        </p>
      </div>

      <Panel title="Our Commitment">
        <div className="space-y-3 text-sm text-[#1A1A1A] leading-relaxed">
          <p>
            The NyayaFlow project team is committed to ensuring that judicial decision-support tools and legal aid services are accessible to all individuals, including persons with disabilities, judicial staff with low vision, and citizens accessing services from diverse devices.
          </p>
          <p>
            This portal has been developed to adhere in spirit to the <strong>Guidelines for Indian Government Websites (GIGW 3.0)</strong> and the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>.
          </p>
        </div>
      </Panel>

      <Panel title="Accessibility Features Implemented">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <h3 className="font-bold text-[#0B2A5B] text-sm mb-1">1. Skip to Main Content</h3>
            <p className="text-[#4A4F57] leading-relaxed m-0">
              A dedicated skip link is the first focusable element on every page, allowing keyboard and screen-reader users to bypass navigation headers directly to main content.
            </p>
          </div>
          <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <h3 className="font-bold text-[#0B2A5B] text-sm mb-1">2. Text Resizing (A- / A / A+)</h3>
            <p className="text-[#4A4F57] leading-relaxed m-0">
              Users can scale font sizes between 87.5%, 100%, and 125% without breaking page layouts. Layouts are built using relative rem units.
            </p>
          </div>
          <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <h3 className="font-bold text-[#0B2A5B] text-sm mb-1">3. High-Contrast Theme</h3>
            <p className="text-[#4A4F57] leading-relaxed m-0">
              A high-contrast mode (pure black background, white text, and yellow indicators) provides enhanced visual clarity for low-vision users.
            </p>
          </div>
          <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <h3 className="font-bold text-[#0B2A5B] text-sm mb-1">4. Focus Visibility & Keyboard Flow</h3>
            <p className="text-[#4A4F57] leading-relaxed m-0">
              Every interactive element features an explicit dual-outline focus ring (`3px saffron + 5px navy`). All workflows are 100% operable via keyboard without mouse dependency.
            </p>
          </div>
          <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <h3 className="font-bold text-[#0B2A5B] text-sm mb-1">5. Trilingual Localization</h3>
            <p className="text-[#4A4F57] leading-relaxed m-0">
              The portal supports English, हिन्दी (Hindi), and ଓଡ଼ିଆ (Odia). The `&lt;html lang&gt;` attribute dynamically updates to ensure correct screen-reader voice pronunciation.
            </p>
          </div>
          <div className="p-3 bg-[#F4F6FA] border border-[#C5CCD6] rounded">
            <h3 className="font-bold text-[#0B2A5B] text-sm mb-1">6. Semantic HTML & Landmarks</h3>
            <p className="text-[#4A4F57] leading-relaxed m-0">
              Pages utilize explicit landmark tags (`header`, `nav`, `main#main-content`, `footer`, `aside`) and ordered headings (`h1` through `h3`) with zero skipped levels.
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Verification & Testing Details">
        <div className="space-y-3 text-xs text-[#1A1A1A] leading-relaxed">
          <p>
            <strong>Automated Auditing:</strong> Scanned using <code>axe-core</code> with zero critical or serious violations detected across core portal workflows.
          </p>
          <p>
            <strong>Manual Screen Reader Verification:</strong> Tested on Windows using NVDA with Firefox and Chrome, confirming accurate label announcement on Category Tiles, credentials inputs, and cause list tables.
          </p>
          <p>
            <strong>Known Limitations:</strong> Complex multi-page PDF documents uploaded during clerk intake rely on server-side text extraction for screen reader accessibility. Full visual PDF canvas zooming is currently under active enhancement.
          </p>
        </div>
      </Panel>

      <div className="p-4 bg-white border border-[#C5CCD6] rounded text-xs text-[#4A4F57]">
        <strong>Encountered an accessibility barrier?</strong> Please notify our team at{' '}
        <a href="mailto:accessibility@nyayaflow.demo" className="text-[#0B5FA5] underline">
          accessibility@nyayaflow.demo
        </a>. We review all feedback within two business days.
      </div>
    </div>
  );
};
