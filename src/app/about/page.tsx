import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "How to Read This Data",
  description:
    "A plain-language guide to the numbers on Fair Markets NY — what we measure, where the data comes from, and what it can and can't tell you.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "How to Read This Data" }]} />

      <h1 className="text-3xl font-bold text-fm-patina mb-6">
        How to read this data
      </h1>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-amber-800">
          <strong>Beta Project:</strong> Fair Markets NY is under active
          development. Numbers may contain errors, use preliminary data, or
          reflect incomplete source coverage. If you spot an issue, please{" "}
          <a
            href="https://github.com/masuga-fair-markets/fair-markets-ny/issues"
            className="underline hover:text-amber-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            open an issue on GitHub
          </a>
          .
        </p>
      </div>

      <div className="space-y-8">
        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            What this site does
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              Fair Markets NY takes public government records — property
              ownership filings, FCC broadband data, hospital facility
              reports, Census income surveys — and organizes them so you can
              see what people pay for the basics, how many choices they have,
              and who controls the market.
            </p>
            <p>
              We don{"'"}t editorialize about what the numbers mean. We show
              you the data, explain what it can and can{"'"}t tell you, and
              let you draw your own conclusions.
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            What the numbers mean
          </h2>
          <div className="space-y-5 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                Rent burden
              </h3>
              <p>
                The share of renters in a neighborhood who spend 30% or more
                of their income on rent. That 30% line comes from HUD — it{"'"}s
                the standard threshold for housing affordability. When we
                say a neighborhood has 60% rent burden, it means 6 out of 10
                renters there are paying more than that threshold.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                Median household income
              </h3>
              <p>
                The income level where half of households earn more and half
                earn less, from the Census Bureau{"'"}s American Community
                Survey. We aggregate tract-level data to the neighborhood
                level using a household-weighted average — so bigger tracts
                count more.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                {'"'}5 companies own X% of rentals{'"'}
              </h3>
              <p>
                When we say a small number of companies control a large share
                of units in a neighborhood, that{"'"}s a{" "}
                <strong>concentration ratio</strong> — the combined share of
                the top firms. Economists call the top-4 version {'"'}CR4.{'"'}{" "}
                A CR4 above 60% means the four biggest landlords own more
                than half the units. We use plain language on sector pages
                and include the technical number for researchers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                Provider count (broadband)
              </h3>
              <p>
                How many internet service providers offer wired broadband at
                100 Mbps or faster to a given census block — roughly a city
                block. A count of {'"'}0{'"'} means no wired broadband at
                that speed. {'"'}1{'"'} means you have one option — take it
                or leave it.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                HPD violations per unit
              </h3>
              <p>
                NYC{"'"}s Department of Housing Preservation and Development
                (HPD) issues violations when inspectors find problems —
                peeling lead paint, no heat, broken plumbing. We divide the
                violation count by the number of units a landlord or
                neighborhood has, so you can compare buildings of different
                sizes fairly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                Rent-stabilized share
              </h3>
              <p>
                The percentage of rental units in a neighborhood that are
                rent-stabilized under NYC{"'"}s Rent Guidelines Board. These
                units have legally limited annual rent increases — but that
                doesn{"'"}t mean they{"'"}re cheap. A high stabilized share
                means tenants have some price protection; a low one means
                the market sets rents with fewer constraints.
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            For researchers: the technical metrics
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              The plain-language summaries on each page are backed by standard
              industrial organization metrics. If you{"'"}re doing your own
              analysis, here{"'"}s what we calculate:
            </p>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                HHI (Herfindahl-Hirschman Index)
              </h3>
              <p>
                Sum of each firm{"'"}s squared market share percentage. Scale:
                0 (perfect competition) to 10,000 (monopoly). The DOJ
                considers markets above 2,500 {'"'}highly concentrated.{'"'}{" "}
                We show HHI in tooltips and detail pages, not as headline
                stats, because the number means nothing without context.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                CR4 (Four-Firm Concentration Ratio)
              </h3>
              <p>
                Combined market share of the four largest firms. Above 60%
                is generally considered oligopolistic; above 80% approaches
                monopoly power. We use this more than HHI on sector pages
                because {'"'}the top 4 companies own X%{'"'} is a sentence
                people can parse.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                Geographic granularity
              </h3>
              <p>
                Market concentration varies dramatically by geography. The
                NYC rental market looks competitive at the citywide level
                (HHI ~228) but is highly concentrated at the neighborhood
                level. We present data at both levels so you can assess
                conditions at the scale most relevant to your question.
              </p>
            </div>
          </div>
        </section>

        <section id="understanding-concentration" className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            What the data can{"'"}t tell you
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              Concentration numbers measure <em>ownership structure</em> —
              who owns what and how much. They don{"'"}t tell you <em>why</em>{" "}
              a market looks the way it does. A few things to keep in mind:
            </p>
            <p>
              <strong>Multiple causes:</strong> High rents can reflect
              concentrated ownership, but they can also reflect zoning that
              limits new construction, high land costs, or strong demand.
              Usually it{"'"}s several factors at once. We present
              concentration as one lens, not the only one.
            </p>
            <p>
              <strong>The rent stabilization paradox:</strong> In
              neighborhoods where regulated rents haven{"'"}t kept pace with
              operating costs, landlords face a squeeze. Some of the
              violations in our data reflect underinvestment from that cost
              squeeze — not just extractive ownership. Armlovich{"'"}s{" "}
              <a
                href="https://niskanencenter.org/wp-content/uploads/2025/06/Armlovich-RGB-Testimony-June-2025.pdf"
                className="text-fm-teal hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                RGB analysis
              </a>{" "}
              shows that real rent guideline increases have been negative
              since ~2015, putting particular pressure on pre-1974 buildings
              outside Manhattan.
            </p>
            <p>
              <strong>Planned developments:</strong> Some of NYC{"'"}s most
              concentrated neighborhoods are planned developments
              (Stuyvesant Town, Starrett City) or cooperatives (Co-op City)
              where high concentration reflects the development{"'"}s
              structure, not market failure. Tenant protections in these
              developments may be <em>stronger</em> than in fragmented
              markets.
            </p>
            <p>
              <strong>Supply matters:</strong> The Niskanen Center{"'"}s{" "}
              <a
                href="https://niskanencenter.org/senate-banking-housing-testimony-2025/"
                className="text-fm-teal hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                housing research
              </a>{" "}
              argues that removing supply barriers — lot-size minimums,
              single-family zoning, permitting delays — would do more for
              affordability than targeting individual landlords.
              Concentration data and supply-side analysis are complements,
              not competitors.
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            Where the data comes from
          </h2>
          <div className="text-sm text-gray-700 space-y-3 mb-4">
            <p>
              Every number on this site comes from a public government
              source. We don{"'"}t use private databases, paywalled
              aggregators, or proprietary estimates. Here{"'"}s what we pull
              from and how:
            </p>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            {[
              {
                name: "NYC Open Data (ACRIS, PLUTO, HPD)",
                what: "Property ownership records, land use, housing violations",
                legal: "Unrestricted public data (Local Law 11 of 2012)",
              },
              {
                name: "U.S. Census Bureau ACS 5-Year Estimates",
                what: "Tract-level median income and rent burden, aggregated to neighborhoods",
                legal: "Federal public domain",
              },
              {
                name: "NYS DHCR Rent Stabilization Counts",
                what: "Building-level counts of rent-stabilized units, aggregated by neighborhood",
                legal: "NYS public records",
              },
              {
                name: "FCC Broadband Data Collection",
                what: "ISP availability at census block level — who serves where, at what speed",
                legal: "Federal public domain",
              },
              {
                name: "NYC Local Law 18 Filings",
                what: "Beneficial ownership disclosures that let us trace LLCs to real owners",
                legal: "NYC public records",
              },
              {
                name: "NYS DOH Facility Data",
                what: "Hospital and health facility information, Certificate of Need filings",
                legal: "NYS Open Data permissive license",
              },
              {
                name: "NY Attorney General Press Releases",
                what: "Enforcement actions and settlement announcements",
                legal: "NYS government publications",
              },
              {
                name: "CMS Hospital Price Transparency",
                what: "Machine-readable hospital pricing data required by federal regulation",
                legal: "Federal public domain",
              },
            ].map((source) => (
              <div
                key={source.name}
                className="border-l-2 border-fm-teal pl-4"
              >
                <h3 className="font-semibold text-fm-patina">{source.name}</h3>
                <p className="mt-1">{source.what}</p>
                <p className="mt-1 text-xs text-fm-sage">{source.legal}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            Legal basis
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              Everything on this site is derived from public government
              records. The legal basis is straightforward:
            </p>
            <ul className="space-y-2 ml-4 list-disc">
              <li>
                <strong>Federal data</strong> (Census, FCC, CMS) is public
                domain under 17 USC &sect; 105.
              </li>
              <li>
                <strong>New York State data</strong> is published under a
                permissive license with no attribution or share-alike
                requirements.
              </li>
              <li>
                <strong>New York City data</strong> is covered by Local Law
                11 of 2012, which requires all public datasets be published
                on the Open Data portal. The city states: {'"'}There are no
                restrictions on the use of open data.{'"'}
              </li>
            </ul>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            Open source, open methods
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              The{" "}
              <a
                href="https://github.com/masuga-fair-markets/fair-markets-ny"
                className="text-fm-teal hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                full source code
              </a>{" "}
              for this site is public. Our scraping scripts, aggregation
              logic, and calculations are all auditable — anyone can verify
              our numbers or build on our work.
            </p>
            <p>
              We build this site to{" "}
              <a
                href="https://www.section508.gov/"
                className="text-fm-teal hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Section 508
              </a>{" "}
              and WCAG 2.0 Level AA standards. Charts include text
              descriptions for screen readers, interactive elements are
              keyboard-navigable, and color is never the sole way we
              communicate meaning.
            </p>
            <p>
              If you encounter an accessibility barrier, please{" "}
              <a
                href="https://github.com/masuga-fair-markets/fair-markets-ny/issues"
                className="text-fm-teal hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                open an issue
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
