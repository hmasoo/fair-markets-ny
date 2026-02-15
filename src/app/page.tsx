import Link from "next/link";
import { SpendingSection } from "./SpendingSection";
import { NeighborhoodSearch } from "./housing/NeighborhoodSearch";
import spendingData from "../../data/concentration/household-spending.json";
import neighborhoodDataRaw from "../../data/concentration/housing-neighborhoods.json";

const neighborhoods = (neighborhoodDataRaw as { neighborhoods: { name: string; slug: string; borough: string }[] }).neighborhoods;

const sectors = [
  {
    title: "Rental Housing",
    subtitle: "What renters pay across 197 neighborhoods",
    href: "/housing",
    description:
      "In some neighborhoods, a majority of renters spend more than half their income on housing. We joined Census income surveys, city property records, HPD violations, and rent data to show what people pay, what drives those costs, and how conditions vary across the city.",
    stat: "53%",
    statLabel: "of income goes to rent in the most burdened neighborhood",
  },
  {
    title: "Internet Access",
    subtitle: "Are you paying too much for internet?",
    href: "/broadband",
    description:
      "A 100 Mbps plan costs $30\u2013$50/mo from most wired providers \u2014 but many New Yorkers can\u2019t get that deal because no provider serves their area. We joined FCC filings and published ISP rates across all 62 counties to show what people pay and where they have no alternative.",
    stat: "$30\u2013$50",
    statLabel: "typical monthly cost for 100+ Mbps (intro rate)",
  },
  {
    title: "Hospital Costs",
    subtitle: "What does a hospital visit cost in your region?",
    href: "/healthcare",
    description:
      "Hospital prices vary dramatically by region \u2014 the same procedure can cost twice as much at one facility versus another. We joined facility data, cost reports, and system affiliations across 10 health planning regions to show what patients pay and why.",
    stat: "2\u00d7",
    statLabel: "price variation for common procedures across NY",
  },
  {
    title: "Getting to Work",
    subtitle: "What commuting costs across NYC",
    href: "/transportation",
    description:
      "A monthly MetroCard costs $132, but what you actually spend depends on where you live. In car-dependent neighborhoods, estimated commute costs top $500/month. We combined Census commute data with MTA fares and vehicle costs to map transportation spending by neighborhood.",
    stat: "$9,425",
    statLabel: "avg annual transport spending (NY metro)",
  },
  {
    title: "Regulatory Actions",
    subtitle: "When costs got bad enough that regulators stepped in",
    href: "/enforcement",
    description:
      "Algorithmic rent-setting that raised prices, hospital mergers that left patients with fewer options, pharmacy middlemen adding hidden costs. We track the consumer problems that prompted regulatory action in New York.",
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
            filings, facility reports — so you can see what people actually
            spend and what drives the differences. The data is open — explore
            it yourself.
          </p>
          <div className="mt-8">
            <NeighborhoodSearch
              neighborhoods={neighborhoods}
              variant="dark"
            />
          </div>
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
                Income, rent burden, and housing conditions vary widely across
                the city. We join four public datasets to show what renters pay,
                what drives those costs, and how conditions differ from one
                neighborhood to the next.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-fm-patina mb-2">
                Are you overpaying for internet?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Most wired broadband plans start at $30{"\u2013"}$50/mo — but
                if your only option is one ISP, you can{"\u2019"}t shop around.
                We show prices and availability county by county.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-fm-patina mb-2">
                Open data, open methodology
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every number comes from public government records — Census
                surveys, FCC filings, city property records, health facility
                reports. We document our sources so you can verify the data
                yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sector cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-fm-patina mb-8">
          Explore by topic
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
