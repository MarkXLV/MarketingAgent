import useSWR from 'swr';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

const fetcher = (url: string) => fetch(API_BASE + url).then(res => res.json());

export function ChatHistoryView({ convoId, userId }: { convoId: string, userId: string }) {
  const { data: messages } = useSWR(
    convoId && userId ? `/api/history/${convoId}?userId=${userId}` : null,
    fetcher
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
      {messages?.map((m: { author: 'user' | 'assistant'; content: string; ts: number }, i: number) => (
        <div
          key={i}
          className={`flex ${m.author === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] px-4 py-2 rounded-2xl shadow
              ${m.author === 'assistant'
                ? 'bg-green-200 text-black'
                : 'bg-blue-600 text-white'}
            `}
          >
            {m.content}
          </div>
        </div>
      ))}
    </div>
  );
} 