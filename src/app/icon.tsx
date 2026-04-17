import { ImageResponse } from "next/og"

import { SITE_NAME } from "@/lib/seo/metadata"

export const size = {
  width: 512,
  height: 512
}

export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #0f766e 100%)",
          color: "#ffffff",
          fontWeight: 800,
          fontFamily: "Arial, sans-serif",
          letterSpacing: "-0.04em"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "78%",
            width: "78%",
            borderRadius: "84px",
            border: "8px solid rgba(255,255,255,0.22)",
            background: "rgba(255,255,255,0.08)",
            fontSize: "196px"
          }}
          aria-label={SITE_NAME}
        >
          CP
        </div>
      </div>
    ),
    size
  )
}
