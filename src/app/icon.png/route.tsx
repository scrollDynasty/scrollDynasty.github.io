import { ImageResponse } from "next/og";
import { avatarDataUrl } from "@/lib/avatarDataUrl";
import { ICON } from "@/lib/metaImages";

export const dynamic = "force-static";

export async function GET() {
  const avatar = await avatarDataUrl();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} width={ICON.size} height={ICON.size} alt="" style={{ borderRadius: 9999 }} />
      </div>
    ),
    { width: ICON.size, height: ICON.size },
  );
}
