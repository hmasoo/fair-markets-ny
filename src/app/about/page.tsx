import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "About & Methodology",
  description:
    "How Fair Markets NY collects, structures, and presents government data on market concentration across New York State.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "About & Methodology" }]} />

      <h1 className="text-3xl font-bold text-fm-patina mb-6">
        About & Methodology
      </h1>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-amber-800">
          <strong>Beta Project:</strong> Fair Markets NY is under active
          development. Concentration metrics and market share calculations may
          contain errors, use preliminary data, or reflect incomplete source
          coverage. We are continuously refining our methodology. If you spot an
          issue, please{" "}
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
            What is Fair Markets NY?
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              Fair Markets NY is a public data project that measures market
              competition and ownership structure across New York State, with
              a deep NYC layer.
            </p>
            <p>
              Policymakers, researchers, and residents are asking questions
              about competition in the markets that shape everyday life —
              housing, broadband, healthcare, and more. This project provides
              an accessible, transparent evidence base built from public
              government records.
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            Why This Data Matters
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              New York has active policy debates about housing supply,
              broadband access, and healthcare competition. These debates
              benefit from accessible data on market structure — who owns
              what, how many choices residents have, and how conditions vary
              by geography.
            </p>
            <p>
              Recent policy developments include the nation{"'"}s first
              algorithmic rent-setting ban, a $1B public broadband
              investment, and extended review periods for hospital mergers.
              Whether these policies are well-targeted depends on understanding
              local market conditions — questions that are empirical, not
              ideological.
            </p>
            <p>
              Fair Markets NY organizes public government data so that
              residents, policymakers, and researchers can examine market
              structure for themselves and form their own conclusions.
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">Glossary</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                HHI — Herfindahl-Hirschman Index
              </h3>
              <p>
                A measure of market concentration calculated by summing the
                squares of each firm{"'"}s market share percentage. Scale: 0
                (perfect competition) to 10,000 (monopoly). The DOJ considers
                markets above 2,500 {'"'}highly concentrated.{'"'} Not to be
                confused with household income.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                MHI — Median Household Income
              </h3>
              <p>
                The income level at which half of households earn more and half
                earn less, from the U.S. Census Bureau{"'"}s American Community
                Survey 5-Year Estimates. We aggregate tract-level data to
                neighborhood level using a household-weighted average.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                Rent Burden
              </h3>
              <p>
                The percentage of renter households paying 30% or more of their
                income toward rent, the standard threshold set by HUD. Areas
                above 50% are considered severely rent-burdened.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-1">
                CR4 — Four-Firm Concentration Ratio
              </h3>
              <p>
                The combined market share of the four largest firms in a market.
                A CR4 above 60% is generally considered oligopolistic; above 80%
                approaches monopoly power.
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">Methodology</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-fm-patina mb-2">
                Herfindahl-Hirschman Index (HHI)
              </h3>
              <p>
                The HHI is calculated by summing the squares of each firm{"'"}s
                market share percentage. The DOJ and FTC use the following
                thresholds:
              </p>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                <li>
                  <strong>Below 1,500:</strong> Competitive (unconcentrated)
                </li>
                <li>
                  <strong>1,500 – 2,500:</strong> Moderately concentrated
                </li>
                <li>
                  <strong>Above 2,500:</strong> Highly concentrated
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-fm-patina mb-2">
                Concentration Ratio (CR4)
              </h3>
              <p>
                The CR4 is the combined market share of the four largest firms in
                a market. A CR4 above 60% is generally considered oligopolistic;
                above 80% approaches monopoly power.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-fm-patina mb-2">
                Geographic Granularity
              </h3>
              <p>
                Market concentration varies dramatically by geography. The NYC
                rental market looks competitive at the citywide level (HHI ~228)
                but is highly concentrated at the neighborhood level. We present
                data at both levels so readers can assess conditions at the
                level most relevant to their experience.
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            Understanding Market Concentration
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              <strong>Supply and ownership:</strong> Market concentration can
              reflect barriers to entry, economies of scale, acquisition
              strategies, or all three. In housing, for example, zoning and
              permitting constraints limit new construction, which can
              contribute to ownership concentration by reducing the number of
              market participants. Researchers are actively studying the
              relative contribution of these factors.
            </p>
            <p>
              <strong>The rent stabilization paradox:</strong> In neighborhoods
              where regulated rents haven{"'"}t kept pace with operating costs,
              landlords face a squeeze: revenue doesn{"'"}t cover maintenance. The
              result shows up in our violations data — but some of those
              violations reflect underinvestment from the cost squeeze, not just
              extractive ownership. Armlovich{"'"}s{" "}
              <a
                href="https://niskanencenter.org/wp-content/uploads/2025/06/Armlovich-RGB-Testimony-June-2025.pdf"
                className="text-fm-teal hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                RGB analysis
              </a>{" "}
              shows that real (inflation-adjusted) rent guideline increases have
              been negative since ~2015, putting particular pressure on pre-1974
              buildings outside Manhattan.
            </p>
            <p>
              <strong>What this means for the data:</strong> Our concentration
              metrics measure <em>ownership structure</em> — not the causes
              behind it. A neighborhood can have both concentrated ownership and
              constrained supply. The Niskanen Center{"'"}s{" "}
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
              affordability than targeting individual landlords. Readers and
              policymakers can draw their own conclusions. Concentration data
              and supply-side analysis are complements, not competitors.
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">Data Sources</h2>
          <div className="space-y-3 text-sm text-gray-700">
            {[
              {
                name: "NYC Open Data (ACRIS, PLUTO, HPD)",
                description:
                  "Property ownership records, land use data, and housing violations. Governed by Local Law 11 of 2012. No restrictions on use.",
                legal: "Unrestricted public data",
              },
              {
                name: "U.S. Census Bureau ACS 5-Year Estimates",
                description:
                  "Tract-level median household income (B19013) and gross rent as a percentage of household income (B25070), aggregated to neighborhood level. Used for affordability context alongside concentration metrics.",
                legal: "Federal public domain (17 USC § 105)",
              },
              {
                name: "FCC Broadband Data Collection",
                description:
                  "ISP availability at census block level. REST API access to broadband availability filings.",
                legal: "Federal public domain (17 USC § 105)",
              },
              {
                name: "NYC Local Law 18 Filings",
                description:
                  "Beneficial ownership disclosures for residential buildings, enabling LLC entity resolution.",
                legal: "NYC public records",
              },
              {
                name: "NYS DOH Facility Data",
                description:
                  "Hospital and health facility information, Certificate of Need filings.",
                legal: "NYS Open Data permissive license",
              },
              {
                name: "NY Attorney General Press Releases",
                description:
                  "Antitrust enforcement actions and settlement announcements.",
                legal: "NYS government publications",
              },
              {
                name: "FDIC Summary of Deposits",
                description:
                  "Bank branch deposits by county for market share calculation.",
                legal: "Federal public domain",
              },
              {
                name: "CMS Hospital Price Transparency",
                description:
                  "Machine-readable hospital pricing data required by federal regulation, enabling cost comparisons across health systems.",
                legal: "Federal public domain (17 USC § 105)",
              },
              {
                name: "NYS DFS Market Share Reports",
                description:
                  "Insurance market share data published by the NY Department of Financial Services, covering property, casualty, and health insurance markets.",
                legal: "NYS government publications",
              },
            ].map((source) => (
              <div
                key={source.name}
                className="border-l-2 border-fm-teal pl-4"
              >
                <h3 className="font-semibold text-fm-patina">{source.name}</h3>
                <p className="mt-1">{source.description}</p>
                <p className="mt-1 text-xs text-fm-sage">{source.legal}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            Legal Framework
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              This project aggregates, structures, and republishes data from
              government sources. The legal basis is strong across all three
              tiers of government:
            </p>
            <ul className="space-y-2 ml-4 list-disc">
              <li>
                <strong>Federal:</strong> 17 USC § 105 places all works of the
                US Government in the public domain.
              </li>
              <li>
                <strong>New York State:</strong> Open NY portal data is published
                under a permissive license with no attribution or share-alike
                requirements.
              </li>
              <li>
                <strong>New York City:</strong> Local Law 11 of 2012 requires all
                public datasets be published on the Open Data portal. The city
                states explicitly: {'"'}There are no restrictions on the use of
                open data.{'"'}
              </li>
            </ul>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            Accessibility & Open Methods
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              Public data should be accessible to the public. We build this
              site with{" "}
              <a
                href="https://www.section508.gov/"
                className="text-fm-teal hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Section 508
              </a>{" "}
              and WCAG 2.0 Level AA standards as our target — the same
              accessibility baseline the federal government requires for its
              own websites.
            </p>
            <div>
              <h3 className="font-semibold text-fm-patina mb-2">
                What that means in practice
              </h3>
              <ul className="space-y-1 ml-4 list-disc">
                <li>
                  Charts and maps include text descriptions so screen reader
                  users can access the same data
                </li>
                <li>
                  All interactive elements (tables, toggles, tooltips) are
                  keyboard-navigable
                </li>
                <li>
                  Color is never the sole way we communicate meaning —
                  labels, patterns, and text reinforce visual encoding
                </li>
                <li>
                  Text meets contrast ratio standards against all backgrounds
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-fm-patina mb-2">
                Open source, open data
              </h3>
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
                for this site is public. Every data point cites its government
                source. Our scraping scripts, aggregation logic, and
                concentration calculations are all auditable — anyone can
                verify our numbers or build on our work.
              </p>
            </div>
            <p>
              Accessibility is a work in progress. If you encounter a barrier
              using this site, please{" "}
              <a
                href="https://github.com/masuga-fair-markets/fair-markets-ny/issues"
                className="text-fm-teal hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                open an issue
              </a>{" "}
              and we{"'"}ll address it.
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            Project Background
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              This project builds on the approach of two precedent data
              transparency efforts:
            </p>
            <ul className="space-y-2 ml-4 list-disc">
              <li>
                <strong>CAMP (Canadian Anti-Monopoly Project)</strong> —
                structured concentration data using standard DOJ/FTC
                measurement tools (HHI, CR4) with methodology-transparent
                market share analysis, applied sector by sector.
              </li>
              <li>
                <strong>NLRB Edge / NLRB Research (Matt Bruenig)</strong> —
                automated government data scraping combined with a searchable
                database and analysis layer, demonstrating that structured
                access to public records can make government data more useful
                to researchers and the public.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
