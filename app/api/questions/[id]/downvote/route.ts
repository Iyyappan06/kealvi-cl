import { supabase } from "@/lib/supabase";

// Same logic as upvote:
// We rely on DB constraint (question_id + voter_id)
// to prevent duplicate downvotes.

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: questionId } = await params;
  const { voterId } = await req.json();

  const { error } = await supabase
    .from("downvotes")
    .insert({ question_id: questionId, voter_id: voterId });

  if (error) {
    if (error.code === "23505") {
      // user already downvoted
      return Response.json({ error: "already downvoted" }, { status: 409 });
    }

    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}