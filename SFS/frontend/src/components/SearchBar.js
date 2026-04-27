import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState("");
  return (
    <div className="mb-3">
      <input
        className="form-control"
        placeholder="Search files"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button
        className="btn btn-outline-primary mt-2"
        onClick={() => onSearch(q)}
      >
        Search
      </button>
    </div>
  );
}
