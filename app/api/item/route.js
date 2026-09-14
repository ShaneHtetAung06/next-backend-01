import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongo";
import corsHeaders from "@/lib/cors";
import { ObjectId } from "mongodb";
import { errorResponse } from "@/lib/utils";

const DB_NAME = process.env.DB_NAME || "mongo_db";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const items = await db.collection("item").find({}).toArray();
    return NextResponse.json(items, { headers: corsHeaders });
  } catch (err) {
    return errorResponse("Failed to fetch items", 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const result = await db.collection("item").insertOne({
      name: body.name,
      description: body.description,
      createdAt: new Date(),
    });
    return NextResponse.json({ insertedId: result.insertedId }, { status: 201, headers: corsHeaders });
  } catch (err) {
    return errorResponse("Failed to create item", 500);
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return errorResponse("Missing item id", 400);

    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const result = await db.collection("item").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return NextResponse.json({ modifiedCount: result.modifiedCount }, { headers: corsHeaders });
  } catch (err) {
    return errorResponse("Failed to update item", 500);
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("Missing item id", 400);

    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const result = await db.collection("item").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ deletedCount: result.deletedCount }, { headers: corsHeaders });
  } catch (err) {
    return errorResponse("Failed to delete item", 500);
  }
}
