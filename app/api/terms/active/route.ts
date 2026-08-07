import { listActiveTerms } from "@/lib/api/terms";

export async function GET() {
  try {
    const terms = await listActiveTerms();
    return Response.json(terms);
  } catch (error) {
    console.error("Active terms fetch failed:", error);
    return Response.json(
      { message: "약관을 불러오지 못했습니다." },
      { status: 502 }
    );
  }
}
