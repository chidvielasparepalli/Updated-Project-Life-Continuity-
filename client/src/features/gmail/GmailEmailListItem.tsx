import React, { useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { gmailToggleStar as apiToggleStar } from '../../services/gmailApi';
import type { GmailMessage } from '../../hooks/useGmailEmails';

const AVATAR_COLORS = [
  '#1a73e8', '#34a853', '#ea4335', '#fbbc04',
  '#9c27b0', '#00bcd4', '#ff5722', '#607d8b',
  '#e91e63', '#795548',
];

function getInitials(from: string): string {
  const name = from.replace(/<[^>]+>/, '').trim() || from;
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function avatarColor(from: string): string {
  let hash = 0;
  for (let i = 0; i < from.length; i++) hash = from.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatSender(from: string): string {
  const match = from.match(/^(.+?)\s*</);
  if (match) return match[1].trim().replace(/"/g, '');
  return from.split('@')[0] || from;
}

function formatDate(internalDate: string, dateStr: string): string {
  try {
    const date = internalDate ? new Date(parseInt(internalDate)) : new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    if (date.getFullYear() === now.getFullYear()) return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
  } catch { return ''; }
}

interface Props {
  key?: string | number;
  message: GmailMessage;
  isSelected: boolean;
  onClick: () => void;
  onStarToggle?: (id: string, starred: boolean) => void;
}

export default function GmailEmailListItem({ message, isSelected, onClick, onStarToggle }: Props) {
  const [starred, setStarred] = useState(message.isStarred);
  const [starLoading, setStarLoading] = useState(false);
  const isUnread = message.isUnread;

  const handleStar = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (starLoading) return;
    const next = !starred;
    setStarred(next);
    setStarLoading(true);
    try {
      await apiToggleStar(message.id, next);
      onStarToggle?.(message.id, next);
    } catch {
      setStarred(!next); // revert
    } finally {
      setStarLoading(false);
    }
  }, [starred, starLoading, message.id, onStarToggle]);

  return (
    <div
      id={`gmail-email-${message.id}`}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-2.5 cursor-pointer
        border-b border-[#5d6fa3]/15 transition-all duration-150
        ${isSelected
          ? 'bg-indigo-900/40 border-l-2 border-l-indigo-400'
          : isUnread
          ? 'bg-[#1e2440]/60 hover:bg-[#252b4a]'
          : 'bg-transparent hover:bg-[#252b4a]/50'
        }
      `}
    >
      {/* Unread dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${isUnread ? 'bg-indigo-400' : 'bg-transparent'}`} />

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold select-none"
        style={{ background: avatarColor(message.from) }}
      >
        {getInitials(message.from)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <span className={`text-sm truncate ${isUnread ? 'font-bold text-white' : 'font-medium text-[#c0c8e0]'}`}>
            {formatSender(message.from)}
          </span>
          <span className={`text-[11px] whitespace-nowrap flex-shrink-0 ${isUnread ? 'text-indigo-400 font-semibold' : 'text-[#5d6fa3]'}`}>
            {formatDate(message.internalDate, message.date)}
          </span>
        </div>
        <div className={`text-xs truncate mb-0.5 ${isUnread ? 'font-semibold text-[#e0dafc]' : 'text-[#9aa8cc]'}`}>
          {message.subject}
        </div>
        <div className="text-[11px] text-[#5d6fa3] truncate">
          {message.snippet}
        </div>
      </div>

      {/* Star */}
      <button
        id={`gmail-star-${message.id}`}
        onClick={handleStar}
        title={starred ? 'Remove star' : 'Add star'}
        className={`flex-shrink-0 p-1 rounded-full transition-opacity ${starLoading ? 'opacity-40' : 'opacity-80 hover:opacity-100'}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <Star
          size={15}
          fill={starred ? '#f4c542' : 'none'}
          color={starred ? '#f4c542' : '#5d6fa3'}
          strokeWidth={2}
        />
      </button>
    </div>
  );
}
