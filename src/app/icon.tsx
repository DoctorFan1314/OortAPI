import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = { width: 32, height: 32 };
export const contentType = "image/svg+xml";

export default function Icon() {
  const svgPath = path.join(process.cwd(), "public", "logo-icon.svg");
  const svg = fs.readFileSync(svgPath, "utf-8");
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} width={32} height={32} />
    </div>,
    { ...size }
  );
}
