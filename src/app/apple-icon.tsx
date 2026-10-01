import { ImageResponse } from "next/og";
import { avatarDataUrl } from "@/lib/avatarDataUrl";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the image stays square.
export default async function AppleIcon() {
  const avatar = await avatarDataUrl();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} width={180} height={180} alt="" />
      </div>
    ),
    size,
  );
}
