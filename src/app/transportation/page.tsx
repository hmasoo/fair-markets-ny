import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import dynamic from "next/dynamic";
import { TransportationTable } from "./TransportationTable";

const FareHistoryChart = dynamic(
  () => import("./transportation-charts").then((m) => m.FareHistoryChart),
);
const CommuteModeChart = dynamic(
  () => import("./transportation-charts").then((m) => m.CommuteModeChart),
);

import fareData from "../../../data/concentration/mta-fares.json";
import neighborhoodData from "../../../data/concentration/transportation-neighborhoods.json";

export const metadata: Metadata = {
  title: "What Does It Cost to Get to Work?",
  description:
    "Transportation costs across NYC neighborhoods — MTA fares, commute modes, estimated monthly costs, and who relies on transit vs. cars. Census ACS data by neighborhood.",
};

export default function TransportationPage() {
  const { neighborhoods, costModel } = neighborhoodData;
  const { fares } = fareData;

  // Stats for hero section
  const highestZeroCar = [...neighborhoods].sort(
    (a, b) => b.zeroCarPct - a.zeroCarPct,
  )[0];
  const highestCost = [...neighborhoods].sort(
    (a, b) => b.estMonthlyCost - a.estMonthlyCost,
  )[0];
  const totalWorkers = neighborhoods.reduce((s, n) => s + n.workers, 0);
  const weightedTransit =
    neighborhoods.reduce((s, n) => s + n.transitPct * n.workers, 0) / totalWorkers;

  const currentFare = fares[fares.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Transportation" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-patina">
          What does it cost to get to work?
        </h1>
        <p className="mt-2 text-fm-sage max-w-2xl">
          Transportation is the second-largest household expense for New York
          metro residents. Whether you rely on the subway, drive, or both — what
          you spend depends heavily on where you live. We combined Census
          commute data with MTA fare history and vehicle cost estimates to show
          the picture by neighborhood.
        </p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            ${currentFare.monthlyPass}
          </div>
          <div className="text-sm text-fm-sage mt-1">
            monthly MetroCard
          </div>
          <div className="text-xs text-fm-sage">
            ${currentFare.baseFare.toFixed(2)} per ride
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {highestZeroCar.zeroCarPct}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            households with no car
          </div>
          <div className="text-xs text-fm-sage">
            {highestZeroCar.name}
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            $9,425
          </div>
          <div className="text-sm text-fm-sage mt-1">
            avg annual transport spending
          </div>
          <div className="text-xs text-fm-sage">
            NY metro (BLS)
          </div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-fm-copper">
            {Math.round(weightedTransit)}%
          </div>
          <div className="text-sm text-fm-sage mt-1">
            of NYC commuters use transit
          </div>
          <div className="text-xs text-fm-sage">
            {(totalWorkers / 1_000_000).toFixed(1)}M workers
          </div>
        </div>
      </div>

      {/* Context section */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          What drives commute costs?
        </h2>
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            Several factors shape what New Yorkers pay to get around.{" "}
            <strong>Geography and density</strong> determine whether transit is
            available at all — Manhattan has the subway; parts of Staten Island
            have limited bus service.{" "}
            <strong>Infrastructure investment</strong> in transit vs. roads
            shapes the choices people face.{" "}
            <strong>Mode availability</strong> varies by neighborhood: in some
            areas, 85%+ of households have no car and rely entirely on public
            transit; in others, most people drive.{" "}
            <strong>Fare policy</strong> — the MTA board sets fares that must
            balance ridership, operating costs, and affordability.
          </p>
          <p>
            These factors interact: neighborhoods with limited transit access
            tend to have higher car ownership and higher overall commute costs.
            But mode {"\u201C"}choice{"\u201D"} is often constrained — it
            depends on where you live and work, not just preference.
          </p>
        </div>
      </div>

      {/* What this data shows — and what it doesn't */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-fm-patina mb-2">
          What this data shows — and what it doesn{"\u2019"}t
        </h2>
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            This page joins three public datasets — Census commute surveys
            (mode of transport, travel time, vehicle ownership), MTA fare
            schedules, and AAA vehicle cost estimates — to estimate what
            commuting costs in each neighborhood. That joining is the product:
            these datasets are normally published separately and hard to
            compare.
          </p>
          <p>
            The cost estimates are <strong>rough averages</strong>, not what
            any individual pays. We blend transit and driving costs by the
            share of workers using each mode — so a neighborhood where 70%
            take the subway gets a lower estimate than one where 70% drive.
            But this misses important variation: a 20-minute subway ride is
            not the same experience as a 60-minute bus commute, even if both
            cost the same monthly pass. Parking, tolls, and ride-hail are not
            included.
          </p>
          <p>
            The data covers <strong>NYC only</strong> — commute patterns
            upstate and in the suburbs are overwhelmingly car-dependent, but
            we don{"\u2019"}t yet have neighborhood-level data for those areas.
          </p>
        </div>
      </div>

      {/* Fare history chart */}
      <FareHistoryChart fares={fares} />

      {/* Commute mode chart */}
      <div className="mt-8">
        <CommuteModeChart neighborhoods={neighborhoods} />
      </div>

      {/* Neighborhood table */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-fm-patina mb-4">
          All {neighborhoods.length} neighborhoods
        </h2>
        <p className="text-sm text-fm-sage mb-4">
          Click any column header to sort. Estimated monthly cost combines
          transit usage (at ${costModel.metroCardMonthly}/mo MetroCard) and
          driving (at ${costModel.vehicleMonthlyCost}/mo per AAA).
        </p>
        <TransportationTable neighborhoods={neighborhoods} />
        <details className="mt-4 text-xs text-fm-sage">
          <summary className="cursor-pointer hover:text-fm-patina font-medium">
            How is estimated monthly cost calculated?
          </summary>
          <p className="mt-2 leading-relaxed">
            {costModel.description}. This is a rough estimate: it assumes transit
            commuters buy a monthly pass (${costModel.metroCardMonthly}) and
            drivers bear the average monthly vehicle cost for the Northeast region
            (${costModel.vehicleMonthlyCost}, from{" "}
            {costModel.sources.vehicleCost}). The blended cost for each
            neighborhood weights these by the share of workers using each mode.
            It does not include parking, tolls, or ride-hail.
          </p>
        </details>
        <p className="mt-4 text-xs text-fm-sage">
          Source: U.S. Census Bureau, ACS 2023 5-Year Estimates (Tables B08301,
          B08013, B25044). Vehicle cost from {costModel.sources.vehicleCost}.
          MetroCard price from {costModel.sources.metroCard}. MTA fare history
          from MTA Board Resolutions.
        </p>
      </div>
    </div>
  );
}
