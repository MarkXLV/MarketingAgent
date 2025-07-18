import useSWR from 'swr';
import { fetcher } from '../api/fetcher';

export function HistoryPanel({ userId, onSelect, selectedConvo }: { userId: string; onSelect: (convoId: string) => void; selectedConvo: string | null }) {
  const { data: convos } = useSWR(userId ? `/api/history?userId=${userId}` : null, fetcher);
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
      <h2 className="text-gray-900 font-semibold mb-4">History</h2>
      <ul className="space-y-2 flex-1 overflow-y-auto">
        {convos?.map((c: { convoId: string; startedAt: number }) => (
          <li key={c.convoId}>
            <button
              onClick={() => onSelect(c.convoId)}
              className={`
                w-full text-left px-3 py-2 rounded-lg
                hover:bg-gray-100 transition-colors
                ${selectedConvo === c.convoId
                  ? 'bg-blue-100 border-l-4 border-blue-500'
                  : 'border-l-4 border-transparent'}
              `}
            >
              <span className="block text-gray-900">
                {new Date(c.startedAt).toLocaleDateString()}
              </span>
              <span className="block text-gray-500 text-sm">
                {new Date(c.startedAt).toLocaleTimeString()}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
} 