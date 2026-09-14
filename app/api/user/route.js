import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongo";
import corsHeaders from "@/lib/cors";
import { isAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/utils";

const DB_NAME = process.env.DB_NAME || "mongo_db";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request) {
  try {
    if (!isAdmin(request)) {
      return errorResponse("Unauthorized", 403);
    }

    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    
    const users = await db.collection("user").find({}, { projection: { password: 0 } }).toArray();
    
    return NextResponse.json(users, { headers: corsHeaders });
  } catch (err) {
    return errorResponse("Failed to fetch users", 500);
  }
}
