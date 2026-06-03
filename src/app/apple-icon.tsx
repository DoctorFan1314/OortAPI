import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        fontSize: 100,
        background: "#09090b",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#00d4ff",
        fontWeight: "bold",
        borderRadius: 36,
      }}>
        O
      </div>
    ),
    { ...size }
  );
}
