import Link from "next/link";

const sectors = [
  {
    title: "Rental Ownership",
    subtitle: "Housing & Ownership Patterns",
    href: "/housing",
    description:
      "In the South Bronx, the top 4 landlords hold about 1 in 4 rental units — while zoning limits new construction. How concentrated is rental ownership in your neighborhood, and what shapes it?",
    stat: "8.1%",
    statLabel: "of NYC rental units owned by top 4 landlords",
  },
  {
    title: "Internet Access",
    subtitle: "Broadband Competition by County",
    href: "/broadband",
    description:
      "42% of census blocks in St. Lawrence County have zero broadband providers at 100 Mbps. How many choices does your county have?",
    stat: "3,250",
    statLabel: "Statewide concentration score",
  },
  {
    title: "Hospital Systems",
    subtitle: "Healthcare Market Structure",
    href: "/healthcare",
    description:
      "How many hospital systems operate in your region? In parts of upstate New York, a single system accounts for over half of all beds. See the data by region.",
    stat: "3,450",
    statLabel: "Highest regional HHI (North Country)",
  },
  {
    title: "Regulatory Actions",
    subtitle: "State Enforcement & Policy Tracker",
    href: "/enforcement",
    description:
      "A public record of competition-related enforcement actions, regulatory decisions, and legislation across New York State agencies.",
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
            How competitive are New York{"'"}s essential markets?
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
            From rental housing to broadband to healthcare, Fair Markets NY
            uses public government records to measure ownership, competition,
            and the conditions that shape your choices. Where are markets
            working? Where could more supply or more competition make a
            difference? The data is open — explore it yourself.
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
                Who owns the rentals on your block?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ownership patterns vary widely by neighborhood. We map how
                concentrated rental ownership is, alongside the zoning and
                supply conditions that shape each market.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-fm-patina mb-2">
                How many internet providers serve your area?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                In many parts of New York, residents have one or two options
                for wired broadband. We show provider availability county by
                county, using FCC filing data.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-fm-patina mb-2">
                Open data, open methodology
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every number comes from public government records — ownership
                filings, FCC data, health facility reports. We document our
                sources so you can verify the data yourself.
              </p>
            </div>
          </div>
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
