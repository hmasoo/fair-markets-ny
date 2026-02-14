import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Regulatory Tracker — What New York Did About It",
  description:
    "Real consumer problems and how New York regulators responded — from algorithmic rent-setting to hospital mergers to nursing home quality. Tracked alongside structure and cost data from elsewhere on this site.",
};

interface CrossRef {
  text: string;
  href: string;
  detail: string;
}

interface Action {
  id: string;
  problem: string;
  sector: string;
  description: string;
  response: string;
  agency: string;
  date: string;
  outcome: string;
  outcomeVariant: "green" | "yellow" | "red" | "gray";
  crossRefs?: CrossRef[];
}

const actions: Action[] = [
  {
    id: "realpage",
    problem: "Landlords were using the same software to set rents",
    sector: "Housing",
    description:
      "RealPage\u2019s revenue management tool let large landlords feed their pricing data into a shared algorithm that recommended rent increases \u2014 effectively coordinating prices without a phone call. Tenants in buildings using the software paid more than comparable units nearby.",
    response: "First-in-nation ban on algorithmic rent-setting",
    agency: "NYS Legislature / Governor",
    date: "2024-12-20",
    outcome: "Signed into law",
    outcomeVariant: "green",
    crossRefs: [
      {
        text: "Housing ownership concentration",
        href: "/housing",
        detail:
          "Algorithmic pricing tools are most effective where a few landlords control a large share of units. Our housing data shows which neighborhoods have the highest ownership concentration.",
      },
    ],
  },
  {
    id: "pe-nursing",
    problem: "Private equity firms bought nursing homes, then cut staffing",
    sector: "Healthcare",
    description:
      "When PE firms acquire nursing homes, research shows they often reduce staffing to boost returns. Residents and families noticed declining care quality \u2014 more falls, slower response times, fewer activities \u2014 but had no visibility into who actually owned the facility.",
    response: "AG investigation into PE nursing home acquisitions",
    agency: "NY Attorney General",
    date: "2024-06-15",
    outcome: "Investigation ongoing",
    outcomeVariant: "yellow",
    crossRefs: [
      {
        text: "Healthcare system dominance by region",
        href: "/healthcare",
        detail:
          "Our healthcare page maps which systems control the most beds in each region. In 8 of 10 regions, a single system holds 40%+ of beds \u2014 the kind of market structure where acquisitions face less competitive pressure.",
      },
    ],
  },
  {
    id: "pbm",
    problem: "Pharmacy middlemen control drug pricing with no oversight",
    sector: "Healthcare",
    description:
      "Pharmacy Benefit Managers (PBMs) negotiate drug prices between insurers and pharmacies \u2014 but they\u2019re vertically integrated with the insurers, creating conflicts of interest. Patients see the result at the counter: opaque pricing, restricted pharmacy choices, and surprise costs.",
    response: "Nation\u2019s first PBM watchdog bureau created",
    agency: "NYS DFS",
    date: "2024-09-01",
    outcome: "Bureau operational",
    outcomeVariant: "green",
  },
  {
    id: "con-review",
    problem:
      "Hospital mergers were approved too quickly to assess patient impact",
    sector: "Healthcare",
    description:
      "When hospital systems merge, patients in the affected area may lose access to competing providers. The previous 30-day review period didn\u2019t allow enough time to evaluate how a merger would affect patient choice, pricing, or service availability. Meanwhile, statewide hospital HHI rose 63% from 2015 to 2024 (680 to 1,105).",
    response:
      "CON review period extended to 60 days with post-merger reporting",
    agency: "NYS DOH",
    date: "2024-03-10",
    outcome: "Implemented",
    outcomeVariant: "green",
    crossRefs: [
      {
        text: "Finger Lakes: UR Medicine holds 46% of beds",
        href: "/healthcare/finger-lakes",
        detail:
          "UR Medicine (Strong Memorial) controls 46% of hospital beds in the Finger Lakes region (HHI 2,920). The region\u2019s consolidation accelerated through exactly the kind of system expansion that CON review is meant to evaluate.",
      },
      {
        text: "Long Island: Northwell holds 59% of beds",
        href: "/healthcare/long-island",
        detail:
          "Northwell Health controls 59% of beds on Long Island (HHI 2,850) \u2014 the most dominant single-system market in the state. Future mergers in this region face a high bar for demonstrating consumer benefit.",
      },
      {
        text: "Statewide consolidation trend",
        href: "/healthcare",
        detail:
          "The RAND Hospital Price Transparency Study (2024) found that market power \u2014 not payer mix or cost of care \u2014 explains most commercial price variation. NYS commercial prices exceed 300% of Medicare rates.",
      },
    ],
  },
];

const sectorColors: Record<string, "blue" | "green" | "yellow" | "gray"> = {
  Housing: "blue",
  Healthcare: "yellow",
};

export default function EnforcementPage() {
  const resolved = actions.filter(
    (a) => a.outcomeVariant === "green",
  ).length;
  const sectors = [...new Set(actions.map((a) => a.sector))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Regulatory Tracker" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">
          When markets don{"'"}t work — what New York did about it
        </h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          Real consumer problems, the regulatory response, and what our data
          shows about the markets where these problems occurred.
        </p>
      </div>

      {/* Lead with limitations — signals intellectual seriousness */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          What this tracker captures — and what it doesn{"'"}t
        </h2>
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            This is the hardest page on the site to get right. Regulatory
            action is one response to market problems, but it{"'"}s not the only
            one — and it{"'"}s not always the most effective. Some consumer harms
            reflect supply constraints (not enough housing, not enough
            broadband infrastructure) that enforcement alone can{"'"}t fix.
            Others involve genuine tradeoffs: extending hospital merger review
            periods adds scrutiny but also delays access to potential
            efficiencies.
          </p>
          <p>
            This tracker covers publicly announced actions from New York State
            agencies — not federal enforcement (FTC, DOJ), private litigation,
            or informal regulatory guidance. We include only actions that
            connect to sectors covered elsewhere on this platform, so you can
            see the market structure data alongside the policy response.
          </p>
          <p>
            <strong>The connection to data:</strong> Where possible, each
            entry below links to the relevant sector page on this site. Those
            cross-references are the point — they let you see what
            concentration, pricing, or ownership looked like in the markets
            where regulators intervened.
          </p>
        </div>
      </div>

      {/* Stats — below the framing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {actions.length}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            consumer problems tracked
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {resolved}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            resulted in action
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-patina">
            {sectors.length}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            sectors affected
          </div>
          <div className="text-xs text-fm-sage">
            {sectors.join(", ")}
          </div>
        </div>
      </div>

      {/* Actions list — problem first, with cross-references */}
      <div className="space-y-6">
        {actions.map((action) => (
          <div key={action.id} className="card">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-fm-patina text-lg">
                  {action.problem}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={sectorColors[action.sector] ?? "gray"}>
                    {action.sector}
                  </Badge>
                  <Badge variant={action.outcomeVariant}>
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
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {action.description}
            </p>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm">
                <span className="font-medium text-fm-patina">Response:</span>{" "}
                <span className="text-gray-700">{action.response}</span>
                <span className="text-fm-sage"> — {action.agency}</span>
              </p>
            </div>

            {/* Cross-references to data on other pages */}
            {action.crossRefs && action.crossRefs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-fm-sage uppercase tracking-wider mb-2">
                  See the data
                </p>
                <div className="space-y-2">
                  {action.crossRefs.map((ref) => (
                    <Link
                      key={ref.href}
                      href={ref.href}
                      className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors group"
                    >
                      <span className="text-sm font-medium text-fm-teal group-hover:underline">
                        {ref.text} &rarr;
                      </span>
                      <span className="block text-xs text-fm-sage mt-1">
                        {ref.detail}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
