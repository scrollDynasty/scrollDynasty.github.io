import { profile } from "@/content/profile";
import { buildVCard } from "@/lib/vcard";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildVCard(profile), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="umar.vcf"',
    },
  });
}
