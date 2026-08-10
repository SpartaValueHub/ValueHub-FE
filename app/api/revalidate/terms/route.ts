import { revalidateTag } from "next/cache";

function isAuthorized(request: Request): boolean {
  const secret = process.env.TERMS_REVALIDATE_SECRET?.trim();
  if (!secret) {
    return false;
  }

  const authorization = request.headers.get("Authorization")?.trim();
  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token.length > 0 && token === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("active-terms-v3", "max");
  revalidateTag("active-terms-v2", "max");
  revalidateTag("active-terms", "max");
  return Response.json({ revalidated: true });
}
