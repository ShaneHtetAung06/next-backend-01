import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/auth";
import corsHeaders from "./lib/cors";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
} from "./lib/constant";

const allowedOrigins = [
  "https://next-react-frontend-eight.vercel.app",
  "http://localhost:5173",
];

export function middleware(request) {
  const origin = request.headers.get("origin") || "";
  const isAllowedOrigin = allowedOrigins.includes(origin);
  const allowOrigin = isAllowedOrigin ? origin : allowedOrigins[0];

  const dynamicCorsHeaders = {
    ...corsHeaders,
    "Access-Control-Allow-Origin": allowOrigin,
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: dynamicCorsHeaders });
  }

  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  // Authorize requests to /api/item and /api/user
  if (pathname.startsWith("/api/item") || pathname.startsWith("/api/user")) {
    const user = verifyJWT(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized Request" },
        { status: 401, headers: dynamicCorsHeaders }
      );
    }
    requestHeaders.set(X_HEADER_USER_ID, user.id);
    requestHeaders.set(X_HEADER_USER_EMAIL, user.email);
    requestHeaders.set(X_HEADER_USER_NAME, user.username);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  Object.entries(dynamicCorsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
