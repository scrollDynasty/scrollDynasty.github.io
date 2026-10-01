import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { avatarDataUrl } from "@/lib/avatarDataUrl";

export const alt = `${profile.name} — ${profile.roles}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const avatar = await avatarDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: 96,
          background: "linear-gradient(135deg, #3b1d6e 0%, #1b1430 60%, #5b1166 100%)",
          color: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} width={320} height={320} alt="" style={{ borderRadius: 9999, border: "8px solid #1f1d47" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 620 }}>
          <div style={{ fontSize: 96, fontWeight: 700 }}>{profile.name}</div>
          <div style={{ fontSize: 40, color: "#b8b3d9" }}>{profile.roles}</div>
          <div style={{ fontSize: 36, color: "#e33cf0" }}>{profile.companies}</div>
        </div>
      </div>
    ),
    size,
  );
}
