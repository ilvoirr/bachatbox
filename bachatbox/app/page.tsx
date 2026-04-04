"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Libre_Baskerville } from "next/font/google";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { IconArrowRight, IconSparkles, IconTerminal2 } from "@tabler/icons-react";

// --- Fonts ---
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// --- Redirect Logic ---
function RedirectToApp({ router }: { router: ReturnType<typeof useRouter> }) {
  useEffect(() => {
    router.push("/apppage");
  }, [router]);
  return null;
}

export default function HomePage() {
  const router = useRouter();

  // --- Fluid Mouse Tracking for Aura ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth out the mouse movement for the background aura
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Subtle 3D tilt for the central typography
  const rotateX = useTransform(springY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Values from -0.5 to 0.5
    const xPct = clientX / innerWidth - 0.5;
    const yPct = clientY / innerHeight - 0.5;
    
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  return (
    <>
      {/* --- STANDARD REACT STYLE INJECTION --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          overflow: hidden;
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          overscroll-behavior: none;
        }
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />

      <div 
        onMouseMove={handleMouseMove}
        className="fixed inset-0 h-[100dvh] w-screen bg-[#020805] text-[#e0e0e0] overflow-hidden flex flex-col justify-between selection:bg-emerald-300 selection:text-emerald-950 font-sans"
      >
        <SignedIn>
          <RedirectToApp router={router} />
        </SignedIn>

        {/* --- LUXURY NOISE OVERLAY --- */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-screen"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* --- DYNAMIC MINT AURA --- */}
        <motion.div 
          style={{ 
            x: useTransform(springX, [-0.5, 0.5], ["-20%", "20%"]),
            y: useTransform(springY, [-0.5, 0.5], ["-20%", "20%"])
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none z-0"
        />

        {/* --- TOP HEADER --- */}
        <header className="relative z-20 w-full px-8 py-6 md:px-12 md:py-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {/* Minimalist Geometry Logo */}
            <div className="w-6 h-6 border-[1.5px] border-emerald-400 rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              <div className="w-2 h-2 bg-emerald-300" />
            </div>
            <span className="text-white text-xs tracking-[0.2em] font-medium uppercase mt-0.5">
              BachatBox
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-500/70 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Active
          </div>
        </header>

        {/* --- CENTER TYPOGRAPHY & HERO --- */}
        <main className="relative z-10 flex-1 min-h-0 flex items-center justify-center perspective-1000">
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="flex flex-col items-center justify-center text-center w-full px-6"
          >
            {/* Super subtle over-title */}
            <p className="text-emerald-400/60 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase mb-6 transform translate-z-10">
              Intelligent Wealth Architecture
            </p>

            <h1 className={`text-[12vw] md:text-[8vw] leading-[0.9] font-normal text-white tracking-tighter mix-blend-plus-lighter transform translate-z-30 ${libreBaskerville.className}`}>
              Refine Your
              <br />
              <span className="italic text-emerald-300 pr-4">Capital.</span>
            </h1>

            <p className="mt-8 text-neutral-400 font-light text-sm md:text-base max-w-md leading-relaxed transform translate-z-20">
              A minimalist, high-fidelity environment designed to optimize and monitor your financial trajectory without the noise.
            </p>
          </motion.div>
        </main>

        {/* --- BOTTOM CONTROLS --- */}
        <footer className="relative z-20 w-full px-8 py-8 md:px-12 flex flex-col md:flex-row items-center md:items-end justify-between shrink-0 gap-8">
          
          {/* Decorative left element */}
          <div className="hidden md:flex flex-col gap-1 text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
            <span>Security Level: Tier 1</span>
            <span>Encryption: AES-256</span>
          </div>

          {/* Auth Buttons: Stacked Command Block */}
          <SignedOut>
            <div className="flex flex-col gap-3 w-full md:w-auto md:items-end">
              
              {/* Primary: Get Started */}
              <SignUpButton mode="modal" forceRedirectUrl="/apppage">
                <button className="group relative w-full sm:w-80 h-12 overflow-hidden bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium uppercase tracking-[0.15em] flex items-center justify-between px-6 transition-all hover:bg-emerald-900/50 hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] backdrop-blur-md">
                  <span>Get Started</span>
                  <IconArrowRight size={16} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                  
                  {/* Sweep gradient effect on hover */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent group-hover:animate-[sweep_1s_ease-in-out_infinite]" />
                </button>
              </SignUpButton>

              {/* Secondary: Sign In (With Demo Reveal) */}
              <SignInButton mode="modal" forceRedirectUrl="/apppage">
                <button className="group relative w-full sm:w-80 h-12 overflow-hidden border border-transparent hover:border-emerald-500/20 text-xs font-medium uppercase transition-all bg-transparent backdrop-blur-sm">
                  
                  {/* Normal State */}
                  <div className="absolute inset-0 flex items-center justify-between px-6 transition-transform duration-300 ease-in-out group-hover:-translate-y-full text-neutral-400 group-hover:text-white tracking-[0.15em]">
                    <span>Existing User</span>
                    <span>[ Sign In ]</span>
                  </div>

                  {/* Hover State (Demo Credentials) */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-6 translate-y-full transition-transform duration-300 ease-in-out group-hover:translate-y-0 bg-emerald-950/20 text-emerald-400 font-mono tracking-wider">
                    <span className="flex items-center gap-2"><IconTerminal2 size={14}/> ID: test</span>
                    <span className="text-[10px] sm:text-xs">PW: touchgrassfast</span>
                  </div>

                </button>
              </SignInButton>

            </div>
          </SignedOut>
        </footer>
        
        {/* --- ARCHITECTURAL GRID LINES --- */}
        <div className="absolute top-0 left-8 md:left-12 h-full w-[1px] bg-white/[0.03] pointer-events-none" />
        <div className="absolute top-0 right-8 md:right-12 h-full w-[1px] bg-white/[0.03] pointer-events-none" />
        <div className="absolute bottom-24 left-0 w-full h-[1px] bg-white/[0.03] pointer-events-none" />
      </div>
    </>
  );
}