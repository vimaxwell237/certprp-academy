import { ImageResponse } from "next/og";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo/metadata";

export const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630
} as const;

export const SOCIAL_IMAGE_ALT = `${SITE_NAME} CCNA training platform preview`;
export const SOCIAL_IMAGE_CONTENT_TYPE = "image/png";

export function renderDefaultSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #12263a 45%, #0f766e 100%)",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}
          >
            <div
              style={{
                display: "flex",
                height: "18px",
                width: "18px",
                borderRadius: "999px",
                background: "#22d3ee"
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}
            >
              {SITE_NAME}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              padding: "10px 18px",
              fontSize: "20px",
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}
          >
            CCNA 200-301 Prep
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "940px"
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "76px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.04em"
            }}
          >
            Lessons, Labs, Practice Exams, and Subnetting Tools
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "32px",
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.82)"
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "18px",
            flexWrap: "wrap"
          }}
        >
          {["CCNA Labs", "Practice Tests", "Subnetting", "Ethical Prep"].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.08)",
                padding: "14px 22px",
                fontSize: "24px",
                fontWeight: 600
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    SOCIAL_IMAGE_SIZE
  );
}
