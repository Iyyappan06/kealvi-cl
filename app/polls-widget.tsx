"use client";

import { useEffect, useState } from "react";

export default function PollsWidget() {
  const [polls, setPolls] = useState<any[]>([]);

  useEffect(() => {
    loadPolls();

    const interval = setInterval(loadPolls, 3000);

    return () => clearInterval(interval);
  }, []);

  async function loadPolls() {
    const res = await fetch("/api/polls");
    const data = await res.json();
    setPolls(data);
  }

  async function vote(pollId: number, optionId: number) {
  console.log("Voting:", pollId, optionId);

  const res = await fetch(`/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ optionId }),
  });

  console.log("Response status:", res.status);

  const data = await res.json();
  console.log("Response data:", data);

  loadPolls();
}

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        Active Polls
      </h2>

      {polls.map((poll) => {
        const totalVotes =
          poll.poll_options.reduce(
            (sum: number, option: any) =>
              sum + option.votes,
            0
          );

        return (
          <div
            key={poll.id}
            className="border rounded p-4"
          >
            <h3 className="font-semibold mb-4">
              {poll.question}
            </h3>

            {poll.poll_options.map(
              (option: any) => {
                const percentage =
                  totalVotes === 0
                    ? 0
                    : Math.round(
                        (option.votes /
                          totalVotes) *
                          100
                      );

                return (
                  <div
                    key={option.id}
                    className="mb-4"
                  >
                    <button
                      onClick={() =>
                        vote(
                          poll.id,
                          option.id
                        )
                      }
                      className="w-full rounded border p-2 text-left"
                    >
                      {option.option_text}
                    </button>

                    <div className="mt-1 flex justify-between text-sm text-gray-600">
                      <span>
                        {option.votes} votes
                      </span>
                      <span>
                        {percentage}%
                      </span>
                    </div>

                    <div className="mt-1 h-2 rounded bg-gray-200">
                      <div
                        className="h-2 rounded bg-indigo-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}

            <div className="mt-2 text-sm font-medium text-gray-500">
              Total Votes: {totalVotes}
            </div>
          </div>
        );
      })}
    </div>
  );
}