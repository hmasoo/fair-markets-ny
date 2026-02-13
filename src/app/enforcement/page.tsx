import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "State Regulatory & Enforcement Actions",
  description:
    "Competition-related enforcement actions, regulatory decisions, and legislation across New York State agencies, sourced from official press releases and filings.",
};

const sampleActions = [
  {
    id: "1",
    title: "AG James Sues to Block Tapestry-Capri Merger",
    date: "2024-04-22",
    type: "Merger Challenge",
    agency: "NY Attorney General",
    outcome: "Merger blocked",
    summary:
      "NY AG filed suit to block the $8.5B merger of Tapestry (Coach) and Capri (Michael Kors, Versace, Jimmy Choo), arguing it would reduce competition in the accessible luxury handbag market.",
  },
  {
    id: "2",
    title: "RealPage Algorithmic Rent-Setting Ban Signed",
    date: "2024-12-20",
    type: "Legislation",
    agency: "NYS Legislature / Governor",
    outcome: "Signed into law",
    summary:
      "Governor Hochul signed the nation's first ban on algorithmic rent-setting software, targeting RealPage's revenue management tool used by major landlords to coordinate rent increases.",
  },
  {
    id: "3",
    title: "AG James Investigates PE Nursing Home Acquisitions",
    date: "2024-06-15",
    type: "Investigation",
    agency: "NY Attorney General",
    outcome: "Ongoing",
    summary:
      "Investigation into private equity acquisitions of nursing homes across NYS, focusing on quality-of-care impacts following ownership changes.",
  },
  {
    id: "4",
    title: "PBM Watchdog Bureau Established at DFS",
    date: "2024-09-01",
    type: "Regulatory Action",
    agency: "NYS DFS",
    outcome: "Bureau operational",
    summary:
      "Governor Hochul established the nation's first Pharmacy Benefit Manager watchdog bureau within the Department of Financial Services to monitor PBM practices and vertical integration.",
  },
  {
    id: "5",
    title: "Hospital CON Review Period Extended to 60 Days",
    date: "2024-03-10",
    type: "Regulatory Action",
    agency: "NYS DOH",
    outcome: "Implemented",
    summary:
      "Extended the Certificate of Need review period for hospital mergers from 30 to 60 days, with new requirements for ongoing post-merger impact reporting.",
  },
];

export default function EnforcementPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Regulatory Tracker" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">Regulatory & Enforcement Tracker</h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          Competition-related enforcement actions, regulatory decisions, and
          legislation across New York State, sourced from official press
          releases and filings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-patina">
            {sampleActions.length}
          </div>
          <div className="text-sm text-fm-sage mt-1">Actions Tracked</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-patina">3</div>
          <div className="text-sm text-fm-sage mt-1">Agencies</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-patina">4</div>
          <div className="text-sm text-fm-sage mt-1">Action Types</div>
        </div>
      </div>

      {/* Actions list */}
      <div className="space-y-4">
        {sampleActions.map((action) => (
          <div key={action.id} className="card">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-fm-patina">{action.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="blue">{action.type}</Badge>
                  <Badge variant="gray">{action.agency}</Badge>
                  <Badge
                    variant={
                      action.outcome === "Ongoing"
                        ? "yellow"
                        : action.outcome.includes("blocked") ||
                          action.outcome.includes("law")
                        ? "green"
                        : "default"
                    }
                  >
                    {action.outcome}
                  </Badge>
                </div>
              </div>
              <time className="text-sm text-fm-sage whitespace-nowrap">
                {new Date(action.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {action.summary}
            </p>
          </div>
        ))}
      </div>

      <div className="card mt-8 text-center py-8">
        <p className="text-sm text-fm-sage">
          This tracker will be expanded with automated scraping of NY AG press
          releases, NYS DOH CON filings, and DFS regulatory actions. Data is
          currently manually curated from public sources.
        </p>
      </div>
    </div>
  );
}
