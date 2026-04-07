"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { Libre_Baskerville } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// --- Constants ---
const AGENT_STATUS: Record<string, string> = {
  INTEL_CRAWLER:   "thinking",
  DEVILS_ADVOCATE: "thinking",
  VERDICT_ENGINE:  "deliberating",
};

const VERDICT_META: Record<string, { label: string; sub: string }> = {
  SUPPORTED: { label: "CLAIM VERIFIED",             sub: "Evidence conclusively corroborates the assertion."      },
  REFUTED:   { label: "CLAIM REFUTED",              sub: "Evidence conclusively contradicts the assertion."       },
  ERROR:     { label: "PROCESS TERMINATED",         sub: "System encountered a critical fault during execution."  },
  UNCERTAIN: { label: "INSUFFICIENT DATA",          sub: "Claim could not be conclusively verified or refuted."   },
};

// --- Custom Minimalist Architecture SVGs (Sidebar only) ---
const MinimalSVG = ({ children, className }: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter" className={cn("shrink-0 flex-none block", className)} style={{ minWidth: 18, minHeight: 18, maxWidth: 18, maxHeight: 18 }}>
    {children}
  </svg>
);
const SysLedger = ({ c }: any) => <MinimalSVG className={c}><rect x="4" y="4" width="16" height="16" /><line x1="4" y1="10" x2="20" y2="10" /></MinimalSVG>;
const SysChart  = ({ c }: any) => <MinimalSVG className={c}><line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/></MinimalSVG>;
const SysAI     = ({ c }: any) => <MinimalSVG className={c}><polygon points="12 2 22 12 12 22 2 12 12 2"/></MinimalSVG>;
const SysBot    = ({ c }: any) => <MinimalSVG className={c}><polyline points="4 7 10 12 4 17"/><line x1="12" y1="19" x2="20" y2="19"/></MinimalSVG>;
const SysSim    = ({ c }: any) => <MinimalSVG className={c}><circle cx="12" cy="12" r="6"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></MinimalSVG>;
const SysSplit  = ({ c }: any) => <MinimalSVG className={c}><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></MinimalSVG>;
const SysReads  = ({ c }: any) => <MinimalSVG className={c}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></MinimalSVG>;
const SysStock  = ({ c }: any) => <MinimalSVG className={c}><polyline points="22 6 12 16 8 12 2 18"/><polyline points="16 6 22 6 22 12"/></MinimalSVG>;
const SysRadar  = ({ c }: any) => <MinimalSVG className={c}><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="2"/></MinimalSVG>;

// --- Logos ---
const LogoText = ({ isDark }: { isDark: boolean }) => (
  <div className="relative z-20 flex items-center overflow-hidden">
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${libreBaskerville.className} text-[1.1rem] tracking-tight whitespace-nowrap transition-colors duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
      Bachat<span className={`italic transition-colors duration-500 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>Box.</span>
    </motion.span>
  </div>
);

const LogoTextIcon = ({ isDark }: { isDark: boolean }) => (
  <div className="relative z-20 w-full flex items-center justify-center -ml-0.5">
    <span className={`${libreBaskerville.className} text-[1.1rem] transition-colors duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
      B<span className={`italic transition-colors duration-500 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>.</span>
    </span>
  </div>
);

export default function ClaimRadarPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Claim Radar States
  const [inputData, setInputData] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [thinkingAgent, setThinkingAgent] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [verdict, setVerdict] = useState<{
    verdict: string; confidence: number; summary: string;
  } | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll logic strictly tied to streaming
  useEffect(() => {
    if (isProcessing) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamText, thinkingAgent, isProcessing]);

  // Backend Logic intact
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

      const reader = response.body.getReader();
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
                
                // Controlled Token Generation Speed
                const chunkSize = 3; 
                for (let i = 0; i < data.content.length; i += chunkSize) {
                  setStreamText((prev) => prev + data.content.slice(i, i + chunkSize));
                  await new Promise((r) => setTimeout(r, 10)); // 10ms per chunk for smooth typing feel
                }

              } else if (data.type === "agent_thinking") {
                if (data.agent) setTurnCount((p) => p + 1);
                
                // Randomized 1-3 second breaks between agents
                const delay = Math.floor(Math.random() * 2000) + 1000;
                await new Promise((r) => setTimeout(r, delay));
                
                setThinkingAgent(data.agent || null);
              } else if (data.type === "final") {
                // Slight dramatic pause before rendering final verdict
                await new Promise((r) => setTimeout(r, 1200));
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

  // --- Dynamic Theme Classes ---
  const tBg = isDark ? "bg-[#020805]" : "bg-[#F7F6F2]";
  const tTextMain = isDark ? "text-neutral-200" : "text-neutral-900";
  const tTextSub = isDark ? "text-neutral-500" : "text-neutral-500";
  const tBorder = isDark ? "border-white/[0.05]" : "border-black/[0.08]";
  const tAccentBorder = isDark ? "border-emerald-500/30" : "border-emerald-800/20";
  const tSelection = isDark ? "selection:bg-emerald-300 selection:text-emerald-950" : "selection:bg-emerald-800 selection:text-[#F7F6F2]";

  const getIconClass = () => `transition-colors duration-300 ${isDark ? 'text-neutral-500 group-hover:text-emerald-400' : 'text-neutral-500 group-hover:text-emerald-800'}`;
  
  const IconGuard = ({ children }: { children: React.ReactNode }) => (
    <div className="w-[18px] h-[18px] min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] flex items-center justify-center shrink-0 flex-none overflow-visible">
      {children}
    </div>
  );

  const links = [
    { label: "Balance Sheet", href: "/apppage", icon: <IconGuard><SysLedger c={getIconClass()} /></IconGuard>, onClick: () => router.push('/apppage') },
    { label: "Visualise Stats", href: "/visualise", icon: <IconGuard><SysChart c={getIconClass()} /></IconGuard>, onClick: () => router.push('/visualise') },
    { label: "AI Dashboard", href: "/advice", icon: <IconGuard><SysAI c={getIconClass()} /></IconGuard>, onClick: () => router.push('/advice') },
    { label: "BudgetBot", href: "/chatbot", icon: <IconGuard><SysBot c={getIconClass()} /></IconGuard>, onClick: () => router.push('/chatbot') },
    { label: "What-If Simulator", href: "/simulator", icon: <IconGuard><SysSim c={getIconClass()} /></IconGuard>, onClick: () => router.push('/simulator') },
    { label: "SplitWise", href: "/splitwise", icon: <IconGuard><SysSplit c={getIconClass()} /></IconGuard>, onClick: () => router.push('/splitwise') },
    { label: "Financial Reads", href: "/financial-reads", icon: <IconGuard><SysReads c={getIconClass()} /></IconGuard>, onClick: () => router.push('/financial-reads') },
    { label: "Stock Market", href: "/investment", icon: <IconGuard><SysStock c={getIconClass()} /></IconGuard>, onClick: () => router.push('/investment') },
    { label: "Claim Radar", href: "/claimradar", icon: <IconGuard><SysRadar c={getIconClass()} /></IconGuard>, onClick: () => router.push('/claimradar') },
  ];

  // Dynamic Terminal Styling
  const renderDialogue = () => {
    const blocks = streamText.split("\n\n").filter((b) => b.trim());
    
    return blocks.map((block, idx) => {
      // System Messages (Restored left-aligned, program-start feel)
      if (block.startsWith("◦") || block.startsWith("[SYSTEM]")) {
        return (
          <div key={idx} className="mb-6 flex items-center gap-3 animate-in fade-in duration-300">
            <div className={`w-1.5 h-1.5 shrink-0 ${isDark ? 'bg-neutral-600' : 'bg-neutral-400'}`} />
            <span className={`font-mono text-[10px] uppercase tracking-widest opacity-60 ${tTextMain}`}>
              {block.replace(/^◦+\s*/, "").replace("[SYSTEM]: ", "")}
            </span>
          </div>
        );
      }

      // Agent Match Logic
      const agentMatch = block.match(/^(\[[A-Z_]+\]:?)\s*([\s\S]*)/i);
      if (agentMatch) {
        const tag = agentMatch[1].replace(/[\[\]:]/g, "");
        const content = agentMatch[2];

        if (tag === 'INTEL_CRAWLER') {
          return (
            <div key={idx} className="flex w-full mb-12 justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className={`w-[90%] md:w-[75%] border-l-[6px] border-y border-r p-6 md:p-10 text-left ${
                isDark ? 'bg-cyan-950/20 border-cyan-500/30 border-l-cyan-400' : 'bg-cyan-50 border-cyan-700/30 border-l-cyan-600'
              }`}>
                <div className={`font-mono text-xs md:text-sm uppercase tracking-[0.2em] mb-6 font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                  [INTEL CRAWLER]
                </div>
                <div className={`${libreBaskerville.className} text-sm md:text-base leading-relaxed ${tTextMain}`}>
                  {content}
                </div>
              </div>
            </div>
          );
        } else if (tag === 'DEVILS_ADVOCATE') {
          return (
            <div key={idx} className="flex w-full mb-12 justify-end animate-in fade-in slide-in-from-bottom-2">
              <div className={`w-[90%] md:w-[75%] border-r-[6px] border-y border-l p-6 md:p-10 text-left ${
                isDark ? 'bg-rose-950/20 border-rose-500/30 border-r-rose-400' : 'bg-rose-50 border-rose-700/30 border-r-rose-600'
              }`}>
                <div className={`font-mono text-xs md:text-sm uppercase tracking-[0.2em] mb-6 font-bold ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                  [DEVIL'S ADVOCATE]
                </div>
                <div className={`${libreBaskerville.className} text-sm md:text-base leading-relaxed ${tTextMain}`}>
                  {content}
                </div>
              </div>
            </div>
          );
        } else if (tag === 'VERDICT_ENGINE') {
          // Sleek, left-to-right Judge layout matching the agents
          return (
            <div key={idx} className="flex w-full mb-12 justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className={`w-full border-l-[6px] border-y border-r p-6 md:p-10 shadow-lg text-left ${
                isDark ? 'bg-[#0a0a0a] border-[#222] border-l-emerald-500 shadow-black' : 'bg-white border-neutral-200 border-l-emerald-600 shadow-neutral-200'
              }`}>
                <div className={`font-mono text-xs md:text-sm uppercase tracking-[0.2em] mb-6 font-bold flex items-center gap-2 ${isDark ? 'text-emerald-500' : 'text-emerald-700'}`}>
                  <SysAI c="w-4 h-4" />
                  [VERDICT ENGINE] // FINAL JUDGEMENT
                </div>
                <div className={`${libreBaskerville.className} text-sm md:text-base leading-relaxed ${tTextMain}`}>
                  {content}
                </div>
              </div>
            </div>
          );
        }
      }

      // Fallback Raw Output
      return (
        <div key={idx} className={`mb-8 p-6 border font-mono text-[11px] leading-relaxed whitespace-pre-wrap ${tBorder} ${tTextSub}`}>
          {block}
        </div>
      );
    });
  };

  const isDisabled = !inputData.trim() && !image;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .edge-scroll {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? 'rgba(52,211,153,0.3) transparent' : 'rgba(6,95,70,0.3) transparent'};
        }
        .edge-scroll::-webkit-scrollbar { width: 6px; }
        .edge-scroll::-webkit-scrollbar-track { background: transparent; }
        .edge-scroll::-webkit-scrollbar-thumb { background-color: ${isDark ? 'rgba(52,211,153,0.3)' : 'rgba(6,95,70,0.3)'}; }
      `}} />

      <SignedIn>
        <div className={`min-h-screen md:h-screen md:overflow-hidden transition-colors duration-500 ${tBg} ${tTextMain} ${tSelection} font-sans relative flex`}>
          
          <div 
            className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-[0.03] mix-blend-screen' : 'opacity-[0.04] mix-blend-multiply'}`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
          />

          <div className={`fixed top-0 left-0 h-screen z-40 border-r transition-colors duration-500 ${tBorder}`}
               onMouseEnter={() => setSidebarOpen(true)}
               onMouseLeave={() => setSidebarOpen(false)}>
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
              <SidebarBody className={`justify-between gap-8 h-full border-r transition-colors duration-500 py-6 px-4 ${isDark ? 'bg-[#020805]/95 border-white/[0.05]' : 'bg-[#F7F6F2]/95 border-black/[0.05]'} backdrop-blur-xl`}>
                <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                  <div className="h-12 flex items-center shrink-0 w-full mb-8 cursor-pointer pl-1">
                    {sidebarOpen ? <LogoText isDark={isDark} /> : <LogoTextIcon isDark={isDark} />}
                  </div>
                  <div className="flex flex-col gap-4 pl-1">
                    {links.map((link, idx) => (
                      <div key={idx} onClick={link.onClick} className="cursor-pointer group flex items-center">
                        <SidebarLink 
                           link={link} 
                           className={`transition-colors font-mono text-[10px] tracking-[0.15em] uppercase ${isDark ? 'text-neutral-400 group-hover:text-emerald-300' : 'text-neutral-500 group-hover:text-emerald-800'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-2 pl-1">
                  <SidebarLink
                    link={{
                      label: user?.username || 'User',
                      href: "#",
                      icon: (
                        <div className="w-[18px] h-[18px] min-w-[18px] min-h-[18px] flex items-center justify-center shrink-0 flex-none">
                           <div className={`h-[22px] w-[22px] shrink-0 border flex items-center justify-center text-[9px] font-mono uppercase transition-colors duration-500 ${isDark ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400' : 'border-emerald-800/30 bg-emerald-800/10 text-emerald-800'}`}>
                             {(user?.username?.[0] || user?.firstName?.[0] || 'U').toUpperCase()}
                           </div>
                        </div>
                      ),
                    }}
                    className={isDark ? "text-neutral-400 font-mono text-[10px] tracking-widest uppercase" : "text-neutral-600 font-mono text-[10px] tracking-widest uppercase"}
                  />
                </div>
              </SidebarBody>
            </Sidebar>
          </div>

          <div className={cn(
            "transition-all duration-300 ease-in-out flex-1 flex flex-col relative z-10 h-full w-full",
            sidebarOpen ? "ml-64" : "ml-16"
          )}>
            
            <header className={`shrink-0 flex items-center justify-between h-20 px-8 md:px-12 backdrop-blur-md border-b transition-colors duration-500 ${isDark ? 'bg-[#020805]/80 border-white/[0.03]' : 'bg-[#F7F6F2]/80 border-black/[0.05]'}`}>
              <div className={`ml-4 flex items-center gap-2 text-[12px] font-mono tracking-widest uppercase transition-colors duration-500 ${isDark ? 'text-emerald-500/70' : 'text-emerald-800/70'}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDark ? 'bg-emerald-500' : 'bg-emerald-700'}`}></span>
                </span>
                VERIFICATION TERMINAL
              </div>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className="relative group w-6 h-6 flex items-center justify-center focus:outline-none"
                  aria-label="Toggle Theme"
                >
                  <div className={`w-2 h-2 transition-all duration-500 rounded-full ${isDark ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-transparent border-[1.5px] border-emerald-800 scale-[1.2]'}`} />
                  <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isDark ? 'bg-emerald-400/0 group-hover:bg-emerald-400/10' : 'bg-emerald-800/0 group-hover:bg-emerald-800/5'}`} />
                </button>

                <div
                  className={`group relative cursor-pointer inline-flex items-center gap-3 border px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${tAccentBorder} ${isDark ? 'bg-emerald-950/20 hover:bg-emerald-900/20 text-emerald-300' : 'bg-emerald-800/5 hover:bg-emerald-800/10 text-emerald-800'}`}
                  onClick={() => triggerRef.current?.querySelector('button')?.click()}
                >
                  <span>{user?.username || 'User'}</span>
                  <div ref={triggerRef} className="relative opacity-80 mix-blend-luminosity scale-90">
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonPopoverCard: { transform: 'translateY(1.5rem)' } } }} />
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 flex flex-col min-h-0 w-full relative">
              
              <AnimatePresence mode="wait">
                {/* INITIAL INPUT PHASE */}
                {!isProcessing && !verdict && (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="absolute inset-0 flex flex-col justify-center items-center p-6 md:p-12 overflow-y-auto edge-scroll">
                    
                    <div className={`w-full max-w-5xl border flex flex-col ${isDark ? 'border-white/20 bg-white/[0.01]' : 'border-black/20 bg-black/[0.01]'}`}>
                      
                      <div className={`border-b p-4 md:px-8 flex justify-between items-center ${isDark ? 'border-white/20' : 'border-black/20'}`}>
                        <span className={`text-xs font-mono uppercase tracking-[0.4em] ${tTextSub}`}>
                          01 // DOSSIER ENTRY
                        </span>
                        <span className={`text-[10px] font-mono uppercase tracking-widest opacity-50 ${tTextMain}`}>
                          AWAITING INPUT
                        </span>
                      </div>

                      <div className="p-6 md:p-12 flex flex-col">
                        <textarea
                          className={`w-full min-h-[30vh] bg-transparent border-0 text-2xl md:text-4xl ${libreBaskerville.className} focus:outline-none resize-none transition-colors duration-500 ${tTextMain} placeholder:opacity-30`}
                          placeholder="Assert a financial claim to commence verification..."
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
                      </div>

                      <div className={`border-t p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 ${isDark ? 'border-white/20 bg-black/20' : 'border-black/20 bg-black/5'}`}>
                        <div className="flex items-center gap-6 w-full md:w-auto">
                          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors shrink-0 ${isDark ? 'text-neutral-400 hover:text-emerald-400' : 'text-neutral-600 hover:text-emerald-800'}`}
                          >
                            [+] {image ? "REPLACE VISUAL DATA" : "ATTACH VISUAL DATA"}
                          </button>
                          
                          {image && (
                            <div className={`flex items-center gap-4 pl-6 border-l h-12 w-full max-w-[200px] ${tBorder}`}>
                              <div className="h-full flex-1 relative flex items-center justify-center p-1 bg-black/10 dark:bg-white/10">
                                <img src={image} alt="Evidence" className={`max-w-full max-h-full object-contain ${isDark ? 'grayscale opacity-80' : 'sepia-[0.2]'}`} />
                              </div>
                              <button onClick={() => setImage(null)} className={`font-mono text-[9px] uppercase tracking-widest shrink-0 ${isDark ? 'text-rose-500/70 hover:text-rose-400' : 'text-rose-700/70 hover:text-rose-600'}`}>
                                [X]
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={executeAnalysis}
                          disabled={isDisabled}
                          className={`px-10 h-12 text-[11px] font-mono uppercase tracking-[0.2em] font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed border shrink-0 ${
                            isDark 
                              ? 'bg-emerald-500 text-[#020805] hover:bg-emerald-400 border-emerald-400' 
                              : 'bg-emerald-800 text-[#F7F6F2] hover:bg-emerald-700 border-emerald-900'
                          }`}
                        >
                          COMMENCE DEBATE //
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* PROCESSING PHASE */}
                {isProcessing && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col">
                    
                    <div className="flex-1 w-full overflow-y-auto edge-scroll pl-6 pr-4 md:pl-16 md:pr-12 pt-12 pb-32">
                      <div className="max-w-5xl mx-auto">
                        
                        <div className="mb-16 border-b pb-4 flex justify-between items-end border-current" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                          <span className={`text-[10px] font-mono uppercase tracking-[0.4em] ${tTextSub}`}>
                            02 // LIVE DELIBERATION
                          </span>
                          <span className={`text-[9px] font-mono uppercase tracking-[0.2em] opacity-50 ${tTextMain}`}>
                            PHASE {Math.min(turnCount, 5)}/5
                          </span>
                        </div>

                        {renderDialogue()}

                        {/* Aligned token generation indicator */}
                        {thinkingAgent && (
                          <div className={`flex w-full mt-4 mb-8 animate-in fade-in ${thinkingAgent === 'INTEL_CRAWLER' || thinkingAgent === 'VERDICT_ENGINE' ? 'justify-start' : 'justify-end'}`}>
                             <div className={`font-mono text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 ${
                               thinkingAgent === 'INTEL_CRAWLER' ? (isDark ? 'text-cyan-500' : 'text-cyan-700') :
                               thinkingAgent === 'DEVILS_ADVOCATE' ? (isDark ? 'text-rose-500' : 'text-rose-700') :
                               (isDark ? 'text-emerald-500' : 'text-emerald-700')
                             }`}>
                               <span className="font-bold">[{thinkingAgent.replace(/_/g, " ")}]</span>
                               <span className="opacity-70 lowercase">{AGENT_STATUS[thinkingAgent]}...</span>
                               <span className="animate-pulse opacity-80">█</span>
                             </div>
                          </div>
                        )}
                        <div ref={terminalEndRef} className="h-4" />
                      </div>
                    </div>
                    
                    <div className={`absolute bottom-0 left-0 right-0 h-24 pointer-events-none transition-colors duration-500 bg-gradient-to-t ${isDark ? 'from-[#020805]' : 'from-[#F7F6F2]'} to-transparent`} />
                  </motion.div>
                )}

                {/* VERDICT PHASE */}
                {verdict && !isProcessing && (
                  <motion.div key="verdict" initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }} animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="absolute inset-0 flex flex-col justify-center items-center px-6 md:px-12 py-12 overflow-hidden">
                    
                    <div className={`w-full max-w-5xl h-full flex flex-col border shadow-2xl ${isDark ? 'bg-[#050a08] border-emerald-900/30' : 'bg-white border-emerald-100'}`}>
                      
                      {/* Grid Top Row: Verdict Banner */}
                      <div className={`shrink-0 border-b p-8 md:p-12 ${isDark ? 'border-emerald-900/30' : 'border-emerald-100'}`}>
                        <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.4em] block mb-6 ${tTextSub}`}>
                          FINAL RESOLUTION
                        </span>
                        <h1 className={`${libreBaskerville.className} text-6xl md:text-8xl lg:text-[7rem] tracking-tighter leading-none ${
                          verdict.verdict === 'SUPPORTED' ? (isDark ? 'text-emerald-400' : 'text-emerald-700') :
                          verdict.verdict === 'REFUTED' ? (isDark ? 'text-rose-500' : 'text-rose-700') :
                          tTextMain
                        }`}>
                          {verdict.verdict}.
                        </h1>
                      </div>

                      {/* Grid Bottom Row: Synthesis & Confidence */}
                      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
                        
                        <div className={`flex-1 flex flex-col p-8 md:p-12 border-b md:border-b-0 md:border-r ${isDark ? 'border-emerald-900/30' : 'border-emerald-100'}`}>
                          <div className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] mb-6 ${tTextSub}`}>
                            SYNTHESIS LOG
                          </div>
                          <div className={`flex-1 overflow-y-auto edge-scroll pr-4 ${libreBaskerville.className} text-lg md:text-xl leading-relaxed whitespace-pre-wrap ${tTextMain}`}>
                            {verdict.summary}
                          </div>
                        </div>

                        <div className={`w-full md:w-80 shrink-0 flex flex-col justify-between p-8 md:p-12 ${isDark ? 'bg-emerald-950/10' : 'bg-emerald-50/50'}`}>
                          
                          <div>
                            <div className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-4 ${tTextSub}`}>CONFIDENCE METRIC</div>
                            <div className={`flex items-baseline gap-1 mb-8 ${tTextMain}`}>
                              <span className={`${libreBaskerville.className} text-6xl md:text-7xl tracking-tighter leading-none`}>
                                {verdict.confidence}
                              </span>
                              <span className="font-mono text-xl opacity-40">%</span>
                            </div>

                            <h3 className={`font-mono text-[11px] uppercase tracking-[0.2em] font-bold mb-3 ${tTextMain}`}>
                              {VERDICT_META[verdict.verdict]?.label ?? "SYSTEM OUTPUT"}
                            </h3>
                            <p className={`font-mono text-[10px] uppercase tracking-widest leading-relaxed opacity-60 ${tTextMain}`}>
                              {VERDICT_META[verdict.verdict]?.sub}
                            </p>
                          </div>

                          <button
                            onClick={() => { setVerdict(null); setInputData(""); setImage(null); setThinkingAgent(null); setTurnCount(0); }}
                            className={`w-full mt-12 py-5 text-[10px] font-mono uppercase tracking-[0.2em] font-bold transition-all border ${
                              isDark 
                                ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/40' 
                                : 'border-emerald-800/50 text-emerald-800 hover:bg-emerald-800/10'
                            }`}
                          >
                            // RESTART
                          </button>

                        </div>

                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </main>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}