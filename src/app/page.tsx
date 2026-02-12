import Link from "next/link";

const sectors = [
  {
    title: "The New Landlords",
    subtitle: "Housing & Landlord Concentration",
    href: "/housing",
    description:
      "In the South Bronx, 4 landlords control 1 in 4 rental units — in a neighborhood where zoning makes new construction nearly impossible. Concentration and supply scarcity, mapped.",
    stat: "8.1%",
    statLabel: "of NYC rental units owned by top 4 landlords",
  },
  {
    title: "One Wire",
    subtitle: "Broadband & Utility Monopolies",
    href: "/broadband",
    description:
      "42% of census blocks in St. Lawrence County have zero broadband providers. Check your county.",
    stat: "3,250",
    statLabel: "Statewide concentration score",
  },
  {
    title: "Your Doctor's Boss",
    subtitle: "Healthcare Consolidation",
    href: "/healthcare",
    description:
      "When hospitals merge, your ER options shrink. See which health systems dominate your region's hospital beds.",
    stat: "3,450",
    statLabel: "Highest regional HHI (North Country)",
  },
  {
    title: "After the Merger",
    subtitle: "AG & State Enforcement Tracker",
    href: "/enforcement",
    description:
      "What happens after the merger? Track NY Attorney General actions on antitrust and corporate consolidation.",
    stat: "Coming Soon",
    statLabel: "AG press releases & court filings",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-fm-patina text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">
            Why does your rent keep rising?
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
            Concentrated ownership and supply scarcity drive up costs and
            shrink choices — and they reinforce each other. Fair Markets NY
            uses public records to map both: who controls New York{"'"}s
            essential markets, and what keeps new competitors out.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/housing"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-fm-copper text-white font-semibold hover:bg-amber-700 transition-colors"
            >
              Explore Housing
            </Link>
            <Link
              href="/broadband"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              See Broadband Data
            </Link>
          </div>
        </div>
      </section>

      {/* How it affects you */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-fm-patina mb-2">
                Fewer landlords, fewer buildings
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                When one company owns half the buildings on your block and
                zoning blocks new construction, no one can compete with them.
                We map ownership concentration and the supply conditions that
                entrench it.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-fm-patina mb-2">
                One internet provider, no choice
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Most New Yorkers can{"'"}t switch ISPs. That{"'"}s not a free
                market. We show how many options you actually have, county by
                county.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-fm-patina mb-2">
                We follow the data
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Using public government records, we measure who controls
                essential markets and where competition is missing — so you
                can see it too. No paywalls, no subscriptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sector cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-fm-patina mb-8">
          What We Track
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

      {/* Beta notice */}
      <section className="bg-amber-50 border-t border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-sm text-amber-800">
            <strong>Beta:</strong> This project is under active development.
            Concentration calculations may contain errors or use preliminary
            data. If you spot an issue, please{" "}
            <a
              href="https://github.com/masuga-fair-markets/fair-markets-ny/issues"
              className="underline hover:text-amber-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              open an issue
            </a>
            .
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-sm text-fm-sage">
            All data comes from public government sources.{" "}
            <Link
              href="/about"
              className="text-fm-teal font-medium hover:underline"
            >
              Learn about our methodology and data sources
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
