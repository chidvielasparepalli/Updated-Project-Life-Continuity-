import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Archive, Trash2, MoreVertical, Reply, Forward, Printer, X } from 'lucide-react';
import { useGmailEmail } from '../../hooks/useGmailEmails';
import GmailSkeleton from './GmailSkeleton';

function formatFullDate(internalDate: string, dateStr: string): string {
  try {
    const d = internalDate ? new Date(parseInt(internalDate)) : new Date(dateStr);
    return d.toLocaleString([], {
      weekday: 'short', year: 'numeric', month: 'short',
      day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr || ''; }
}

interface Props {
  messageId: string | null;
  onBack: () => void;
}

export default function GmailEmailViewer({ messageId, onBack }: Props) {
  const { email, loading, error } = useGmailEmail(messageId);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(400);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      try {
        const h = iframe.contentDocument?.body?.scrollHeight;
        if (h) setIframeHeight(h + 32);
      } catch { /* cross-origin */ }
    };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [email]);

  if (!messageId) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-[#5d6fa3]">
        <div className="w-20 h-20 rounded-full bg-[#1e2440] flex items-center justify-center text-4xl">✉️</div>
        <div className="text-base font-semibold text-[#9aa8cc]">Select an email to read</div>
        <div className="text-sm text-[#5d6fa3]">Nothing selected</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-[#1a1f36]">
        <div className="h-6 w-1/2 rounded-lg bg-[#5d6fa3]/20 animate-pulse mb-5" />
        {[0,1,2,3].map((i) => (
          <div key={i} className="flex gap-2 mb-2">
            <div className="h-3 w-10 rounded bg-[#5d6fa3]/15 animate-pulse" />
            <div className="h-3 rounded bg-[#5d6fa3]/20 animate-pulse" style={{ width: `${100 + i * 35}px` }} />
          </div>
        ))}
        <div className="mt-6 flex flex-col gap-2.5">
          {[100,90,75,85,60,80,40].map((w, i) => (
            <div key={i} className="h-3.5 rounded bg-[#5d6fa3]/15 animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 p-8 text-[#9aa8cc]">
        <div className="text-3xl">⚠️</div>
        <div className="font-semibold">Failed to load email</div>
        <div className="text-sm text-[#5d6fa3]">{error}</div>
      </div>
    );
  }

  const hasHtml = email?.body?.html?.trim();
  const hasText = email?.body?.text?.trim();

  const htmlContent = hasHtml
    ? `<!DOCTYPE html><html><head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width"/>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                 font-size: 14px; line-height: 1.6; color: #202124; padding: 8px; margin: 0; }
          a { color: #1a73e8; }
          img { max-width: 100%; height: auto; }
          pre, code { background: #f1f3f4; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
        </style>
      </head><body>${email!.body!.html}</body></html>`
    : null;

  return (
    <div className="flex flex-col flex-1 bg-[#1a1f36] overflow-y-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-b border-[#5d6fa3]/20 sticky top-0 bg-[#1a1f36] z-10">
        <button
          id="gmail-back-btn"
          onClick={onBack}
          title="Back to inbox"
          className="w-9 h-9 rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-[#252b4a] transition-colors"
        >
          <ArrowLeft size={18} className="text-[#9aa8cc]" />
        </button>
        {[
          { icon: Archive, id: 'gmail-archive-btn', title: 'Archive' },
          { icon: Trash2, id: 'gmail-delete-btn', title: 'Delete' },
          { icon: Printer, id: 'gmail-print-btn', title: 'Print' },
          { icon: MoreVertical, id: 'gmail-more-btn', title: 'More' },
        ].map(({ icon: Icon, id, title }) => (
          <button
            key={id} id={id} title={title}
            className="w-9 h-9 rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-[#252b4a] transition-colors"
          >
            <Icon size={17} className="text-[#9aa8cc]" />
          </button>
        ))}
      </div>

      {/* Email content */}
      <div className="px-6 py-5 flex-1">
        {/* Subject */}
        <h2 className="text-xl font-semibold text-white mb-4 leading-snug tracking-tight">
          {email?.subject || '(no subject)'}
        </h2>

        {/* Header fields */}
        <div className="rounded-xl border border-[#5d6fa3]/20 bg-[#1e2440]/60 p-4 mb-4 text-sm">
          {[
            { label: 'From', value: email?.from },
            { label: 'To', value: email?.to },
            { label: 'Date', value: formatFullDate(email?.internalDate || '', email?.date || '') },
          ].map(({ label, value }) => value ? (
            <div key={label} className="flex gap-2 mb-1 last:mb-0">
              <span className="text-[#5d6fa3] w-9 flex-shrink-0">{label}</span>
              <span className="text-[#9aa8cc] break-words">{value}</span>
            </div>
          ) : null)}
          {/* Labels */}
          {email?.labelIds?.filter(l => !['INBOX','UNREAD','IMPORTANT','CATEGORY_PERSONAL'].includes(l)).length ? (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {email!.labelIds!
                .filter(l => !['INBOX','UNREAD','IMPORTANT','CATEGORY_PERSONAL'].includes(l))
                .map(l => (
                  <span key={l} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/40">
                    {l}
                  </span>
                ))}
            </div>
          ) : null}
        </div>

        {/* Body */}
        <div className="rounded-xl border border-[#5d6fa3]/20 overflow-hidden">
          {hasHtml ? (
            <iframe
              ref={iframeRef}
              srcDoc={htmlContent!}
              title="Email body"
              sandbox="allow-same-origin allow-popups"
              className="w-full block border-none"
              style={{ height: `${iframeHeight}px` }}
            />
          ) : hasText ? (
            <pre className="p-5 m-0 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#c0c8e0] bg-[#1e2440]/40"
              style={{ fontFamily: 'inherit' }}>
              {email!.body!.text}
            </pre>
          ) : (
            <div className="p-8 text-center text-[#5d6fa3] text-sm">(No body content)</div>
          )}
        </div>

        {/* Reply / Forward */}
        <div className="flex gap-3 mt-4 pb-6">
          {[
            { icon: Reply, label: 'Reply', id: 'gmail-reply-btn' },
            { icon: Forward, label: 'Forward', id: 'gmail-forward-btn' },
          ].map(({ icon: Icon, label, id }) => (
            <button
              key={id} id={id}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#5d6fa3]/30 bg-transparent text-[#9aa8cc] text-sm cursor-pointer hover:bg-[#252b4a] transition-colors"
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
