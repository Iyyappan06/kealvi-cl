import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (q) {
    const questions = await searchQuestions(q, PAGE_SIZE);

    const enriched = await attachVotes(questions);

    return Response.json({ questions: enriched, hasMore: false });
  }

  const offset = Number(searchParams.get("offset") ?? 0);
  const { questions, hasMore } = await getQuestionsPage(offset, PAGE_SIZE);

  const enriched = await attachVotes(questions);

  return Response.json({ questions: enriched, hasMore });
}

async function attachVotes(questions: any[]) {
  return Promise.all(
    questions.map(async (q) => {
      const { count: upvotes } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("question_id", q.id);

      const { count: downvotes } = await supabase
        .from("downvotes")
        .select("*", { count: "exact", head: true })
        .eq("question_id", q.id);

      return {
        ...q,
        upvotes: upvotes ?? 0,
        downvotes: downvotes ?? 0,
      };
    })
  );
}

export async function POST(req: Request) {
  const { body, author } = await req.json();

  const { data, error } = await supabase
    .from("questions")
    .insert({ body, author })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
