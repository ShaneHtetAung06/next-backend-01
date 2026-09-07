import corsHeaders from "./cors";
import { NextResponse } from "next/server";

export function errorResponse(message, status) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: corsHeaders,
    }
  );
}
