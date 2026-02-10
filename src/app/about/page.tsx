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

      <div className="space-y-8">
        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            What is Fair Markets NY?
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              Fair Markets NY is a public-interest data site tracking market
              concentration, corporate consolidation, and their impact on
              affordability across New York State, with a deep NYC layer.
            </p>
            <p>
              The project provides the shared evidence base for New York{"'"}s
              converging political agendas: Mayor Zohran Mamdani{"'"}s
              anti-monopoly administration and Governor Kathy Hochul{"'"}s
              targeted affordability agenda. Both respond to the same underlying
              problem — concentrated corporate power driving up the cost of
              living.
            </p>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold text-fm-patina mb-4">
            NYS Policy Context
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              New York has two converging political agendas that both need data
              infrastructure — and both respond to the same underlying problem:
              concentrated corporate power driving up the cost of living.
            </p>
            <p>
              <strong className="text-fm-patina">
                Mayor Zohran Mamdani
              </strong>{" "}
              is leading an anti-monopoly administration in New York City, with
              Lina Khan co-chairing his transition team. His agenda targets
              corporate landlords, platform monopolies, and concentrated market
              power across the sectors that shape everyday life for New Yorkers.
            </p>
            <p>
              <strong className="text-fm-patina">
                Governor Kathy Hochul
              </strong>{" "}
              is pursuing a targeted affordability agenda at the state level,
              including the nation{"'"}s first algorithmic rent-setting ban and
              a $1B public broadband commitment. These policies address
              specific symptoms of market concentration — from housing costs
              driven by corporate landlords to broadband deserts maintained by
              monopoly ISPs.
            </p>
            <p>
              Fair Markets NY provides the shared evidence base for both
              agendas: structured, public data on who controls the markets that
              matter most to New Yorkers.
            </p>
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
                data at both levels to avoid masking local monopoly power.
              </p>
            </div>
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
            Intellectual Foundations
          </h2>
          <div className="text-sm text-gray-700 space-y-3">
            <p>
              This project draws from the {'"'}New Brandeis{'"'} school of
              antitrust thinking and is modeled on two direct precedents:
            </p>
            <ul className="space-y-2 ml-4 list-disc">
              <li>
                <strong>CAMP (Canadian Anti-Monopoly Project)</strong> —
                structured concentration data, sector-by-sector HHI/CR4 tracking
                with methodology-transparent market share analysis.
              </li>
              <li>
                <strong>NLRB Edge / NLRB Research (Matt Bruenig)</strong> —
                automated government data scraping + searchable database +
                analysis pattern. Demonstrates that one person with scraping
                infrastructure can build a more useful research tool than the
                government itself provides.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
