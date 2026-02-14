import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import dynamic from "next/dynamic";

const BroadbandCharts = dynamic(
  () => import("./broadband-charts").then((m) => m.BroadbandCharts),
);
import { BroadbandMapSection } from "./BroadbandMapSection";
import { BroadbandTable } from "./BroadbandTable";
import { CommunityBroadbandSection } from "./CommunityBroadbandSection";

import timeSeriesData from "../../../data/concentration/broadband-nys.json";
import marketShareData from "../../../data/concentration/broadband-nys-market-shares.json";
import countyData from "../../../data/concentration/broadband-counties.json";
import nycMeshData from "../../../data/concentration/nycmesh-nodes.json";

export const metadata: Metadata = {
  title: "How Many Internet Choices Do You Have?",
  description:
    "Broadband provider availability across New York State — who has real choices, who's stuck with one option, and who has none. FCC data by county.",
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
        <h1 className="text-3xl font-bold text-fm-patina">How many internet choices do you have?</h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          Millions of New Yorkers have one or two options for wired broadband.
          In rural counties, thousands of households have none. We used FCC
          filings to count how many providers are available at every census
          block across the state — and what speeds they actually offer.
        </p>
      </div>

      {/* Key findings — lead with consumer experience */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600">
            {worstZero.zeroPctBlocks}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            of blocks with zero broadband options
          </div>
          <div className="text-xs text-fm-sage">{worstZero.name}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {worstOne.onePctBlocks}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            of blocks with only one provider
          </div>
          <div className="text-xs text-fm-sage">{worstOne.name}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">$1B</div>
          <div className="text-sm text-fm-sage mt-1">ConnectALL investment</div>
          <div className="text-xs text-fm-sage">
            NYS public broadband spending
          </div>
        </div>
      </div>

      {/* What shapes the broadband market — two distinct problems */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Two different problems
        </h2>
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            <strong>Rural: no infrastructure.</strong> In counties like St.
            Lawrence and Hamilton, thousands of census blocks have zero wired
            broadband at 100 Mbps. The economics of running cable to
            low-density areas don{"\u2019"}t work without subsidy. New York{"\u2019"}s
            $1B ConnectALL program and the federal BEAD program are funding
            buildout — but the gap remains large.
          </p>
          <p>
            <strong>Urban: few competitors.</strong> Most NYC and suburban
            households have one or two wired ISPs. Building broadband networks
            requires digging up streets and stringing cables — expensive
            infrastructure that discourages new entrants where an incumbent
            already serves. The top 4 providers control 88% of the statewide
            market. Whether that translates to higher prices is the key question
            this page can{"\u2019"}t yet answer (we don{"\u2019"}t have pricing
            data by county).
          </p>
        </div>
      </div>

      {/* Map with statewide/NYC toggle */}
      <div className="card">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          Provider availability by county
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Darker colors mean fewer provider choices. Toggle between the
          statewide view and NYC borough detail.
        </p>
        <BroadbandMapSection counties={counties} />
      </div>

      {/* Charts */}
      <div className="mt-8">
        <BroadbandCharts
          timeSeriesData={timeSeriesData.years}
          marketShareData={marketShareData.marketShares}
          marketShareYear={marketShareData.year}
          hhi={marketShareData.hhi}
          cr4={marketShareData.cr4}
        />
      </div>

      {/* Community broadband */}
      <CommunityBroadbandSection data={nycMeshData} />

      {/* County table */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          All 62 counties
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Provider availability varies widely across the state. Some rural
          counties have 40%+ of census blocks with zero broadband options at
          100 Mbps — while most NYC boroughs have near-universal coverage.
        </p>
        <BroadbandTable counties={counties} />
        <p className="mt-4 text-xs text-fm-sage">
          Source: FCC Broadband Data Collection (BDC), December 2024 filing.
          Providers counted at 100+ Mbps download threshold.
        </p>
      </div>
    </div>
  );
}
