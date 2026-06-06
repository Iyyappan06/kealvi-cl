import { supabase } from "./supabase";

export async function getActivePolls() {
  const { data: polls, error } = await supabase
    .from("polls")
    .select(`
      *,
      poll_options (*)
    `)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  for (const poll of polls ?? []) {
    const { data: votes } = await supabase
      .from("poll_votes")
      .select("option_id")
      .eq("poll_id", poll.id);

    const counts: Record<number, number> = {};

    votes?.forEach((vote) => {
      counts[vote.option_id] =
        (counts[vote.option_id] || 0) + 1;
    });

    poll.poll_options = poll.poll_options.map(
      (option: any) => ({
        ...option,
        votes: counts[option.id] || 0,
      })
    );
  }

  return polls;
}

export async function createPoll(
  question: string,
  options: string[]
) {
  const { data: poll, error } = await supabase
    .from("polls")
    .insert({
      question,
      active: true,
    })
    .select()
    .single();

  if (error) throw error;

  const optionRows = options.map((o) => ({
    poll_id: poll.id,
    option_text: o,
  }));

  await supabase
    .from("poll_options")
    .insert(optionRows);

  return poll;
}