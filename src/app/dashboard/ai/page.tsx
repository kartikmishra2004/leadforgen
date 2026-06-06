"use client";

import React, { useState, useEffect } from "react";
import { useWorkspace } from "../layout";
import { supabase } from "@/lib/supbase/client";
import { Bot, MessageSquare, Send, Sparkles, User, ShieldCheck, Clock, Brain } from "lucide-react";

export default function AIAssistantPage() {
  const { currentOrg, setRlsErrors } = useWorkspace();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);

  // Playground state
  const [playgroundMsgs, setPlaygroundMsgs] = useState<any[]>([
    { role: "assistant", content: `Hi there! How can I assist you with scheduling an appointment or checking details today?` }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(
    "You are an expert AI booking assistant for local service businesses. Be polite, ask for the customer's email and phone, and direct them to schedule an appointment."
  );

  const orgId = currentOrg?.id || "demo-org-id";
  const businessName = currentOrg?.name || "our shop";

  const fetchConversations = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) {
        setRlsErrors(prev => [...prev, `ai_conversations: ${error.message}`]);
      } else {
        setConversations(data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
    // Reset sandbox greetings on workspace changes
    setPlaygroundMsgs([
      { role: "assistant", content: `Hi there! I'm your AI Receptionist at ${businessName}. How can I assist you with scheduling an appointment or pricing today?` }
    ]);
  }, [currentOrg]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMessage = { role: "user", content: inputMsg };
    setPlaygroundMsgs(prev => [...prev, userMessage]);
    setInputMsg("");
    setIsTyping(true);

    setTimeout(() => {
      let aiReply = "";
      const query = inputMsg.toLowerCase();
      if (query.includes("book") || query.includes("schedule") || query.includes("appointment")) {
        aiReply = `I'd love to help you book! What service type are you looking for, and what day works best?`;
      } else if (query.includes("price") || query.includes("cost") || query.includes("quote")) {
        aiReply = `Our service rates start at $99. To send you a detailed quote, could you please provide your zip code and email?`;
      } else if (query.includes("hello") || query.includes("hi")) {
        aiReply = `Hello! How can I assist you with bookings or quotes today?`;
      } else {
        aiReply = `Thanks for reaching out! I've noted down your request: "${inputMsg}". Is there a phone number or email I can reach you at to confirm details?`;
      }

      setPlaygroundMsgs(prev => [...prev, { role: "assistant", content: aiReply }]);
      setIsTyping(false);
    }, 1100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-pulse">
        {/* Left config & history skeletons */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card/40 border border-border/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
              <div className="h-8 w-8 bg-slate-200 rounded-lg" />
              <div className="space-y-1.5 w-1/3">
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200/50 rounded" />
              </div>
            </div>
            <div className="h-20 bg-slate-100/50 rounded-xl w-full" />
          </div>

          <div className="bg-card/40 border border-border/50 rounded-2xl p-5 space-y-4">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-12 bg-slate-100/70 rounded-xl w-full" />
            <div className="h-12 bg-slate-100/70 rounded-xl w-full" />
            <div className="h-12 bg-slate-100/70 rounded-xl w-full" />
          </div>
        </div>

        {/* Right Sandbox Playground skeleton */}
        <div className="lg:col-span-5 bg-card/40 border border-border/50 rounded-2xl p-5 h-[480px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-12 bg-slate-200/50 rounded" />
          </div>
          <div className="flex-1 py-4 space-y-4">
            <div className="h-12 bg-slate-100/50 rounded-xl w-2/3 self-start" />
            <div className="h-12 bg-slate-100/50 rounded-xl w-2/3 ml-auto" />
          </div>
          <div className="h-9 bg-slate-200/40 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-reveal-up">
      {/* Configuration & Chat History (Left) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Setup Configuration Panel */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Brain className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">AI Receptionist instructions</h2>
              <p className="text-[10px] text-muted-foreground">Adjust how the chatbot interacts and answers customer questions.</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-muted-foreground">System Guidelines</label>
              <textarea
                rows={3}
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground bg-muted/20 border border-border/50 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>AI receptionist live on portal</span>
              </div>
              <span>Status: Active</span>
            </div>
          </div>
        </div>

        {/* Customer chat logs */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-bold text-foreground">AI Chat logs history</h3>
            <span className="text-[9px] font-bold text-muted-foreground font-mono">Conversations</span>
          </div>

          {conversations.length === 0 ? (
            /* Empty State */
            <div className="p-8 text-center text-xs text-muted-foreground italic border border-dashed border-border rounded-xl bg-muted/10 flex items-center justify-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-muted-foreground/60" />
              <span>No active chats logged between AI receptionist and customers yet.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {conversations.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3 bg-muted/15 border border-border/50 rounded-xl flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors
                    ${selectedChat?.id === chat.id ? "bg-primary/5 border-primary/25" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-[#6366F1] flex items-center justify-center text-white text-[10px] font-bold">
                      {chat.customer_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{chat.customer_name || "Visitor"}</p>
                      <p className="text-[9px] text-muted-foreground">{chat.customer_email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(chat.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded-full">
                      {chat.conversation?.length} messages
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Chat Sandbox Playground */}
      <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 shadow-soft flex flex-col justify-between h-[480px] relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-4.5 w-4.5 text-[#6366F1]" />
            <div className="text-left">
              <h3 className="text-xs font-bold text-foreground">AI receptionist playground</h3>
              <p className="text-[8px] text-slate-400">Sandbox testing channel</p>
            </div>
          </div>
          <button 
            onClick={() => setPlaygroundMsgs([
              { role: "assistant", content: `Hi there! I'm your AI Receptionist at ${businessName}. How can I assist you with scheduling an appointment or pricing today?` }
            ])}
            className="text-[9px] font-bold text-muted-foreground hover:text-foreground"
          >
            Reset Chat
          </button>
        </div>

        {/* Selected Chat Log Thread OR Playground messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-xs">
          {selectedChat ? (
            <div className="space-y-4 animate-reveal-up">
              <div className="bg-muted/45 p-2 border border-border rounded-xl flex items-center justify-between">
                <span className="text-[9px] font-bold text-muted-foreground">Reviewing Customer Log Chat: {selectedChat.customer_name}</span>
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="text-[9px] font-bold text-primary hover:underline"
                >
                  Switch to sandbox
                </button>
              </div>
              {selectedChat.conversation.map((msg: any, idx: number) => {
                const isAI = msg.role === "assistant";
                return (
                  <div key={idx} className={`flex items-start gap-2.5 ${isAI ? "" : "flex-row-reverse"}`}>
                    <div className={`h-6.5 w-6.5 rounded-full shrink-0 flex items-center justify-center font-bold text-[9px]
                      ${isAI ? "bg-emerald-500/10 text-emerald-500" : "bg-primary text-white"}`}>
                      {isAI ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3 w-3" />}
                    </div>
                    <div className={`p-3 rounded-xl max-w-[80%] leading-relaxed font-medium
                      ${isAI ? "bg-muted/40 text-foreground" : "bg-primary/5 text-foreground border border-primary/20"}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Sandbox view
            playgroundMsgs.map((msg, idx) => {
              const isAI = msg.role === "assistant";
              return (
                <div key={idx} className={`flex items-start gap-2.5 ${isAI ? "" : "flex-row-reverse"} animate-reveal-up`}>
                  <div className={`h-6.5 w-6.5 rounded-full shrink-0 flex items-center justify-center font-bold text-[9px]
                    ${isAI ? "bg-[#6366F1]/10 text-[#6366F1]" : "bg-primary text-white"}`}>
                    {isAI ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3 w-3" />}
                  </div>
                  <div className={`p-3 rounded-xl max-w-[80%] leading-relaxed font-medium
                    ${isAI ? "bg-muted/40 text-foreground" : "bg-primary/5 text-foreground border border-primary/20"}`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="flex items-start gap-2.5">
              <div className="h-6.5 w-6.5 rounded-full shrink-0 bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
              </div>
              <div className="p-3 bg-muted/40 text-muted-foreground rounded-xl text-[10px] font-bold">
                AI receptionist typing...
              </div>
            </div>
          )}
        </div>

        {/* Input sender */}
        <form onSubmit={handleSendMessage} className="border-t border-border pt-3.5 shrink-0 flex gap-2">
          <input
            type="text"
            disabled={!!selectedChat}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={selectedChat ? "In viewing log mode..." : "Ask sandbox: 'Book inspection'..."}
            className="flex-1 px-3 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!!selectedChat || !inputMsg.trim()}
            className="px-3.5 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-md disabled:opacity-50 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
