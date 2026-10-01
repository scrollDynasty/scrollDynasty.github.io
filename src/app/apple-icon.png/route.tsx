import { ImageResponse } from "next/og";
import { avatarDataUrl } from "@/lib/avatarDataUrl";
import { APPLE_ICON } from "@/lib/metaImages";

export const dynamic = "force-static";

// iOS rounds the corners itself, so the image stays square.
export async function GET() {
  const avatar = await avatarDataUrl();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} width={APPLE_ICON.size} height={APPLE_ICON.size} alt="" />
      </div>
    ),
    { width: APPLE_ICON.size, height: APPLE_ICON.size },
  );
}
