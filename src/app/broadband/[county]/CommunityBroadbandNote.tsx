interface BoroughMeshData {
  borough: string;
  slug: string;
  fips: string;
  activeNodes: number;
  supernodes: number;
  hubs: number;
}

export function CommunityBroadbandNote({
  boroughName,
  data,
}: {
  boroughName: string;
  data: BoroughMeshData;
}) {
  const details = [
    `${data.activeNodes.toLocaleString()} active nodes`,
    data.hubs > 0 ? `${data.hubs} hubs` : null,
    data.supernodes > 0 ? `${data.supernodes} supernodes` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="card mt-8">
      <h2 className="text-xl font-bold text-fm-patina mb-2">
        Community Alternative: NYC Mesh
      </h2>
      <p className="text-sm text-fm-sage">
        NYC Mesh, a volunteer-run community network, operates{" "}
        <span className="font-semibold text-fm-teal">{details}</span> in{" "}
        {boroughName}. The network provides internet access on a sliding-scale
        basis ($20–$50/month suggested) as a nonprofit alternative to commercial
        ISPs.{" "}
        <a
          href="https://www.nycmesh.net/map"
          target="_blank"
          rel="noopener noreferrer"
          className="text-fm-teal hover:underline"
        >
          View coverage on the NYC Mesh map
        </a>
        .
      </p>
      <p className="mt-2 text-xs text-fm-sage">
        Source: NYC Mesh MeshDB — Public Map Data API. Node counts reflect
        installed nodes only.
      </p>
    </div>
  );
}
