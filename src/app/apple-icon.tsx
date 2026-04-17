import { ImageResponse } from "next/og"

import { SITE_NAME } from "@/lib/seo/metadata"

export const size = {
  width: 180,
  height: 180
}

export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "36px",
          background: "linear-gradient(135deg, #0f172a 0%, #0f766e 100%)",
          color: "#ffffff",
          fontWeight: 800,
          fontFamily: "Arial, sans-serif",
          fontSize: "72px",
          letterSpacing: "-0.04em"
        }}
        aria-label={SITE_NAME}
      >
        CP
      </div>
    ),
    size
  )
}
