import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Fair Markets NY — What New Yorkers pay for housing, transit, broadband, and healthcare";
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
            fontSize: "60px",
            color: "white",
            fontWeight: "bold",
            marginBottom: "16px",
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          What do New Yorkers pay{"\n"}for the basics — and why?
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            maxWidth: "800px",
            marginTop: "8px",
          }}
        >
          Public data on rent, income, transit costs, broadband access, and
          healthcare — joined across government sources that are normally siloed.
        </p>
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "44px",
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
            <span style={{ fontSize: "18px", opacity: 0.6, marginBottom: "4px" }}>
              Housing
            </span>
            <span style={{ fontSize: "36px", fontWeight: "bold" }}>197</span>
            <span style={{ fontSize: "15px", opacity: 0.8 }}>
              neighborhoods
            </span>
          </div>
          <div
            style={{
              width: "1px",
              background: "rgba(255,255,255,0.25)",
              alignSelf: "stretch",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
            }}
          >
            <span style={{ fontSize: "18px", opacity: 0.6, marginBottom: "4px" }}>
              Broadband
            </span>
            <span style={{ fontSize: "36px", fontWeight: "bold" }}>62</span>
            <span style={{ fontSize: "15px", opacity: 0.8 }}>
              counties
            </span>
          </div>
          <div
            style={{
              width: "1px",
              background: "rgba(255,255,255,0.25)",
              alignSelf: "stretch",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
            }}
          >
            <span style={{ fontSize: "18px", opacity: 0.6, marginBottom: "4px" }}>
              Transit
            </span>
            <span style={{ fontSize: "36px", fontWeight: "bold" }}>$3,816</span>
            <span style={{ fontSize: "15px", opacity: 0.8 }}>
              avg yearly cost
            </span>
          </div>
        </div>
        <p
          style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.5)",
            marginTop: "36px",
          }}
        >
          fairmarketsny.com
        </p>
      </div>
    ),
    { ...size }
  );
}
