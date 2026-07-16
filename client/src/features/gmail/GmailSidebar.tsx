import React, { useState, useEffect } from 'react';
import {
  Inbox, Star, Send, FileText, Trash2, Tag,
  ChevronDown, ChevronRight, Plus, LogOut, Mail,
} from 'lucide-react';
import { gmailGetLabels } from '../../services/gmailApi';
import type { GmailUser } from '../../hooks/useGmailAuth';

interface Label { id: string; name: string; type: string; }

const NAV_ITEMS = [
  { id: 'INBOX',   label: 'Inbox',   icon: Inbox,    gmailLabel: 'INBOX' },
  { id: 'STARRED', label: 'Starred', icon: Star,     gmailLabel: 'STARRED' },
  { id: 'SENT',    label: 'Sent',    icon: Send,     gmailLabel: 'SENT' },
  { id: 'DRAFT',   label: 'Drafts',  icon: FileText, gmailLabel: 'DRAFT' },
  { id: 'TRASH',   label: 'Trash',   icon: Trash2,   gmailLabel: 'TRASH' },
];

const LABEL_COLORS = [
  '#1a73e8', '#34a853', '#ea4335', '#fbbc04',
  '#9c27b0', '#00bcd4', '#ff5722', '#795548',
];

function labelColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
}

interface Props {
  gmailUser: GmailUser;
  activeLabel: string;
  onLabelChange: (label: string) => void;
  collapsed: boolean;
  onCompose: () => void;
  onLogout: () => void;
}

export default function GmailSidebar({
  gmailUser, activeLabel, onLabelChange, collapsed, onCompose, onLogout,
}: Props) {
  const [userLabels, setUserLabels] = useState<Label[]>([]);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    gmailGetLabels()
      .then(({ labels }: { labels: Label[] }) => {
        const filtered = (labels || []).filter(
          (l) => l.type === 'user' && !l.name.startsWith('CATEGORY_')
        );
        setUserLabels(filtered.slice(0, 12));
      })
      .catch(() => {});
  }, []);

  return (
    <aside
      className={`
        flex flex-col bg-[#1a1f36] border-r border-[#5d6fa3]/20 flex-shrink-0 transition-all duration-300
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-4 mb-1 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4285f4, #1a73e8)', boxShadow: '0 4px 12px rgba(26,115,232,.3)' }}>
          <Mail size={16} color="#fff" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap">Gmail Inbox</span>
        )}
      </div>

      {/* Compose */}
      <div className={`px-3 mb-2 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          id="gmail-compose-btn"
          onClick={onCompose}
          title="Compose"
          className={`
            flex items-center gap-2.5 rounded-2xl border-none cursor-pointer transition-all
            bg-white/10 hover:bg-white/15 text-white font-semibold text-sm shadow-md
            ${collapsed ? 'w-10 h-10 justify-center' : 'w-full px-4 py-2.5'}
          `}
        >
          <Plus size={18} />
          {!collapsed && 'Compose'}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ id, label, icon: Icon, gmailLabel }) => {
          const isActive = activeLabel === gmailLabel;
          return (
            <button
              key={id}
              id={`gmail-nav-${id.toLowerCase()}`}
              onClick={() => onLabelChange(gmailLabel)}
              title={label}
              className={`
                w-full flex items-center gap-3 transition-all cursor-pointer border-none
                ${collapsed ? 'justify-center px-0 py-2.5' : 'px-4 py-2 rounded-r-2xl mr-3'}
                ${isActive
                  ? 'bg-indigo-600/30 text-indigo-300 font-bold'
                  : 'bg-transparent text-[#9aa8cc] hover:bg-[#252b4a] font-medium'}
              `}
              style={{ width: collapsed ? '100%' : 'calc(100% - 0.75rem)' }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {!collapsed && <span className="text-sm">{label}</span>}
            </button>
          );
        })}

        {/* User-defined labels */}
        {!collapsed && userLabels.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowLabels((s) => !s)}
              className="w-full flex items-center gap-1.5 px-4 py-2 border-none bg-transparent cursor-pointer text-[#5d6fa3] text-[10px] font-bold uppercase tracking-widest hover:text-[#9aa8cc] transition-colors"
            >
              {showLabels ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Labels
            </button>
            {showLabels && userLabels.map((label) => (
              <button
                key={label.id}
                onClick={() => onLabelChange(label.id)}
                className={`
                  flex items-center gap-2.5 px-4 py-1.5 text-xs cursor-pointer border-none transition-colors
                  rounded-r-2xl mr-3 w-[calc(100%-0.75rem)]
                  ${activeLabel === label.id
                    ? 'bg-indigo-600/30 text-indigo-300'
                    : 'bg-transparent text-[#9aa8cc] hover:bg-[#252b4a]'}
                `}
              >
                <Tag size={13} style={{ color: labelColor(label.name), flexShrink: 0 }} />
                <span className="truncate">{label.name}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* User info + logout */}
      <div className={`border-t border-[#5d6fa3]/20 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <button
            onClick={onLogout}
            title="Disconnect Gmail"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-red-950/30 hover:bg-red-900/40 border-none cursor-pointer transition-colors"
          >
            <LogOut size={14} className="text-red-400" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {gmailUser.picture ? (
              <img src={gmailUser.picture} alt={gmailUser.name} referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {gmailUser.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#c0c8e0] truncate">{gmailUser.name}</div>
              <div className="text-[10px] text-[#5d6fa3] truncate">{gmailUser.email}</div>
            </div>
            <button
              id="gmail-sidebar-logout"
              onClick={onLogout}
              title="Disconnect Gmail"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-transparent hover:bg-red-950/40 border-none cursor-pointer transition-colors flex-shrink-0"
            >
              <LogOut size={13} className="text-[#5d6fa3] hover:text-red-400" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
