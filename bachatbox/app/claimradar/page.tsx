"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserButton, useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { useRouter } from 'next/navigation';
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  IconReceipt,
  IconChartBar,
  IconTable,
  IconMessageCircle,
  IconSparkles,
  IconUsers,
  IconBook,
  IconTrendingUp,
  IconShieldCheck 
} from "@tabler/icons-react";

// --- Constants ---
const AGENT_STATUS: Record<string, string> = {
  INTEL_CRAWLER:   "thinking",
  DEVILS_ADVOCATE: "thinking",
  VERDICT_ENGINE:  "deliberating",
};

const VERDICT_META: Record<string, { label: string; sub: string }> = {
  SUPPORTED: { label: "↳ THE CLAIM IS TRUE",        sub: "Evidence corroborates the assertion"      },
  REFUTED:   { label: "↳ THE CLAIM IS FALSE",       sub: "Evidence contradicts the assertion"       },
  ERROR:     { label: "↳ PROCESS FAILED",           sub: "System encountered a critical fault"      },
  UNCERTAIN: { label: "↳ INSUFFICIENT EVIDENCE",    sub: "Claim could not be conclusively verified" },
};

// --- Logo Components ---
const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-black w-[10vh] h-[10vh] md:w-[4.9vh] md:h-[4.9vh]"
      >
        <path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/>
        <path d="M16 10h.01"/>
        <path d="M2 8v1a2 2 0 0 0 2 2h1"/>
      </svg>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[1.6vw] font-semibold tracking-tight text-black"
      >
        BachatBox
      </motion.span>
    </div>
  );
};

const LogoIcon = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-black w-[5vh] h-[5vh] md:w-[4.9vh] md:h-[4.9vh]"
      >
        <path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/>
        <path d="M16 10h.01"/>
        <path d="M2 8v1a2 2 0 0 0 2 2h1"/>
      </svg>
    </div>
  );
};

export default function FinancialClaimRadar() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // App States
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Claim Radar States
  const [inputData,     setInputData]     = useState("");
  const [image,         setImage]         = useState<string | null>(null);
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [streamText,    setStreamText]    = useState("");
  const [thinkingAgent, setThinkingAgent] = useState<string | null>(null);
  const [turnCount,     setTurnCount]     = useState(0);
  const [verdict,       setVerdict]       = useState<{
    verdict: string; confidence: number; summary: string;
  } | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  const AGENT_STYLES: Record<string, { badge: string; card: string; text: string }> = {
    INTEL_CRAWLER: { 
      badge: "bg-black text-white",                      
      card: "border-zinc-200 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)]",
      text: "text-zinc-800"
    },
    DEVILS_ADVOCATE: { 
      badge: "bg-zinc-600 text-white",                    
      card: "border-zinc-200 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)]",
      text: "text-zinc-800"
    },
    VERDICT_ENGINE: { 
      badge: "bg-white text-black border-2 border-black", 
      card: "border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
      text: "text-zinc-800"
    },
  };

  const links = [
    { label: "Balance Sheet", href: "/apppage", icon: <IconReceipt className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/apppage') },
    { label: "Visualise Stats", href: "/visualise", icon: <IconChartBar className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/visualise') },
    { label: "AI Dashboard", href: "/advice", icon: <IconTable className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/advice') },
    { label: "BudgetBot", href: "/chatbot", icon: <IconMessageCircle className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/chatbot') },
    { label: "What-If Simulator", href: "/simulator", icon: <IconSparkles className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/simulator') },
    { label: "SplitWise", href: "/splitwise", icon: <IconUsers className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/splitwise') },
    { label: "Financial Reads", href: "/financial-reads", icon: <IconBook className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/financial-reads') },
    { label: "Stock Market", href: "/investment", icon: <IconTrendingUp className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/investment') },
    { label: "Claim Radar", href: "/claimradar", icon: <IconShieldCheck className="h-7 w-7 shrink-0 text-black" />, onClick: () => router.push('/claimradar') },
  ];
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamText, thinkingAgent]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let { width, height } = img;
        if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
        else                { if (height > MAX) { width *= MAX / height; height = MAX; } }
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        setImage(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const executeAnalysis = async () => {
    if (!inputData.trim() && !image) return;
    setIsProcessing(true);
    setVerdict(null);
    setStreamText("");
    setThinkingAgent(null);
    setTurnCount(0);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputData, image }),
      });
      if (!response.body) throw new Error("No stream body");

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false, buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              if (data.type === "thinking") {
                setThinkingAgent(null);
                setStreamText((prev) => prev + data.content);
              } else if (data.type === "agent_thinking") {
                if (data.agent) setTurnCount((p) => p + 1);
                setThinkingAgent(data.agent || null);
              } else if (data.type === "final") {
                setThinkingAgent(null);
                setVerdict({ verdict: data.verdict, confidence: data.confidence, summary: data.summary });
                setIsProcessing(false);
              } else if (data.type === "error") {
                setThinkingAgent(null);
                setVerdict({ verdict: "ERROR", confidence: 0, summary: data.message || "A system fault occurred." });
                setIsProcessing(false);
              }
            } catch (_) {}
          }
        }
      }
    } catch {
      setThinkingAgent(null);
      setStreamText((p) => p + "\n\n[SYSTEM]: Connection interrupted.");
      setIsProcessing(false);
    }
  };

  const renderDialogue = () => {
    const blocks = streamText.split("\n\n").filter((b) => b.trim());
    return blocks.map((block, idx) => {
      if (block.startsWith("◦") || block.startsWith("[SYSTEM]")) {
        return (
          <div key={idx} className="mb-2 flex items-center gap-2 px-1 animate-in fade-in duration-200">
            <div className="w-1 h-1 rounded-full flex-shrink-0 bg-zinc-300" />
            <span className="font-mono text-xs uppercase tracking-widest leading-relaxed text-zinc-500">
              {block.replace(/^◦+\s*/, "").replace("[SYSTEM]: ", "")}
            </span>
          </div>
        );
      }
      const agentMatch = block.match(/^(\[[A-Z_]+\]:?)\s*([\s\S]*)/i);
      if (agentMatch) {
        const tag   = agentMatch[1].replace(/[\[\]:]/g, "");
        const style = AGENT_STYLES[tag] || { 
          badge: "bg-zinc-200 text-zinc-700", 
          card: "border-zinc-100 bg-white",
          text: "text-zinc-800"
        };
        return (
          <div key={idx} className={`mb-4 p-5 border-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${style.card}`}>
            <span className={`font-mono font-bold text-xs uppercase tracking-widest px-2 py-1 inline-block mb-3 ${style.badge}`}>
              {tag.replace(/_/g, " ")}
            </span>
            <p className={`font-sans text-sm leading-relaxed ${style.text}`}>{agentMatch[2]}</p>
          </div>
        );
      }
      return (
        <div key={idx} className="mb-2 p-3 border font-mono text-xs leading-relaxed animate-in fade-in border-zinc-200 bg-zinc-50 text-zinc-600">
          {block}
        </div>
      );
    });
  };

  const isDisabled = !inputData.trim() && !image;

  return (
    <>
      <style>{`
        .no-sb::-webkit-scrollbar { display: none; }
        .no-sb { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <SignedIn>
        <div className="bg-[#ecf8e5] min-h-screen font-sans text-black selection:bg-black selection:text-white">
          
          {/* Global Dot Grid matching Mint Theme */}
          <div className="fixed inset-0 pointer-events-none transition-colors duration-300" style={{
            backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }} />

          {/* Fixed Sidebar */}
          <div className="fixed top-0 left-0 h-screen z-30">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
              <SidebarBody className="justify-between gap-10 bg-[#ecf8e5] h-full">
                <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                  <div 
                    className="cursor-pointer"
                    onMouseEnter={() => setSidebarOpen(true)}
                    onMouseLeave={() => setSidebarOpen(false)}
                  >
                    {sidebarOpen ? <Logo /> : <LogoIcon />}
                  </div>
                  <div className="mt-8 flex flex-col gap-2">
                    {links.map((link, idx) => (
                      <div key={idx} onClick={link.onClick} className="cursor-pointer">
                        <SidebarLink link={link} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <SidebarLink
                    link={{
                      label: user?.username || 'User',
                      href: "#",
                      icon: (
                        <div className="h-7 w-7 shrink-0 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                          {(user?.username?.[0] || user?.firstName?.[0] || 'U').toUpperCase()}
                        </div>
                      ),
                    }}
                  />
                </div>
              </SidebarBody>
            </Sidebar>
          </div>

          {/* Main Content Area */}
          <div className={cn(
            "relative z-10 transition-all duration-300 ease-in-out flex flex-col min-h-screen",
            sidebarOpen ? "ml-64" : "ml-16"
          )}>
            
            {/* Fixed Top Navbar & Claim Radar Header */}
            <div className="sticky top-0 z-20 flex ml-4 items-center justify-between min-h-[9.5vh] py-3 bg-[#ecf8e5]/90 backdrop-blur-sm px-6 sm:px-8 border-b border-gray-200/50">
              
              {/* Left Side: Title & Subtitle (Smaller Font) */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 hidden sm:flex items-center justify-center flex-shrink-0 bg-black shadow-sm">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#ecf8e5]" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none text-black">
                    FINANCIAL Claim Radar
                  </h1>
                  <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest mt-0.5 text-zinc-500">
                    Fact-Checking Copilot Protocol
                  </p>
                </div>
              </div>

              {/* Right Side: Badges, Status, and User Pill (Smaller Font) */}
              <div className="flex items-center gap-4 sm:gap-6">
                
                {/* Tech Stack Badges */}
                <div className="hidden lg:flex items-center gap-4">
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium">LangChain</span>
                    <div className="w-1 h-1 rounded-full bg-zinc-300" />
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Multi-Agent Parliament</span>
                  </div>

                  {isProcessing && (
                    <div className="flex items-center gap-1.5 border-2 px-2 py-1 animate-in fade-in whitespace-nowrap border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {[0, 120, 240].map((d) => (
                        <div key={d} className="w-1.5 h-1.5 rounded-full animate-bounce bg-black" style={{ animationDelay: `${d}ms` }} />
                      ))}
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest ml-1 text-black">Analyzing</span>
                    </div>
                  )}
                </div>

                {/* Processing Indicator (Mobile Fallback) */}
                {isProcessing && (
                  <div className="flex lg:hidden items-center gap-1">
                    {[0, 120, 240].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 rounded-full animate-bounce bg-black" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                )}

                {/* User Pill */}
                <div
                  className="inline-flex w-auto items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-semibold text-black shadow-sm ring-inset ring-gray-300 transition-all duration-200 hover:bg-gray-50 hover:shadow-md cursor-pointer"
                  onClick={() => {
                    const btn = triggerRef.current?.querySelector('button');
                    btn?.click();
                  }}
                >
                  <span className="truncate max-w-[100px] sm:max-w-[150px]">{user?.username || 'User'}</span>
                  <div ref={triggerRef} className="relative">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          userButtonPopoverCard: {
                            transform: 'translateY(3.5vh)',
                            '@media (max-width: 768px)': {
                              transform: 'translateY(3.5vh) translateX(4vw)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Claim Radar Body - Narrower max-width and centered items */}
            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 sm:px-12 pb-10">

              {/* INPUT PHASE - Restored justify-center and py-12 for perfect vertical centering */}
              {!isProcessing && !verdict && (
                <div className="flex-grow flex flex-col items-center justify-center py-12 animate-in fade-in duration-300">
                  <div className="w-full flex flex-col gap-4">
                    <div className="relative">
                      <textarea
                        className="w-full h-40 sm:h-48 p-6 text-base font-sans border-2 focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] resize-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white border-black text-black placeholder-zinc-400"
                        placeholder="Enter a financial claim... (Enter to submit · Shift+Enter for newline · Paste image directly)"
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (!isDisabled) executeAnalysis();
                          }
                        }}
                        onPaste={(e) => {
                          const items = Array.from(e.clipboardData.items);
                          const imageItem = items.find((item) => item.type.startsWith("image/"));
                          if (imageItem) {
                            e.preventDefault();
                            const file = imageItem.getAsFile();
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const MAX = 800;
                                let { width, height } = img;
                                if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
                                else                { if (height > MAX) { width *= MAX / height; height = MAX; } }
                                canvas.width = width; canvas.height = height;
                                canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
                                setImage(canvas.toDataURL("image/jpeg", 0.7));
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {inputData.length > 0 && (
                        <span className="absolute bottom-3 right-4 font-mono text-xs pointer-events-none text-zinc-400">
                          {inputData.length}
                        </span>
                      )}
                    </div>

                    {image && (
                      <div className="flex items-center gap-4 p-4 border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-200 border-black bg-white">
                        <img src={image} alt="Uploaded" className="w-12 h-12 object-cover border flex-shrink-0 border-zinc-200" />
                        <div className="flex-grow min-w-0">
                          <span className="font-mono text-xs font-bold uppercase tracking-widest block text-black">Image attached</span>
                          <span className="font-mono text-xs mt-0.5 block text-zinc-500">Will be decoded before analysis</span>
                        </div>
                        <button
                          onClick={() => setImage(null)}
                          className="font-mono text-xs uppercase font-bold px-2 py-1 border transition-colors flex-shrink-0 text-red-500 hover:text-red-700 border-red-200 hover:border-red-400 hover:bg-red-50"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="font-mono text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 text-zinc-500 hover:text-black"
                      >
                        <span className="text-sm">⊕</span>
                        {image ? "Change Image" : "Attach Image"}
                      </button>

                      <button
                        onClick={executeAnalysis}
                        disabled={isDisabled}
                        className="px-7 py-3 font-bold uppercase tracking-widest text-xs transition-all border-2 bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-zinc-800 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                      >
                        Run Verification →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PROCESSING PHASE */}
              {isProcessing && (
                <div className="flex-grow flex flex-col py-6">
                  <div className="flex-shrink-0 flex items-center justify-between mb-5">
                    <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 font-medium">Debate in progress</span>
                    {turnCount > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={`w-5 h-1 transition-all duration-500 ${i < turnCount ? "bg-black" : "bg-zinc-200"}`} />
                          ))}
                        </div>
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-500">
                          {Math.min(turnCount, 6)} / 6
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative flex-grow min-h-0">
                    <div className="absolute inset-0 overflow-y-auto no-sb pb-16">
                      {renderDialogue()}

                      {thinkingAgent && (
                        <div className="mb-4 flex items-center gap-3 p-4 border-2 border-dashed animate-in fade-in duration-150 border-zinc-300 bg-white/60">
                          <div className="flex gap-1">
                            {[0, 140, 280].map((d) => (
                              <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce bg-zinc-400" style={{ animationDelay: `${d}ms` }} />
                            ))}
                          </div>
                          <span className="font-mono text-xs uppercase tracking-widest font-bold text-zinc-600">
                            [{thinkingAgent.replace(/_/g, " ")}]{" "}
                            <span className="font-normal text-zinc-500">
                              {AGENT_STATUS[thinkingAgent] ?? "thinking"}...
                            </span>
                          </span>
                        </div>
                      )}

                      <div ref={terminalEndRef} className="h-4" />
                    </div>
                    {/* Gradient bottom fade dynamically matches the mint bg color */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-[#ecf8e5] to-transparent" />
                  </div>
                </div>
              )}

              {/* VERDICT PHASE */}
              {verdict && !isProcessing && (
                <div className="flex-grow flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in-95 duration-500">
                  <div className={`w-full border-4 p-6 sm:p-10 transition-colors duration-300 ${
                    verdict.verdict === "SUPPORTED" || verdict.verdict === "REFUTED" ? "bg-white border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "bg-white border-zinc-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.12)]"
                  }`}>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-6 mb-6 border-b-2 border-zinc-100">
                      <div>
                        <span className="font-mono text-xs font-bold uppercase tracking-widest block mb-2 text-zinc-500">Conclusion</span>
                        <h2 className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none text-black ${
                          verdict.verdict === "REFUTED" ? `line-through decoration-[3px] decoration-black opacity-60` : ""
                        }`}>
                          {verdict.verdict}
                        </h2>
                        <span className="font-mono text-xs font-bold uppercase tracking-widest mt-2 block text-zinc-600">
                          {VERDICT_META[verdict.verdict]?.label ?? "↳ UNKNOWN"}
                        </span>
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="font-mono text-xs font-bold uppercase tracking-widest block mb-2 text-zinc-500">Confidence</span>
                        <div className="flex items-baseline gap-0.5 sm:justify-end text-black">
                          <span className="text-4xl sm:text-5xl font-black tabular-nums leading-none">{verdict.confidence}</span>
                          <span className="text-xl font-black">%</span>
                        </div>
                        <div className="mt-2 w-20 h-1 sm:ml-auto overflow-hidden bg-zinc-200">
                          <div className="h-full transition-all duration-1000 ease-out bg-black" style={{ width: `${verdict.confidence}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="font-mono text-xs font-bold uppercase tracking-widest block mb-3 text-zinc-500">Summary Report</span>
                      <p className="font-sans text-base sm:text-lg leading-relaxed font-medium text-zinc-800">
                        {verdict.summary}
                      </p>
                    </div>

                    <div className="pt-5 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-zinc-100">
                      <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                        {VERDICT_META[verdict.verdict]?.sub}
                      </span>
                      <button
                        onClick={() => { setVerdict(null); setInputData(""); setImage(null); setThinkingAgent(null); setTurnCount(0); }}
                        className="font-mono text-xs font-bold uppercase tracking-widest px-5 py-2.5 border-2 transition-all border-black text-black hover:bg-black hover:text-white"
                      >
                        ← New Query
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}