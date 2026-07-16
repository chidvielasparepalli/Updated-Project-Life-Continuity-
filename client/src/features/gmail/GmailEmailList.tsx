import React, { useCallback, useRef, useEffect } from 'react';
import { Inbox, AlertTriangle, RefreshCw } from 'lucide-react';
import { useGmailEmails } from '../../hooks/useGmailEmails';
import GmailEmailListItem from './GmailEmailListItem';
import GmailSkeleton from './GmailSkeleton';

interface Props {
  label: string;
  searchQuery: string;
  selectedId: string | null;
  onSelect: (msg: any) => void;
}

export default function GmailEmailList({ label, searchQuery, selectedId, onSelect }: Props) {
  const {
    messages, loading, loadingMore, error, hasMore,
    refresh, loadMore, markAsRead, toggleStar,
  } = useGmailEmails(label, searchQuery);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loadingMore) loadMore(); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const handleSelect = useCallback((msg: any) => {
    onSelect(msg);
    if (msg.isUnread) markAsRead(msg.id);
  }, [onSelect, markAsRead]);

  if (loading) return <GmailSkeleton count={10} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-[#9aa8cc]">
        <div className="w-14 h-14 rounded-full bg-red-950/30 flex items-center justify-center">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <div className="text-sm font-semibold">Failed to load emails</div>
        <div className="text-xs text-[#5d6fa3] text-center">{error}</div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors border-none"
        >
          <RefreshCw size={13} />
          Retry
        </button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-[#9aa8cc]">
        <div className="w-20 h-20 rounded-full bg-[#1e2440] flex items-center justify-center">
          <Inbox size={36} className="text-[#5d6fa3]" />
        </div>
        <div className="text-base font-semibold text-[#c0c8e0]">
          {searchQuery ? 'No results found' : 'No emails here'}
        </div>
        <div className="text-sm text-[#5d6fa3] text-center max-w-[260px]">
          {searchQuery
            ? `No messages match "${searchQuery}"`
            : "When you receive emails, they'll appear here."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((msg) => (
        <GmailEmailListItem
          key={msg.id}
          message={msg}
          isSelected={selectedId === msg.id}
          onClick={() => handleSelect(msg)}
          onStarToggle={toggleStar}
        />
      ))}

      {/* Load more sentinel */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4 text-center">
          {loadingMore ? (
            <GmailSkeleton count={3} />
          ) : (
            <button
              onClick={loadMore}
              className="px-5 py-2 rounded-full border border-[#5d6fa3]/30 bg-transparent text-[#9aa8cc] text-sm cursor-pointer hover:bg-[#252b4a] transition-colors"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
