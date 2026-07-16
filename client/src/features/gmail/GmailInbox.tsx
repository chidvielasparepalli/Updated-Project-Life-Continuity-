import React, { useState, useCallback } from 'react';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { Search, RefreshCw, Menu } from 'lucide-react';
import { useGmailAuth } from '../../hooks/useGmailAuth';
import GmailSidebar from './GmailSidebar';
import GmailEmailList from './GmailEmailList';
import GmailEmailViewer from './GmailEmailViewer';
import GmailLoginCard from './GmailLoginCard';

export default function GmailInbox() {
  const { theme } = useThemeLanguage();
  const { gmailUser, loading: authLoading, login, logout } = useGmailAuth();

  const [activeLabel, setActiveLabel] = useState('INBOX');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLabelChange = useCallback((label: string) => {
    setActiveLabel(label);
    setSelectedMessage(null);
    setSearchQuery('');
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value) setSelectedMessage(null);
  }, []);

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[600px]">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-spin-once shadow-lg shadow-indigo-600/30">
          <RefreshCw size={24} className="text-white animate-spin" />
        </div>
        <div className="mt-4 text-sm font-semibold text-indigo-400">Verifying session...</div>
      </div>
    );
  }

  if (!gmailUser) {
    return <GmailLoginCard onLogin={login} />;
  }

  function labelDisplayName(label: string) {
    const map: Record<string, string> = {
      INBOX: 'Inbox', STARRED: 'Starred', SENT: 'Sent',
      DRAFT: 'Drafts', TRASH: 'Trash', SPAM: 'Spam',
    };
    return map[label] || label;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] w-full rounded-2xl border border-[#5d6fa3]/30 overflow-hidden bg-[#1e2440]/90 backdrop-blur-md shadow-2xl relative">
      
      {/* Topbar inside the panel */}
      <header className="h-14 flex items-center gap-3 px-4 bg-[#1a1f36] border-b border-[#5d6fa3]/20 flex-shrink-0 z-10">
        <button
          onClick={() => setSidebarCollapsed(c => !c)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer hover:bg-[#252b4a] transition-colors"
        >
          <Menu size={18} className="text-[#9aa8cc]" />
        </button>

        <div className="flex-1 max-w-[500px] relative flex items-center">
          <div className="absolute left-3.5 text-[#5d6fa3] pointer-events-none">
            <Search size={15} />
          </div>
          <input
            type="text"
            placeholder="Search mail"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-[#5d6fa3]/30 bg-[#252b4a]/50 text-[#e0dafc] text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-[#252b4a] transition-all placeholder:text-[#5d6fa3]"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <GmailSidebar
          gmailUser={gmailUser}
          activeLabel={activeLabel}
          onLabelChange={handleLabelChange}
          collapsed={sidebarCollapsed}
          onCompose={() => alert('Compose feature coming soon!')}
          onLogout={logout}
        />

        <main className="flex-1 flex overflow-hidden bg-[#1a1f36]">
          {/* List Pane */}
          <div
            className="flex flex-col border-r border-[#5d6fa3]/20 flex-shrink-0 transition-all duration-300 bg-[#1e2440]"
            style={{
              width: selectedMessage ? '360px' : '100%',
              minWidth: selectedMessage ? '320px' : 'auto',
            }}
          >
            {/* List Header */}
            <div className="px-4 py-3 border-b border-[#5d6fa3]/15 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-white m-0 tracking-tight">
                {searchQuery ? `Search: "${searchQuery}"` : labelDisplayName(activeLabel)}
              </h2>
            </div>
            
            <GmailEmailList
              label={activeLabel}
              searchQuery={searchQuery}
              selectedId={selectedMessage?.id || null}
              onSelect={setSelectedMessage}
            />
          </div>

          {/* Viewer Pane */}
          {selectedMessage && (
            <GmailEmailViewer
              messageId={selectedMessage.id}
              onBack={() => setSelectedMessage(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
