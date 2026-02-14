import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "When Markets Don't Work — What New York Did About It",
  description:
    "Real consumer problems and how New York regulators responded — from algorithmic rent-setting to hospital mergers to nursing home quality.",
};

const actions = [
  {
    id: "realpage",
    problem: "Landlords were using the same software to set rents",
    sector: "Housing",
    description:
      "RealPage's revenue management tool let large landlords feed their pricing data into a shared algorithm that recommended rent increases — effectively coordinating prices without a phone call. Tenants in buildings using the software paid more than comparable units nearby.",
    response: "First-in-nation ban on algorithmic rent-setting",
    agency: "NYS Legislature / Governor",
    date: "2024-12-20",
    outcome: "Signed into law",
    outcomeVariant: "green" as const,
  },
  {
    id: "pe-nursing",
    problem: "Private equity firms bought nursing homes, then cut staffing",
    sector: "Healthcare",
    description:
      "When PE firms acquire nursing homes, research shows they often reduce staffing to boost returns. Residents and families noticed declining care quality — more falls, slower response times, fewer activities — but had no visibility into who actually owned the facility.",
    response: "AG investigation into PE nursing home acquisitions",
    agency: "NY Attorney General",
    date: "2024-06-15",
    outcome: "Investigation ongoing",
    outcomeVariant: "yellow" as const,
  },
  {
    id: "pbm",
    problem: "Pharmacy middlemen control drug pricing with no oversight",
    sector: "Healthcare",
    description:
      "Pharmacy Benefit Managers (PBMs) negotiate drug prices between insurers and pharmacies — but they're vertically integrated with the insurers, creating conflicts of interest. Patients see the result at the counter: opaque pricing, restricted pharmacy choices, and surprise costs.",
    response: "Nation's first PBM watchdog bureau created",
    agency: "NYS DFS",
    date: "2024-09-01",
    outcome: "Bureau operational",
    outcomeVariant: "green" as const,
  },
  {
    id: "con-review",
    problem: "Hospital mergers were approved too quickly to assess patient impact",
    sector: "Healthcare",
    description:
      "When hospital systems merge, patients in the affected area may lose access to competing providers. The previous 30-day review period didn't allow enough time to evaluate how a merger would affect patient choice, pricing, or service availability.",
    response: "CON review period extended to 60 days with post-merger reporting",
    agency: "NYS DOH",
    date: "2024-03-10",
    outcome: "Implemented",
    outcomeVariant: "green" as const,
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
  const ongoing = actions.filter(
    (a) => a.outcomeVariant === "yellow",
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
          Algorithmic rent-setting. Hospital mergers that reduce patient
          choices. Pharmacy middlemen with no oversight. These are real
          problems New Yorkers face — and in some cases, regulators have
          stepped in. Here{"'"}s what happened.
        </p>
      </div>

      {/* Stats — consumer-facing */}
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

      {/* How to read this + caveats — lead with limitations */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          How to read this page
        </h2>
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            Each entry starts with the consumer problem — what people
            experienced — followed by the regulatory or legislative response.
            Not every market problem gets fixed, and not every fix works. We
            track both the interventions and the outcomes so you can judge for
            yourself.
          </p>
          <p>
            <strong>What this tracker doesn{"\u2019"}t capture:</strong>{" "}
            Regulatory action is one response to market problems, but it{"\u2019"}s
            not the only one — and it{"\u2019"}s not always the most effective.
            Some consumer harms reflect supply constraints (not enough housing,
            not enough broadband infrastructure) that enforcement alone
            can{"\u2019"}t fix. Others involve tradeoffs: extending hospital merger
            review periods adds scrutiny but also delays access to potential
            efficiencies. This tracker covers publicly announced actions from
            New York State agencies — not federal enforcement (FTC, DOJ),
            private litigation, or informal regulatory guidance.
          </p>
        </div>
      </div>

      {/* Actions list — problem first */}
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
          </div>
        ))}
      </div>

      {/* Cross-references to other pages */}
      <div className="card mt-8">
        <h2 className="text-lg font-bold text-fm-patina mb-2">
          Related data on this site
        </h2>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            The problems tracked here connect to data elsewhere on the
            platform. The{" "}
            <a href="/housing" className="text-fm-teal hover:underline font-medium">housing page</a>{" "}
            shows ownership concentration in the neighborhoods where
            algorithmic rent-setting tools were used. The{" "}
            <a href="/healthcare" className="text-fm-teal hover:underline font-medium">healthcare page</a>{" "}
            maps hospital system dominance across the regions where CON
            reviews and PE acquisitions are most relevant.
          </p>
        </div>
      </div>
    </div>
  );
}
