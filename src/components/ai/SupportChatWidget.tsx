"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  ShieldAlert,
  Sparkles,
  User,
  Bot,
  Calendar,
  FlaskConical,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isEmergency?: boolean;
  suggestedDoctors?: Array<{
    id: string;
    fullName: string;
    primarySpecialty: string | null;
    consultationFee: number;
  }>;
  suggestedDiagnostics?: Array<{
    id: string;
    name: string;
    category: string;
    basePrice: number;
  }>;
}

export function SupportChatWidget() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-msg",
      role: "assistant",
      content:
        "Hello! I am ShifaLink's automated healthcare support assistant. You can ask me about symptoms, doctor recommendations, diagnostic lab tests, or clinic scheduling.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMsgText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          locale,
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to contact assistant");
      }

      const data = await res.json() as {
        reply: string;
        isEmergency: boolean;
        suggestedDoctors?: Array<{
          id: string;
          fullName: string;
          primarySpecialty: string | null;
          consultationFee: number;
        }>;
        suggestedDiagnostics?: Array<{
          id: string;
          name: string;
          category: string;
          basePrice: number;
        }>;
      };

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        isEmergency: data.isEmergency,
        suggestedDoctors: data.suggestedDoctors,
        suggestedDiagnostics: data.suggestedDiagnostics,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Our automated guidance service is temporarily unavailable. If this is urgent, please call your local emergency service or reach out to our clinic team.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 ltr:right-5 rtl:left-5 rtl:right-auto">
      {/* Floating trigger toggle */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-13 w-13 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center p-0 transition-all hover:scale-105"
          aria-label="Open AI Healthcare Assistant"
        >
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <Sparkles className="h-3 w-3 text-amber-300 absolute -top-1 -right-1" />
          </div>
        </Button>
      )}

      {/* Chat pane */}
      {isOpen && (
        <Card className="w-[360px] sm:w-[400px] h-[540px] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
                  ShifaLink AI Guide
                  <Badge variant="secondary" className="bg-white/20 text-white text-[9px] px-1.5 py-0 border-0">
                    Pre-Triage
                  </Badge>
                </CardTitle>
                <p className="text-[10px] text-blue-100">Automated Clinical Routing</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 p-0 text-white hover:bg-white/20 rounded-full"
              aria-label="Close Chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          {/* Safety Disclaimer Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 p-2 text-[10px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>Not for medical emergencies. In urgent crisis, call 112/911/15 immediately.</span>
          </div>

          {/* Messages body */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div className="space-y-2 max-w-[82%]">
                    <div
                      className={`p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                        isUser
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : m.isEmergency
                          ? "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200 border border-red-200 dark:border-red-800/50 rounded-bl-xs font-medium"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs"
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* Interactive Doctors Pill */}
                    {m.suggestedDoctors && m.suggestedDoctors.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Quick Booking
                        </span>
                        {m.suggestedDoctors.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
                          >
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                Dr. {doc.fullName}
                              </p>
                              <p className="text-[10px] text-slate-500">{doc.primarySpecialty}</p>
                            </div>
                            <Button asChild size="sm" className="h-6 px-2 text-[10px] gap-1">
                              <Link href={`/doctors/${doc.id}`}>
                                <Calendar className="h-3 w-3" />
                                Book
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interactive Diagnostics Pill */}
                    {m.suggestedDiagnostics && m.suggestedDiagnostics.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Related Lab Tests
                        </span>
                        {m.suggestedDiagnostics.map((diag) => (
                          <div
                            key={diag.id}
                            className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
                          >
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {diag.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Rs. {diag.basePrice.toLocaleString()}
                              </p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="h-6 px-2 text-[10px] gap-1">
                              <Link href={`/lab-tests`}>
                                <FlaskConical className="h-3 w-3" />
                                View
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Evaluating safe recommendations…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Chat input footer */}
          <CardFooter className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <form onSubmit={handleSend} className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your health question…"
                disabled={loading}
                className="flex-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                disabled={loading || !input.trim()}
                className="h-8 w-8 rounded-full p-0 shrink-0 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
