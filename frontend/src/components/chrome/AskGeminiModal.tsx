import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles, Send, X, Bot, User, RefreshCw, MessageSquare, Plus, Trash2, History,
  ChevronLeft, Search, Edit2, Copy, Check, ThumbsUp, ThumbsDown, Paperclip,
  Square, AlertCircle
} from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';
import { invokeEdgeFunction } from '../../lib/supabase';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  liked?: boolean | null;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'obsidian_gemini_sessions_v4';

const INITIAL_WELCOME: ChatMessage = {
  id: 'welcome',
  sender: 'assistant',
  text: "Hello! I'm **Skipper**, your AI assistant. Ask me anything across science, coding, creative writing, or general knowledge!",
  timestamp: new Date().toISOString(),
};

const createNewSession = (firstQuery?: string): ChatSession => {
  const id = crypto.randomUUID();
  const title = firstQuery
    ? firstQuery.slice(0, 24) + (firstQuery.length > 24 ? '...' : '')
    : 'New Chat';
  return {
    id,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [INITIAL_WELCOME],
  };
};

/**
 * Direct OpenRouter Chat Completions API fetcher (nvidia/nemotron-3-ultra-550b-a55b:free)
 */
async function fetchOpenRouterAIResponse(promptText: string, history: ChatMessage[]): Promise<string> {
  const apiKey =
    import.meta.env.VITE_OPENROUTER_API_KEY ||
    import.meta.env.OPENROUTER_API_KEY ||
    (typeof window !== 'undefined' && (window as any).OPENROUTER_API_KEY) ||
    '';

  // Format messages into OpenAI-compatible format
  const formattedMessages = history
    .filter((m) => m.id !== 'welcome' && m.text.trim().length > 0 && !m.isStreaming)
    .map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

  const lastMsg = formattedMessages[formattedMessages.length - 1];
  if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== promptText) {
    formattedMessages.push({
      role: 'user',
      content: promptText,
    });
  }

  const payloadMessages = [
    {
      role: 'system',
      content: 'You are a helpful conversational assistant. Answer naturally, intelligently, accurately, and directly.',
    },
    ...formattedMessages,
  ];

  // 1. Direct fetch to OpenRouter Chat Completions API endpoint
  if (apiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': 'https://yourdomain.com',
          'X-Title': 'Skipper',
        },
        body: JSON.stringify({
          model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
          messages: payloadMessages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const textOutput = data?.choices?.[0]?.message?.content;
        if (textOutput && textOutput.trim()) {
          return textOutput.trim();
        }
      } else {
        const errorData = await response.json().catch(() => null);
        const errMsg = errorData?.error?.message || `OpenRouter API returned status ${response.status}`;
        throw new Error(`OpenRouter API Error: ${errMsg}`);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('OpenRouter API Error')) {
        throw err;
      }
    }
  }

  // 2. Invoke Backend Supabase Edge Function 'ai-chat'
  try {
    const res = await invokeEdgeFunction<{ success: boolean; text?: string; error?: string }>('ai-chat', {
      prompt: promptText,
      messages: formattedMessages,
      model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    });

    if (res?.text) {
      return res.text;
    }
    if (res?.error) {
      throw new Error(res.error);
    }
  } catch (edgeErr: any) {
    if (edgeErr.message) {
      throw edgeErr;
    }
  }

  throw new Error('OpenRouter API request failed. Please verify network connection and API key.');
}

export const AskGeminiModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<boolean>(false);

  // Load sessions from localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [createNewSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || '');

  useEffect(() => {
    if (!sessions.some((s) => s.id === activeSessionId)) {
      if (sessions.length > 0) {
        setActiveSessionId(sessions[0].id);
      } else {
        const fresh = createNewSession();
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      }
    }
  }, [sessions, activeSessionId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (_) {}
  }, [sessions]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  );

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [sessions, searchQuery]);

  const isNearBottom = () => {
    const el = chatScrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  const scrollToBottomIfNear = () => {
    if (isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottomIfNear();
  }, [activeSession?.messages, isLoading]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  const handleStartNewChat = () => {
    abortControllerRef.current = true;
    setIsLoading(false);
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setErrorMessage(null);
    setAttachedFileName(null);
    setShowSidebar(false);
  };

  const handleDeleteSession = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== idToDelete);
      return remaining.length === 0 ? [createNewSession()] : remaining;
    });
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle.trim() } : s))
    );
    setEditingSessionId(null);
  };

  const handleCopyCodeOrMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleFeedback = (messageId: string, liked: boolean) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === messageId ? { ...m, liked: m.liked === liked ? null : liked } : m
            ),
          };
        }
        return s;
      })
    );
  };

  const executeSendQuery = async (queryText: string, isRegenerate = false) => {
    if (!queryText.trim() || !activeSession) return;

    setErrorMessage(null);
    abortControllerRef.current = false;
    setIsLoading(true);

    let currentMessages = activeSession.messages;

    if (!isRegenerate) {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'user',
        text: attachedFileName ? `[Attached File: ${attachedFileName}]\n\n${queryText}` : queryText,
        timestamp: new Date().toISOString(),
      };

      const updatedTitle =
        activeSession.title === 'New Chat'
          ? queryText.slice(0, 24) + (queryText.length > 24 ? '...' : '')
          : activeSession.title;

      currentMessages = [...activeSession.messages, userMsg];

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, title: updatedTitle, updatedAt: new Date().toISOString(), messages: currentMessages }
            : s
        )
      );
      setInput('');
      setAttachedFileName(null);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }

    const assistantMsgId = crypto.randomUUID();
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? { ...s, messages: [...currentMessages, assistantPlaceholder] }
          : s
      )
    );

    try {
      const fullText = await fetchOpenRouterAIResponse(queryText, currentMessages);

      if (abortControllerRef.current) return;

      let currentLength = 0;
      const chunkSize = Math.max(2, Math.floor(fullText.length / 35));

      const streamInterval = setInterval(() => {
        if (abortControllerRef.current) {
          clearInterval(streamInterval);
          setIsLoading(false);
          return;
        }

        currentLength += chunkSize;
        const chunk = fullText.slice(0, currentLength);
        const isDone = currentLength >= fullText.length;

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSession.id) {
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, text: isDone ? fullText : chunk, isStreaming: !isDone }
                    : m
                ),
              };
            }
            return s;
          })
        );

        if (isDone) {
          clearInterval(streamInterval);
          setIsLoading(false);
        }
      }, 20);
    } catch (err: any) {
      if (abortControllerRef.current) return;
      setIsLoading(false);
      const errText = err?.message || 'Gemini 2.5 Flash encountered an error.';
      setErrorMessage(errText);

      // Remove incomplete placeholder message
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, messages: s.messages.filter((m) => m.id !== assistantMsgId) }
            : s
        )
      );
    }
  };

  const handleStopGenerating = () => {
    abortControllerRef.current = true;
    setIsLoading(false);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: s.messages.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
            }
          : s
      )
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
    }
  };

  const renderFormattedMarkdown = (text: string, msgId: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : 'code';
        const codeContent = language !== 'code' ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={index} className="my-2 rounded-2xl border border-aurora-500/20 bg-slate-950/90 overflow-hidden font-mono text-[11px] shadow-lg">
            <div className="flex items-center justify-between px-3 py-1 bg-aurora-500/10 border-b border-aurora-500/15 text-slate-400 text-[10px]">
              <span className="uppercase font-semibold text-aurora-300">{language}</span>
              <button
                onClick={() => handleCopyCodeOrMessage(`${msgId}-${index}`, codeContent)}
                className="flex items-center gap-1 hover:text-slate-200 transition-all cursor-pointer"
              >
                {copiedMessageId === `${msgId}-${index}` ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-2.5 overflow-x-auto text-slate-200 leading-relaxed custom-scrollbar">{codeContent}</pre>
          </div>
        );
      }

      const formatted = part
        .replace(/^### (.*$)/gim, '<h3 class="font-bold text-xs text-aurora-300 mt-1.5 mb-1">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="font-bold text-xs text-aurora-300 mt-1.5 mb-1">$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-aurora-200">$1</strong>')
        .replace(/`([^`]+)`/g, '<code class="bg-slate-900 px-1 py-0.5 rounded-lg text-aurora-300 font-mono text-[10px]">$1</code>');

      return (
        <span
          key={index}
          dangerouslySetInnerHTML={{ __html: formatted }}
          className="whitespace-pre-wrap leading-relaxed"
        />
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <GlassSurface borderRadius={24} width="auto" height="auto" className="shadow-2xl border border-aurora-500/40">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3.5 py-2 text-xs font-bold text-aurora-300 hover:text-white hover:bg-aurora-500/25 transition-all flex items-center gap-2 cursor-pointer shadow-glow-sm active:scale-95 rounded-full"
            title="Ask Skipper AI Assistant"
          >
            {isOpen ? (
              <>
                <X className="w-4 h-4 text-aurora-400" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 text-aurora-400" />
                <span>Ask AI</span>
              </>
            )}
          </button>
        </GlassSurface>
      </div>

      {/* Main Glass Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[320px] sm:w-[380px] h-[450px] max-h-[70vh] bg-slate-950/75 backdrop-blur-3xl border border-aurora-500/30 rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-2.5 bg-aurora-500/10 border-b border-aurora-500/20 flex items-center justify-between select-none flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  showSidebar
                    ? 'bg-aurora-500/25 border-aurora-500/40 text-aurora-300'
                    : 'bg-slate-900/60 border-aurora-500/20 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle History Sidebar"
              >
                <History className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <div className="p-1 rounded-xl bg-aurora-500/20 border border-aurora-500/30">
                  <Bot className="w-3.5 h-3.5 text-aurora-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100 leading-tight">Skipper</h3>
                  <p className="text-[9px] text-slate-400 truncate max-w-[140px] leading-tight">
                    {activeSession?.title || 'New Chat'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleStartNewChat}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-aurora-500/20 hover:bg-aurora-500/30 text-aurora-300 border border-aurora-500/30 transition-all flex items-center gap-1 cursor-pointer"
                title="Create New Chat"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-aurora-500/20 transition-all cursor-pointer"
                title="Close Window"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Sidebar */}
            {showSidebar && (
              <div className="w-48 bg-slate-950/95 border-r border-aurora-500/20 flex flex-col p-2.5 z-20 animate-in slide-in-from-left-3 duration-200 shadow-2xl flex-shrink-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[9px] font-mono font-bold text-aurora-300 uppercase tracking-wider">
                    History
                  </span>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative mb-2">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-7 pr-2.5 py-1 rounded-xl text-[10px] bg-slate-900/80 border border-aurora-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-aurora-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-200 text-[9px]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={handleStartNewChat}
                  className="w-full py-1.5 px-2.5 mb-2 rounded-xl bg-aurora-500/15 hover:bg-aurora-500/25 border border-aurora-500/30 text-aurora-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Chat</span>
                </button>

                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-0.5">
                  {filteredSessions.map((sess) => (
                    <div
                      key={sess.id}
                      onClick={() => {
                        setActiveSessionId(sess.id);
                        setShowSidebar(false);
                      }}
                      className={`w-full p-2 rounded-xl text-[11px] flex items-center justify-between group cursor-pointer transition-all ${
                        sess.id === activeSessionId
                          ? 'bg-aurora-500/25 text-aurora-200 border border-aurora-500/35 shadow-sm font-medium'
                          : 'text-slate-300 hover:bg-slate-900/80 hover:text-slate-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
                        <MessageSquare className="w-3 h-3 text-aurora-400 flex-shrink-0" />
                        {editingSessionId === sess.id ? (
                          <input
                            type="text"
                            value={editingTitleText}
                            onChange={(e) => setEditingTitleText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSession(sess.id, editingTitleText);
                            }}
                            onBlur={() => handleRenameSession(sess.id, editingTitleText)}
                            className="bg-slate-900 border border-aurora-400 rounded-lg px-1.5 py-0.5 text-[10px] text-white w-full focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate">{sess.title}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(sess.id);
                            setEditingTitleText(sess.title);
                          }}
                          className="p-0.5 text-slate-400 hover:text-aurora-300 transition-all cursor-pointer"
                          title="Rename Chat"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(sess.id, e)}
                          className="p-0.5 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                ref={chatScrollContainerRef}
                className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar"
              >
                {activeSession?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-aurora-500/20 border border-aurora-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-3 h-3 text-aurora-300" />
                      </div>
                    )}

                    <div
                      className={`max-w-[86%] px-3.5 py-2.5 rounded-2xl text-[11px] relative group ${
                        msg.sender === 'user'
                          ? 'bg-aurora-500/25 text-aurora-100 border border-aurora-500/35 rounded-tr-none shadow-md'
                          : 'bg-slate-900/80 text-slate-200 border border-aurora-500/15 rounded-tl-none leading-relaxed shadow-md'
                      }`}
                    >
                      <div>{renderFormattedMarkdown(msg.text, msg.id)}</div>

                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-teal-400 ml-1 animate-pulse align-middle" />
                      )}

                      <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-white/5 text-[9px] text-slate-400">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {msg.sender === 'assistant' && (
                            <>
                              <button
                                onClick={() => handleFeedback(msg.id, true)}
                                className={`hover:text-emerald-400 transition-all ${msg.liked === true ? 'text-emerald-400' : ''}`}
                                title="Good response"
                              >
                                <ThumbsUp className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(msg.id, false)}
                                className={`hover:text-rose-400 transition-all ${msg.liked === false ? 'text-rose-400' : ''}`}
                                title="Poor response"
                              >
                                <ThumbsDown className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => executeSendQuery(activeSession.messages[activeSession.messages.length - 2]?.text || 'Tell me more', true)}
                                className="hover:text-aurora-300 transition-all"
                                title="Regenerate answer"
                              >
                                <RefreshCw className="w-2.5 h-2.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleCopyCodeOrMessage(msg.id, msg.text)}
                            className="hover:text-aurora-300 transition-all"
                            title="Copy message text"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <User className="w-3 h-3 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Error Banner with Retry */}
                {errorMessage && (
                  <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                    <button
                      onClick={() => executeSendQuery(input || 'Retry')}
                      className="px-2.5 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-white font-semibold rounded-lg transition-all text-[10px] cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Retry
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-2.5 bg-slate-950/80 border-t border-aurora-500/15 flex-shrink-0">
                {attachedFileName && (
                  <div className="mb-1.5 px-2.5 py-0.5 rounded-xl bg-aurora-500/15 border border-aurora-500/30 text-aurora-300 text-[10px] flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Paperclip className="w-2.5 h-2.5" /> {attachedFileName}
                    </span>
                    <button onClick={() => setAttachedFileName(null)} className="text-slate-400 hover:text-slate-200">
                      ✕
                    </button>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeSendQuery(input);
                  }}
                  className="flex items-end gap-1.5"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-aurora-500/20 border border-aurora-500/20 text-slate-400 hover:text-aurora-300 transition-all cursor-pointer flex-shrink-0"
                    title="Attach File"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={handleTextareaChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          executeSendQuery(input);
                        }
                      }}
                      placeholder="Ask Skipper anything..."
                      rows={1}
                      className="w-full px-3 py-2 rounded-2xl text-[11px] bg-slate-900/90 border border-aurora-500/25 text-slate-100 placeholder-slate-500 focus:border-aurora-400 focus:outline-none transition-all custom-scrollbar resize-none pr-10"
                    />
                    <span className="absolute right-2.5 bottom-1.5 text-[8px] font-mono text-slate-500 select-none">
                      {input.length}/2000
                    </span>
                  </div>

                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleStopGenerating}
                      className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 transition-all cursor-pointer flex-shrink-0"
                      title="Stop Generating"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-2 rounded-xl bg-aurora-500/25 hover:bg-aurora-500/40 text-aurora-300 disabled:opacity-40 disabled:cursor-not-allowed border border-aurora-500/30 transition-all cursor-pointer flex-shrink-0"
                      title="Send Message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
