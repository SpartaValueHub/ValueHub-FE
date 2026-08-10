import { listActiveTerms } from "@/lib/api/terms";
import { logSafeError } from "@/lib/log/safe-log";

export async function GET() {
  try {
    const terms = await listActiveTerms();
    return Response.json(terms);
  } catch (error) {
    logSafeError("Active terms fetch failed:", error);
    return Response.json(
      { message: "약관을 불러오지 못했습니다." },
      { status: 502 }
    );
  }
}
