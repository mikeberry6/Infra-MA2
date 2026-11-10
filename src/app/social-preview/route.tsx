import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f7f7f8",
        color: "#111114",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700 }}>
          <div style={{ display: "flex", width: 20, height: 20, borderRadius: 4, background: "#008253" }} />
          InfraSight
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", width: 260, height: 4, background: "#008253" }} />
          <div style={{ display: "flex", fontSize: 70, fontWeight: 700 }}>Infrastructure investing</div>
          <div style={{ display: "flex", fontSize: 31, color: "#4d4d56" }}>
            Transactions, funds, portfolio companies, and market signals
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
