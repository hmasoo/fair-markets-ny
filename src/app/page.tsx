import Link from "next/link";
import { SpendingSection } from "./SpendingSection";
import spendingData from "../../data/concentration/household-spending.json";

const sectors = [
  {
    title: "Rental Housing",
    subtitle: "What renters pay, who owns the buildings",
    href: "/housing",
    description:
      "In some neighborhoods, a majority of renters spend more than half their income on housing. We combined city ownership records, Census income data, and HPD violations to show affordability, maintenance, and ownership across all 197 NYC neighborhoods.",
    stat: "53%",
    statLabel: "of income goes to rent in the most burdened neighborhood",
  },
  {
    title: "Internet Access",
    subtitle: "Broadband choices by county",
    href: "/broadband",
    description:
      "42% of census blocks in St. Lawrence County have zero broadband providers at 100 Mbps. How many choices does your county have?",
    stat: "0",
    statLabel: "broadband options in thousands of NY census blocks",
  },
  {
    title: "Hospital Systems",
    subtitle: "Who runs the hospitals in your region?",
    href: "/healthcare",
    description:
      "In parts of upstate New York, a single hospital system accounts for over half of all beds. We joined facility data, bed counts, and system ownership records across 10 health planning regions so you can see who runs the hospitals near you.",
    stat: "57%",
    statLabel: "of beds held by one system (North Country)",
  },
  {
    title: "Regulatory Actions",
    subtitle: "When markets don't work, who steps in?",
    href: "/enforcement",
    description:
      "Algorithmic rent-setting, hospital mergers that reduce patient choices, pharmacy middlemen with no oversight. We track the consumer problems and how New York regulators responded.",
    stat: "4",
    statLabel: "consumer problems tracked",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-fm-patina text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl">
            What New Yorkers pay for the basics — and why
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
            Housing, internet, healthcare, transportation. We join public
            government datasets — ownership records, Census surveys, FCC
            filings, facility reports — so you can see what people spend, how
            many choices they have, and what drives the differences. The data is
            open — explore it yourself.
          </p>
        </div>
      </section>

      {/* Household spending */}
      <SpendingSection data={spendingData} />

      {/* How it affects you */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-fm-patina mb-2">
                What does rent cost in your neighborhood?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Income, rent burden, housing violations, and ownership patterns
                vary widely across the city. We map affordability and
                maintenance alongside the supply conditions that shape each
                market.
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
            Data calculations may contain errors or use preliminary
            sources. If you spot an issue, please{" "}
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
              Learn how to read this data
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
