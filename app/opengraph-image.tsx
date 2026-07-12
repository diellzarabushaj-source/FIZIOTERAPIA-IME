import { ImageResponse } from "next/og";

export const alt = "Fizioterapia ime — platformë për fizioterapeutë";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 58,
          padding: "62px 68px",
          background: "linear-gradient(145deg, #f7fbf9 0%, #ffffff 54%, #e8f5f2 100%)",
          color: "#102a2e",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ width: 610, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 38 }}>
            <div
              style={{
                width: 58,
                height: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                background: "#0f766e",
                color: "white",
                fontSize: 25,
                fontWeight: 800,
              }}
            >
              fi
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 7, fontSize: 28, fontWeight: 800 }}>
              <span>Fizioterapia</span><span style={{ color: "#0f766e" }}>ime</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 13px",
              border: "1px solid #bed9d2",
              borderRadius: 999,
              color: "#0a5f59",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            Platformë për fizioterapeutë
          </div>
          <div style={{ marginTop: 19, fontSize: 58, lineHeight: 1.02, letterSpacing: -2.8, fontWeight: 800 }}>
            Krijo planin. Dërgoja pacientit. Përcill progresin.
          </div>
          <div style={{ marginTop: 26, color: "#4b626a", fontSize: 20, lineHeight: 1.45 }}>
            9.90 € / muaj · Pacienti hyn me kod ose QR, pa krijuar llogari.
          </div>
        </div>

        <div
          style={{
            width: 395,
            height: 440,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #cfded9",
            borderRadius: 24,
            background: "white",
            boxShadow: "0 24px 60px rgba(17, 48, 52, 0.14)",
          }}
        >
          <div style={{ height: 42, display: "flex", alignItems: "center", gap: 7, padding: "0 15px", background: "#f5f8f7" }}>
            {[0, 1, 2].map((dot) => <span key={dot} style={{ width: 9, height: 9, borderRadius: 9, background: "#c8d5d1" }} />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", padding: 24 }}>
            <div style={{ color: "#6a7d82", fontSize: 13 }}>Paneli i fizioterapeutit</div>
            <div style={{ marginTop: 5, fontSize: 26, fontWeight: 800 }}>Mirë se erdhe, Arta</div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              {[["18", "Pacientë"], ["84%", "Kryer sot"], ["2", "Vëmendje"]].map(([value, label]) => (
                <div key={label} style={{ width: 108, display: "flex", flexDirection: "column", gap: 5, padding: 13, border: "1px solid #dce6e3", borderRadius: 14 }}>
                  <strong style={{ fontSize: 22 }}>{value}</strong><span style={{ color: "#61767b", fontSize: 11 }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", border: "1px solid #dce6e3", borderRadius: 16, overflow: "hidden" }}>
              {[["Arta Gashi", "3/4 kryer"], ["Leon Berisha", "Dhimbje 8/10"], ["Era Kelmendi", "Plan i ri"]].map(([name, status], index) => (
                <div key={name} style={{ minHeight: 66, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0 15px", borderTop: index ? "1px solid #e8eeec" : "0" }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{name}</span>
                  <span style={{ color: index === 1 ? "#9a4f08" : "#0a5f59", fontSize: 11, fontWeight: 700 }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
