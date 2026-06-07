"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "../layout";
import {
  Bot,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Calendar,
  Clock,
  Trash2,
  Send,
  CheckCircle,
  Copy,
  Check,
  User,
  AlertCircle,
  Plus,
  Mic,
  ThumbsUp,
  ThumbsDown,
  Share2,
  RefreshCw,
  MoreHorizontal
} from "lucide-react";

// Message interface
interface Message {
  role: "user" | "assistant";
  content: string;
  data?: any; // Custom metadata returned from API
  timestamp: string;
}

export default function AIAssistantPage() {
  const { currentOrg, user } = useWorkspace();
  const userFullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Operator Pro";
  const userInitials = userFullName
    .split(/\s+/)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const apiBaseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_BASE_URL || "https://api.leadforgen.in";

  // Web Audio programmatic chime sounds
  const playUserSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("User sound play blocked or failed", e);
    }
  };

  const playAISound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain1.gain.setValueAtTime(0.02, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
          gain2.gain.setValueAtTime(0.02, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.2);
        } catch { }
      }, 70);
    } catch (e) {
      console.warn("AI sound play blocked or failed", e);
    }
  };

  // Fake Fast Streaming Animation
  const streamAssistantMessage = (replyText: string, dataObj: any) => {
    setIsLoading(false);
    setIsStreaming(true);
    playAISound();

    // Add empty assistant message to thread
    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: "",
        data: dataObj,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    const words = replyText.split(" ");
    let currentWordIdx = 0;
    let currentText = "";

    const timer = setInterval(() => {
      if (currentWordIdx < words.length) {
        currentText += (currentWordIdx === 0 ? "" : " ") + words[currentWordIdx];
        setMessages(prev => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (lastIdx >= 0 && next[lastIdx].role === "assistant") {
            next[lastIdx] = {
              ...next[lastIdx],
              content: currentText
            };
          }
          return next;
        });
        currentWordIdx++;
      } else {
        clearInterval(timer);
        setIsStreaming(false);
      }
    }, 25);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading || isStreaming) return;

    const orgId = currentOrg?.id || "6980c0d8-bbdd-4a8a-ba66-7720750c4840";
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Play user pop sound
    playUserSound();

    // Add user message
    const newUserMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: timestampStr
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    const apiMessages = updatedMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const currentTimeString = new Date().toString();
    const payload = {
      messages: apiMessages,
      organization_id: orgId,
      currentTime: currentTimeString
    };

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const resData = await response.json();

      if (resData.success) {
        streamAssistantMessage(resData.reply || "Done.", resData.data || null);
      } else {
        streamAssistantMessage(resData.reply || "Failed to process chat pipeline. Please refine your inputs.", null);
      }
    } catch (err: any) {
      console.error(err);
      streamAssistantMessage("I'm having trouble communicating with Kai's server. Please make sure the service is available.", null);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const handleRegenerateMessage = async (index: number) => {
    if (isLoading || isStreaming || index < 1) return;

    // Retrieve the user prompt that generated this message
    const promptText = messages[index - 1]?.content;
    if (!promptText) return;

    setIsLoading(true);

    // Truncate message log to user message
    const truncatedHistory = messages.slice(0, index);
    setMessages(truncatedHistory);

    const apiMessages = truncatedHistory.map(m => ({
      role: m.role,
      content: m.content
    }));

    const orgId = currentOrg?.id || "6980c0d8-bbdd-4a8a-ba66-7720750c4840";
    const currentTimeString = new Date().toString();

    const payload = {
      messages: apiMessages,
      organization_id: orgId,
      currentTime: currentTimeString
    };

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const resData = await response.json();

      if (resData.success) {
        streamAssistantMessage(resData.reply || "Done.", resData.data || null);
      } else {
        streamAssistantMessage(resData.reply || "Failed to process chat pipeline. Please refine your inputs.", null);
      }
    } catch (err: any) {
      console.error(err);
      streamAssistantMessage("I'm having trouble communicating with Kai's server. Please make sure the service is available.", null);
    }
  };

  const starterPrompts = [
    { text: "create appointment", action: "Create an appointment" },
    { text: "search customer Kartik", action: "Search customers" },
    { text: "check slot availability for tomorrow", action: "Check slot availability" }
  ];

  // Helper to check and render special data structure
  const renderDataCard = (data: any) => {
    if (!data) return null;

    // 1. If it's an error status, do not show any card (the assistant text bubble handles the reply)
    if (data.status === "error") {
      return null;
    }

    // 2. If it's successful appointment data
    if (data.appointment_date && data.status !== "error") {
      const apptDate = new Date(data.appointment_date);
      return (
        <div className="mt-3.5 p-4 rounded-xl border border-primary/20 bg-primary/5 shadow-inner space-y-3 max-w-full animate-reveal-up text-xs">
          <div className="flex items-center justify-between border-b border-primary/10 pb-2">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Appointment Booked Successfully
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 capitalize">
              {data.status || "scheduled"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Subject / Title</span>
              <span className="font-bold text-foreground">{data.title || "Untitled Appointment"}</span>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Date & Time</span>
              <span className="font-bold text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary" />
                {apptDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                <span className="text-muted-foreground">@</span>
                <Clock className="h-3 w-3 text-primary" />
                {apptDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Appointment ID</span>
              <span className="font-mono text-[10px] text-foreground/80 truncate block max-w-[180px]">{data.id || "N/A"}</span>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Organization ID</span>
              <span className="font-mono text-[10px] text-foreground/80 truncate block max-w-[180px]">{data.organization_id || "N/A"}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
            <span>CRM Database Status: Synced</span>
            <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Real-Time Sync Active</span>
          </div>
        </div>
      );
    }

    // 3. If it's a list of customer search results (Array)
    if (Array.isArray(data) && data.length > 0) {
      return (
        <div className="mt-3.5 p-4 rounded-xl border border-border bg-card/60 shadow-soft space-y-2.5 max-w-full animate-reveal-up text-xs">
          <div className="font-bold text-foreground/80 border-b border-border pb-1.5 flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" />
            Matching Customers ({data.length})
          </div>
          <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
            {data.map((c: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted transition-colors">
                <div className="space-y-0.5">
                  <div className="font-bold text-foreground">{c.name || "Unknown"}</div>
                  <div className="text-[10px] text-muted-foreground">{c.email || "No email"}</div>
                </div>
                {c.id && (
                  <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/30">
                    ID: {c.id.slice(0, 8)}...
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4. If it's a single customer profile
    if (data.name && (data.email || data.phone) && !data.appointment_date) {
      return (
        <div className="mt-3.5 p-4 rounded-xl border border-border bg-card/60 shadow-soft space-y-2.5 max-w-full animate-reveal-up text-xs">
          <div className="font-bold text-foreground/80 border-b border-border pb-1.5 flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" />
            Customer Profile
          </div>
          <div className="space-y-1">
            <div>
              <span className="text-muted-foreground uppercase text-[9px] font-bold">Name</span>
              <div className="font-bold text-foreground">{data.name}</div>
            </div>
            {data.email && (
              <div>
                <span className="text-muted-foreground uppercase text-[9px] font-bold">Email</span>
                <div className="font-bold text-foreground">{data.email}</div>
              </div>
            )}
            {data.phone && (
              <div>
                <span className="text-muted-foreground uppercase text-[9px] font-bold">Phone</span>
                <div className="font-bold text-foreground">{data.phone}</div>
              </div>
            )}
            {data.id && (
              <div>
                <span className="text-muted-foreground uppercase text-[9px] font-bold">Customer ID</span>
                <div className="font-mono text-[10px] text-foreground/80 truncate">{data.id}</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] w-full max-w-4xl mx-auto relative px-2 sm:px-6">

      {/* Top Header Controls (Minimalist inline bar) */}
      <div className="flex justify-between items-center py-2 shrink-0 border-b border-border/10">

        <div className="flex items-center gap-3">
          {hasMessages && !isLoading && !isStreaming && (
            <button
              onClick={handleClearHistory}
              title="Reset conversation"
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-border/20 bg-card/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Console Viewports */}
      <div className="flex-1 flex flex-col justify-between relative min-h-0">

        {/* Welcome State (Centered Gemini screen layout) */}
        {!hasMessages && !isLoading && !isStreaming ? (
          <div className="flex-1 flex flex-col justify-center items-center py-16 animate-fade-in text-center select-none">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground/90 mb-10 leading-snug">
              How can I help manage your leads and bookings today?
            </h2>

            {/* Big Centered Input Box */}
            <div className="w-full max-w-2xl px-4 space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex items-center gap-3 px-5 py-3.5 rounded-[30px] bg-muted/65 border border-border/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/40 transition-all shadow-soft"
              >
                <button type="button" className="text-muted-foreground/50 hover:text-foreground transition-colors p-1">
                  <Plus className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  disabled={isLoading || isStreaming}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 min-w-0 bg-transparent border-0 px-2 py-1 text-sm focus:ring-0 focus:outline-none text-foreground"
                />
                <button type="button" className="text-muted-foreground/50 hover:text-foreground transition-colors p-1">
                  <Mic className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading || isStreaming}
                  className="p-2 bg-foreground text-background disabled:opacity-40 hover:bg-foreground/95 rounded-full transition-all shrink-0 flex items-center justify-center cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              {/* Grid Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
                {starterPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(prompt.text)}
                    className="px-4 py-2 text-xs font-semibold text-foreground/80 bg-card border border-border hover:border-primary/40 hover:bg-muted/40 transition-all rounded-full cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3 w-3 text-primary" />
                    {prompt.action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (

          /* Conversations feed scroll viewport */
          <div className="flex-1 overflow-y-auto space-y-7 py-6 px-1 pb-40 scrollbar-none">
            {messages.map((message, i) => (
              <div key={i} className="w-full flex flex-col space-y-1.5">

                {/* User message block */}
                {message.role === "user" ? (
                  <div className="flex justify-end w-full animate-reveal-up gap-3 items-end">
                    <div className="bg-[#6366F1] text-white text-sm font-medium px-4 py-2.5 rounded-[20px] rounded-br-none max-w-[80%] shadow-sm">
                      {message.content}
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#0088FF] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold shadow-soft shrink-0 select-none">
                      {userInitials}
                    </div>
                  </div>
                ) : (

                  /* Assistant message block (Clean bubble layout) */
                  <div className="flex flex-col items-start w-full space-y-1.5 bubble-pop">

                    {/* Avatar header */}
                    <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-wider select-none pl-1">
                      <img src="/logo.png" alt="Logo" className="h-4.5 w-4.5 object-contain shrink-0" />
                      <span>Kai</span>
                    </div>

                    {/* Bot Response Bubble */}
                    <div className="bg-muted text-foreground text-sm font-normal leading-relaxed px-4 py-2.5 rounded-[20px] rounded-bl-none max-w-[85%] shadow-sm whitespace-pre-wrap">
                      {message.content}
                    </div>

                    {/* Dynamic structured details cards */}
                    {message.data && (
                      <div className="w-full max-w-[85%] pl-1">
                        {renderDataCard(message.data)}
                      </div>
                    )}

                    {/* Micro actions bottom row */}
                    <div className="flex items-center gap-3 text-muted-foreground/45 pt-1.5 select-none">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(message.content);
                          setCopiedMessageIndex(i);
                          setTimeout(() => setCopiedMessageIndex(null), 2000);
                        }}
                        className="hover:text-foreground transition-colors p-1 flex items-center gap-1.5"
                        title="Copy reply"
                      >
                        {copiedMessageIndex === i ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-emerald-500 font-bold">Copied</span>
                          </>
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRegenerateMessage(i)}
                        disabled={isLoading || isStreaming}
                        className="hover:text-foreground disabled:opacity-30 transition-colors p-1"
                        title="Regenerate"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Bot loading typing animation state */}
            {isLoading && (
              <div className="flex flex-col items-start w-full space-y-2.5 animate-pulse pl-1.5">
                <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-wider">
                  <img src="/logo.png" alt="Logo" className="h-4.5 w-4.5 object-contain shrink-0" />
                  <span>Kai is thinking...</span>
                </div>
                <div className="flex items-center gap-1.5 py-1 px-0.5">
                  <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Active Conversation Sticky Input Bar (Gemini bottom styled input) */}
        {hasMessages && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-4 shrink-0 pointer-events-none">
            <div className="w-full space-y-3">


              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex items-center gap-3 px-5 py-3 rounded-[30px] bg-muted/65 border border-border/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/40 transition-all shadow-soft pointer-events-auto"
              >
                <button type="button" className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 shrink-0">
                  <Plus className="h-4.5 w-4.5" />
                </button>
                <input
                  type="text"
                  disabled={isLoading || isStreaming}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 min-w-0 bg-transparent border-0 px-2 py-1 text-sm focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground"
                />
                <button type="button" className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 shrink-0">
                  <Mic className="h-4.5 w-4.5" />
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading || isStreaming}
                  className="p-1.5 bg-foreground text-background disabled:opacity-40 hover:bg-foreground/95 rounded-full transition-all shrink-0 flex items-center justify-center cursor-pointer aspect-square"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>

              <div className="flex justify-between items-center px-2 text-[10px] text-muted-foreground select-none pointer-events-auto">
                <span>Organization context dynamically set to <span className="font-bold text-foreground">{currentOrg?.name || "Workspace"}</span></span>
                <span className="font-mono text-[9px] bg-muted px-1.5 py-0.5 rounded border border-border/20">GMT+0530 Sync</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
