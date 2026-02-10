import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Your Doctor's Boss — Healthcare Consolidation",
  description:
    "Hospital mergers, PE acquisitions of physician practices, and PBM concentration across New York.",
};

export default function HealthcarePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Healthcare" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">
          Your Doctor{"'"}s Boss
        </h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          Hospital mergers, PE acquisitions of physician practices, and PBM
          concentration — tracking healthcare consolidation across New York.
        </p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">
            <svg className="w-16 h-16 mx-auto text-fm-sage/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-fm-patina mb-2">Coming Soon</h2>
          <p className="text-fm-sage max-w-md mx-auto">
            We{"'"}re building the healthcare consolidation tracker using NYS DOH
            Certificate of Need filings, CMS provider enrollment data, and DFS
            PBM complaint records.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold text-fm-patina">CON Tracker</div>
              <div className="text-xs text-fm-sage">Hospital merger filings</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold text-fm-patina">System Map</div>
              <div className="text-xs text-fm-sage">Parent health systems</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold text-fm-patina">PBM Watch</div>
              <div className="text-xs text-fm-sage">Vertical integration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
