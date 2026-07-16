import React from 'react';

export default function GmailSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3.5 border-b border-[#5d6fa3]/15"
        >
          {/* Unread dot */}
          <div className="w-2 h-2 rounded-full bg-[#5d6fa3]/20 flex-shrink-0" />
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#5d6fa3]/20 flex-shrink-0 animate-pulse" />
          {/* Content */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex justify-between items-center gap-2">
              <div className="h-3 rounded-md bg-[#5d6fa3]/20 animate-pulse" style={{ width: `${90 + (i % 4) * 25}px` }} />
              <div className="h-2.5 rounded-md bg-[#5d6fa3]/15 animate-pulse w-12 flex-shrink-0" />
            </div>
            <div className="h-2.5 rounded-md bg-[#5d6fa3]/20 animate-pulse" style={{ width: `${160 + (i % 3) * 50}px` }} />
            <div className="h-2 rounded-md bg-[#5d6fa3]/15 animate-pulse" style={{ width: `${50 + (i % 5) * 20}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
