import { useState, useEffect, useCallback, useRef } from 'react';
import { gmailGetMessages, gmailGetMessage, gmailMarkAsRead as apiMarkAsRead } from '../services/gmailApi';

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  isUnread: boolean;
  isStarred: boolean;
  body?: { html: string; text: string };
}

export function useGmailEmails(label: string = 'INBOX', searchQuery: string = '') {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentLabel = useRef(label);
  const currentQuery = useRef(searchQuery);

  const fetchMessages = useCallback(async (opts: {
    append?: boolean;
    pageToken?: string;
    q?: string;
    lbl?: string;
  } = {}) => {
    const { append = false, pageToken, q, lbl } = opts;
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const result = await gmailGetMessages({
        label: lbl ?? currentLabel.current,
        ...(pageToken ? { pageToken } : {}),
        ...(q !== undefined ? { q } : currentQuery.current ? { q: currentQuery.current } : {}),
      });

      setMessages((prev) =>
        append ? [...prev, ...result.messages] : result.messages
      );
      setNextPageToken(result.nextPageToken);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load emails');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Re-fetch when label or refreshKey changes
  useEffect(() => {
    currentLabel.current = label;
    currentQuery.current = searchQuery;
    fetchMessages({ lbl: label, q: searchQuery || undefined });
  }, [label, fetchMessages, refreshKey]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (searchQuery !== currentQuery.current) {
      currentQuery.current = searchQuery;
      debounceTimer.current = setTimeout(() => {
        fetchMessages({ lbl: currentLabel.current, q: searchQuery || undefined });
      }, 400);
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, fetchMessages]);

  const loadMore = useCallback(() => {
    if (!nextPageToken || loadingMore) return;
    fetchMessages({ append: true, pageToken: nextPageToken, lbl: currentLabel.current });
  }, [nextPageToken, loadingMore, fetchMessages]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const markAsRead = useCallback(async (id: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, isUnread: false, labelIds: m.labelIds.filter((l) => l !== 'UNREAD') }
          : m
      )
    );
    try {
      await apiMarkAsRead(id);
    } catch {
      setRefreshKey((k) => k + 1); // revert by refreshing
    }
  }, []);

  const toggleStar = useCallback((id: string, starred: boolean) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              isStarred: starred,
              labelIds: starred
                ? [...m.labelIds, 'STARRED']
                : m.labelIds.filter((l) => l !== 'STARRED'),
            }
          : m
      )
    );
  }, []);

  return {
    messages,
    loading,
    loadingMore,
    error,
    hasMore: !!nextPageToken,
    refresh,
    loadMore,
    markAsRead,
    toggleStar,
  };
}

export function useGmailEmail(id: string | null) {
  const [email, setEmail] = useState<GmailMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setEmail(null); return; }
    setLoading(true);
    setError(null);
    gmailGetMessage(id)
      .then(setEmail)
      .catch((err: any) => setError(err.response?.data?.error || 'Failed to load email'))
      .finally(() => setLoading(false));
  }, [id]);

  return { email, loading, error };
}
