import { ImageResponse } from "next/og";
import { avatarDataUrl } from "@/lib/avatarDataUrl";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const avatar = await avatarDataUrl();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} width={64} height={64} alt="" style={{ borderRadius: 9999 }} />
      </div>
    ),
    size,
  );
}
