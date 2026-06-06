import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await req.json();

  const voterId = crypto.randomUUID();

  const { error } = await supabase
    .from("poll_votes")
    .insert({
      poll_id: Number(id),
      option_id: body.optionId,
      voter_id: voterId,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}