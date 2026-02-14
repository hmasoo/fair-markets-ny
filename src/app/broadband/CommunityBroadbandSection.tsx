import Link from "next/link";

interface BoroughData {
  borough: string;
  slug: string;
  fips: string;
  activeNodes: number;
  supernodes: number;
  hubs: number;
}

interface NycMeshData {
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  notes: string;
  citywide: {
    activeNodes: number;
    supernodes: number;
    hubs: number;
  };
  boroughs: BoroughData[];
}

export function CommunityBroadbandSection({ data }: { data: NycMeshData }) {
  return (
    <div className="card mt-8">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Community Broadband: NYC Mesh
      </h2>
      <p className="text-sm text-fm-sage mb-4">
        NYC Mesh is a volunteer-run community network that provides internet
        access across New York City using a mesh of wireless routers and fiber
        connections. It operates as a nonprofit alternative to commercial ISPs,
        offering service on a sliding-scale basis.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-fm-patina/5 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-fm-teal">
            {data.citywide.activeNodes.toLocaleString()}
          </div>
          <div className="text-sm text-fm-sage mt-1">Active Nodes</div>
          <div className="text-xs text-fm-sage">
            {data.citywide.hubs} hubs &middot; {data.citywide.supernodes} supernodes
          </div>
        </div>
        <div className="bg-fm-patina/5 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-fm-teal">
            {data.boroughs.length}
          </div>
          <div className="text-sm text-fm-sage mt-1">Boroughs Covered</div>
          <div className="text-xs text-fm-sage">
            {data.boroughs.map((b) => b.borough).join(", ")}
          </div>
        </div>
        <div className="bg-fm-patina/5 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-fm-teal">$20–$50</div>
          <div className="text-sm text-fm-sage mt-1">Suggested Monthly</div>
          <div className="text-xs text-fm-sage">
            vs. $60–$90 for commercial ISPs
          </div>
        </div>
      </div>

      <p className="text-sm text-fm-sage mb-4">
        NYC Mesh has installed nodes in NYCHA public housing developments,
        providing low-cost connectivity to residents who may face limited ISP
        options. See the{" "}
        <Link href="/housing" className="text-fm-teal hover:underline">
          housing concentration data
        </Link>{" "}
        for more on how market structure affects residents of public and
        rent-stabilized housing.
      </p>

      <p className="text-xs text-fm-sage">
        Source:{" "}
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-fm-teal hover:underline"
        >
          {data.source}
        </a>
        , retrieved {data.lastUpdated}.{" "}
        <a
          href="https://www.nycmesh.net/join"
          target="_blank"
          rel="noopener noreferrer"
          className="text-fm-teal hover:underline"
        >
          Learn how to join NYC Mesh
        </a>
        .
      </p>
    </div>
  );
}
