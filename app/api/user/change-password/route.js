import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongo";
import corsHeaders from "@/lib/cors";
import bcrypt from "bcrypt";
import { isAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/utils";

const DB_NAME = process.env.DB_NAME || "mongo_db";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(request) {
  try {
    if (!isAdmin(request)) {
      return errorResponse("Unauthorized", 403);
    }
    
    const { email, newPassword } = await request.json();
    if (!email || !newPassword) {
      return errorResponse("Missing email or newPassword", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    
    const result = await db.collection("user").updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      return errorResponse("User not found", 404);
    }

    return NextResponse.json({ message: "Password updated successfully" }, { headers: corsHeaders });
  } catch (err) {
    return errorResponse("Failed to change password", 500);
  }
}
