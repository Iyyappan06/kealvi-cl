"use client";

import { useState } from "react";

export default function PollCreator() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    "",
    ""
  ]);

  async function createPoll() {
    await fetch("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        options: options.filter(Boolean),
      }),
    });

    setQuestion("");
    setOptions(["", ""]);
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <h2 className="text-xl font-bold">
        Create Poll
      </h2>

      <input
        className="border p-2 w-full"
        placeholder="Poll question"
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
      />

      {options.map((option, index) => (
        <input
          key={index}
          className="border p-2 w-full"
          placeholder={`Option ${index + 1}`}
          value={option}
          onChange={(e) => {
            const copy = [...options];
            copy[index] = e.target.value;
            setOptions(copy);
          }}
        />
      ))}

      <button
        onClick={() =>
          setOptions([...options, ""])
        }
        className="border px-3 py-2"
      >
        Add Option
      </button>

      <button
        onClick={createPoll}
        className="border px-3 py-2 ml-2"
      >
        Create Poll
      </button>
    </div>
  );
}