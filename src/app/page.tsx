import Link from "next/link";

const sectors = [
  {
    title: "The New Landlords",
    subtitle: "Housing & Landlord Concentration",
    href: "/housing",
    description:
      "Who owns your building? Mapping residential ownership concentration across NYC neighborhoods using ACRIS and PLUTO data.",
    stat: "8.1%",
    statLabel: "of NYC rental units owned by top 4 landlords",
    tier: 1,
  },
  {
    title: "One Wire",
    subtitle: "Broadband & Utility Monopolies",
    href: "/broadband",
    description:
      "How many real choices do you have for internet? FCC data reveals a broadband duopoly across most of New York State.",
    stat: "3,250",
    statLabel: "HHI — highly concentrated market",
    tier: 1,
  },
  {
    title: "Your Doctor's Boss",
    subtitle: "Healthcare Consolidation",
    href: "/healthcare",
    description:
      "Hospital mergers, PE acquisitions of physician practices, and PBM concentration across New York.",
    stat: "Coming Soon",
    statLabel: "CON filings & health system mapping",
    tier: 1,
  },
  {
    title: "After the Merger",
    subtitle: "AG & State Enforcement Tracker",
    href: "/enforcement",
    description:
      "Tracking antitrust enforcement actions by the NY Attorney General and state agencies.",
    stat: "Coming Soon",
    statLabel: "AG press releases & court filings",
    tier: 2,
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-fm-patina text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">
            Who controls the markets that shape your daily life?
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
            Fair Markets NY tracks market concentration, corporate consolidation,
            and their impact on affordability across New York State — built on
            government data, open to everyone.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/housing"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-fm-copper text-white font-semibold hover:bg-amber-700 transition-colors"
            >
              Explore Housing Data
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
            >
              Our Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* Context bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-fm-sage leading-relaxed max-w-4xl">
            New York has two converging political agendas that both need data
            infrastructure.{" "}
            <strong className="text-fm-patina">Mayor Zohran Mamdani</strong> — an
            anti-monopoly administration with Lina Khan co-chairing his
            transition team.{" "}
            <strong className="text-fm-patina">Governor Kathy Hochul</strong> — a
            targeted affordability agenda including the nation{"'"}s first
            algorithmic rent-setting ban and $1B public broadband commitment.
            Both respond to the same underlying problem:{" "}
            <strong className="text-fm-patina">
              concentrated corporate power driving up the cost of living.
            </strong>
          </p>
        </div>
      </section>

      {/* Sector cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-fm-patina mb-8">
          Research Areas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sectors.map((sector) => (
            <Link
              key={sector.href}
              href={sector.href}
              className="card group hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-medium text-fm-sage uppercase tracking-wider">
                    Tier {sector.tier}
                  </span>
                  <h3 className="text-lg font-bold text-fm-patina group-hover:text-fm-teal transition-colors">
                    {sector.title}
                  </h3>
                  <p className="text-sm text-fm-sage">{sector.subtitle}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-2xl font-bold text-fm-copper">
                    {sector.stat}
                  </div>
                  <div className="text-xs text-fm-sage max-w-[140px]">
                    {sector.statLabel}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {sector.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Data sources */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-bold text-fm-patina mb-6">
            Built on Government Data
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm text-fm-sage">
            {[
              "NYC Open Data (ACRIS, PLUTO, HPD)",
              "FCC Broadband Data Collection",
              "NYS DOH Facility Data",
              "NYS DFS Market Share Reports",
              "NY Attorney General Press Releases",
              "FDIC Summary of Deposits",
              "CMS Hospital Price Transparency",
              "NYC Local Law 18 Filings",
            ].map((source) => (
              <div key={source} className="flex items-start gap-2">
                <span className="text-fm-teal mt-0.5 shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                {source}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
