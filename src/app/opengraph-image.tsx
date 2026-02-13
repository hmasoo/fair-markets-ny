import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Fair Markets NY — Public data on market competition across New York";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1B3B36 0%, #2B7A65 50%, #4EA88A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            color: "white",
            fontWeight: "bold",
            marginBottom: "16px",
          }}
        >
          Fair Markets NY
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          Public data on market competition and ownership structure
          across New York State
        </p>
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
            }}
          >
            <span style={{ fontSize: "40px", fontWeight: "bold" }}>3,250</span>
            <span style={{ fontSize: "16px", opacity: 0.8 }}>
              Broadband HHI
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
            }}
          >
            <span style={{ fontSize: "40px", fontWeight: "bold" }}>228</span>
            <span style={{ fontSize: "16px", opacity: 0.8 }}>
              Housing HHI (citywide)
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
            }}
          >
            <span style={{ fontSize: "40px", fontWeight: "bold" }}>87.9%</span>
            <span style={{ fontSize: "16px", opacity: 0.8 }}>
              ISP CR4 (statewide)
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
