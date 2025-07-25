

"use client"; 
import { useState } from "react"; // ✅ Add this line at the top

const videos = [
  { title: "Intro to Embedded Finance (basics)", id: "B2MD0RBoTj0" },
  { title: "A Practical Guide To Embedded Finance And Its Benefits", id: "Vi4ycpUtuSQ" },
  { title: "Episode 01 – Embedded finance basics, with Michael Pierce", id: "EkuJyKzKFrw" },
  { title: "Financial Literacy: Banking Basics", id: "aGIFVrIKDvo" },
  { title: "How Banks Make Money | Banking Explained", id: "fTTGALaRZoc" },
  { title: "6 Types of Embedded Finance You Probably Use", id: "AnvxHDRn7Nk" },
  { title: "Embedded Finance Explained – Future of Banking", id: "Jm_oudOcWFk" },
  { title: "Banking 101: Understanding the Basics", id: "JTm7aABfWYs" },
  { title: "Personal Finance Basics for Beginners", id: "jko5Wpla7DE" },
  { title: "Personal Finance Basics | Money Instructor", id: "WiH2T933xn8" },
  { title: "Next Gen Personal Finance Overview", id: "Ms5QFc9StTI" },
  { title: "Embedded Finance Explained – Why Invisible Banks Are The Future", id: "Jm_oudOcWFk" },
];

export default function BankingFinanceVideos() {
  const [search, setSearch] = useState("");

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mt-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        Banking & Finance Basics – Beginner Videos
      </h2>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded shadow-sm w-full max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-600">No videos found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v, i) => (
            <div key={i} className="w-full aspect-video">
              <iframe
                className="w-full h-full rounded-lg shadow-md"
                src={`https://www.youtube.com/embed/${v.id}`}
                title={v.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="mt-2 text-center text-sm text-gray-700">
                {v.title}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
