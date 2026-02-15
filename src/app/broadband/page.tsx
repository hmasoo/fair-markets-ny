import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { GeographySearch } from "@/components/ui/GeographySearch";
import dynamic from "next/dynamic";

const BroadbandCharts = dynamic(
  () => import("./broadband-charts").then((m) => m.BroadbandCharts),
);
import { BroadbandMapSection } from "./BroadbandMapSection";

import timeSeriesData from "../../../data/concentration/broadband-nys.json";
import marketShareData from "../../../data/concentration/broadband-nys-market-shares.json";
import countyData from "../../../data/concentration/broadband-counties.json";
import nycMeshData from "../../../data/concentration/nycmesh-nodes.json";

export const metadata: Metadata = {
  title: "Are You Paying Too Much for Internet?",
  description:
    "Broadband prices across New York State — what you pay, what speeds you get, and why you may not have alternatives. FCC data and published ISP rates by county.",
};

export default function BroadbandPage() {
  const { counties } = countyData;

  // Find the worst-served county for hero stats
  const worstZero = [...counties].sort((a, b) => b.zeroPctBlocks - a.zeroPctBlocks)[0];
  const worstOne = [...counties].sort((a, b) => b.onePctBlocks - a.onePctBlocks)[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Broadband" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">Are you paying too much for internet?</h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          A 100 Mbps connection costs $25{"\u2013"}$50/mo from most wired
          providers — but whether you can actually get that price depends on
          where you live. Many New Yorkers have only one ISP to choose from,
          and millions more have none. Here{"\u2019"}s what people pay across
          the state, and why.
        </p>
      </div>

      <div className="mb-6">
        <GeographySearch
          items={counties.map((c) => ({ name: c.name, slug: c.slug }))}
          basePath="/broadband"
          placeholder="Search for a county..."
        />
      </div>

      {/* Key findings — lead with cost, then access gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">$25{"\u2013"}$50/mo</div>
          <div className="text-sm text-fm-sage mt-1">typical 100+ Mbps plan</div>
          <div className="text-xs text-fm-sage">
            intro rates — regular prices are higher
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600">
            {worstZero.zeroPctBlocks}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            of blocks with no broadband at all
          </div>
          <div className="text-xs text-fm-sage">{worstZero.name}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {worstOne.onePctBlocks}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            of blocks with only one option
          </div>
          <div className="text-xs text-fm-sage">{worstOne.name}</div>
        </div>
      </div>

      {/* Intro rate context */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Watch out for introductory pricing
        </h2>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            The headline prices from Spectrum ($30/mo), Windstream ($25/mo),
            and Frontier ($45/mo) are introductory rates — they go up after
            12 months, and the providers don{"\u2019"}t always make the regular
            price easy to find. Verizon FiOS ($50/mo with Auto Pay) and
            Optimum ($30/mo) are price-locked — Optimum for 5 years, Verizon
            for 3. The FCC{"\u2019"}s urban benchmark for broadband is $30.67/mo.
          </p>
          <p className="text-fm-sage">
            Equipment fees add to the real cost: most providers charge
            $5{"\u2013"}$15/mo for a router or gateway rental, though you can
            usually bring your own.
          </p>
        </div>
      </div>

      {/* What shapes the broadband market — two distinct problems */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Why can{"\u2019"}t I get a better deal?
        </h2>
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            <strong>If you{"\u2019"}re rural: there may be nothing to buy.</strong>{" "}
            In counties like St. Lawrence and Hamilton, thousands of census
            blocks have zero wired broadband at 100 Mbps. Running cable to
            low-density areas doesn{"\u2019"}t pay for itself. New York{"\u2019"}s $1B
            ConnectALL program and the federal BEAD program are funding
            buildout — but the gap remains large. Satellite (Starlink, $120/mo)
            may be the only option.
          </p>
          <p>
            <strong>If you{"\u2019"}re urban: you{"\u2019"}re probably locked in.</strong>{" "}
            Most NYC and suburban households have one or two wired ISPs.
            Major providers charge uniform prices across their service areas,
            so the issue isn{"\u2019"}t price gouging — Spectrum charges the same
            rate everywhere it operates. The problem is that if you{"\u2019"}re unhappy with your
            speed, reliability, or service, you likely can{"\u2019"}t switch to
            anyone else. Building broadband networks means digging up streets,
            which keeps new competitors out.
          </p>
        </div>
      </div>

      {/* Map with statewide/NYC toggle */}
      <div className="card">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Where can you get broadband?
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Warmer colors mean fewer options for internet service.
          Toggle between the statewide view and NYC borough detail.
        </p>
        <BroadbandMapSection counties={counties} nycMeshData={nycMeshData} />
      </div>

      {/* Market structure charts — for researchers */}
      <details className="mt-8">
        <summary className="text-fm-sage cursor-pointer hover:text-fm-patina font-medium text-sm">
          Market structure over time (for researchers)
        </summary>
        <div className="mt-4">
          <BroadbandCharts
            timeSeriesData={timeSeriesData.years}
            marketShareData={marketShareData.marketShares}
            marketShareYear={marketShareData.year}
            hhi={marketShareData.hhi}
            cr4={marketShareData.cr4}
          />
        </div>
      </details>
    </div>
  );
}
