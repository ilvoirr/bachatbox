"use client";

// -------------------- Type Declarations --------------------
declare global {
  interface Window {
    particlesJS: any;
  }
}

// -------------------- Font and UI Imports --------------------
import { Button } from "@/components/ui/button";
import { Libre_Baskerville } from 'next/font/google';

// Configure Libre Baskerville font
const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

// -------------------- React and Routing --------------------
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link"; // FIX: Import Link for navigation

// -------------------- Clerk Authentication Components --------------------
import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

// ============================================================
//        REDIRECT LOGIC WHEN USER IS SIGNED IN (CLERK)
// ============================================================

function RedirectToApp({ router }: { router: ReturnType<typeof useRouter> }) {
  useEffect(() => {
    router.push("/apppage");
  }, [router]);

  return null;
}

// ============================================================
//                   MAIN HOMEPAGE COMPONENT
// ============================================================

export default function HomePage() {
  const router = useRouter();
  
  const [navbarBg, setNavbarBg] = useState('#f0fce4');

  // Initialize particles.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
      script.onload = () => {
        if(document.getElementById('particles-js')) {
            window.particlesJS.load('particles-js', '/polygon-particles.json', () => {
            console.log('callback - particles.js config loaded');
            });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  // Scroll logic
  useEffect(() => {
    const handleScroll = () => {
      const vh = window.innerHeight;
      const maxScrollLimit = vh * 3.87;
      
      if (window.scrollY > maxScrollLimit) {
        window.scrollTo(0, maxScrollLimit);
        return;
      }
      
      const navbarHeightPx = (6 / 100) * vh;
      const scrollY = window.scrollY;
      const navbarBottom = scrollY + navbarHeightPx;
      
      if (navbarBottom >= vh * 2) {
        setNavbarBg('#ffffff');
      } else if (navbarBottom >= vh * 1) {
        setNavbarBg('#ffffff');
      } else {
        setNavbarBg('#f0fce4');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="overflow-x-hidden">
      <SignedIn>
        <RedirectToApp router={router} />
      </SignedIn>

      <style>
        {`
          @media (min-width: 1300px) and (max-width: 1400px) {
            .only-1366 {
              font-size: 1.6vh;
            }
          }
          .navbar-transition {
            transition: background-color 0.3s ease;
          }
        `}
      </style>

      {/* Navigation header */}
      <div 
        className="navbar-transition fixed top-0 left-0 w-full flex items-center justify-between h-[6vh] text-white px-4 md:px-8 z-50"
        style={{ backgroundColor: navbarBg }}
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-[#48837e] w-[5vh] h-[5vh] md:w-[4.9vh] md:h-[4.9vh]"
          >
            <path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/>
            <path d="M16 10h.01"/>
            <path d="M2 8v1a2 2 0 0 0 2 2h1"/>
          </svg>
          <h1 className="hidden md:inline-flex text-[1.6vw] font-semibold tracking-tight text-[#48837e] ml-3">
            BachatBox
          </h1>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <SignedOut>
            {/* FIX: Use standard Next.js Link to force navigation to your custom page */}
            <Link href="/sign-in">
              <Button className="only-1366 bg-transparent text-[#48837e] hover:text-white hover:bg-[#48837e] md:text-[1.77vh] text-[4vw] px-3 md:px-4">
                Login
              </Button>
            </Link>
            
            {/* FIX: Use standard Next.js Link to force navigation to your custom page */}
            <Link href="/sign-up">
              <Button className="only-1366 bg-white text-[#48837e] hover:bg-[#48837e] hover:text-white md:text-[1.77vh] text-[4vw] px-3 md:px-6">
                Sign Up
              </Button>
            </Link>
          </SignedOut>
          
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* Hero & Images */}
      <div 
        className="w-screen h-screen bg-no-repeat relative"
        style={{ backgroundImage: 'url(/page1.png)', backgroundSize: '100% 100%' }}
      ></div>

      <div className='w-screen h-screen'>
        <img src="/page2.png" alt="Page 2" className="w-full h-full object-fill" />
      </div>
      <div className='w-screen h-screen'>
        <img src="/page3.png" alt="Page 3" className="w-full h-full object-fill" />
      </div>
      <div className='w-screen h-screen'>
        <img src="/page4.png" alt="Page 4" className="w-full h-full object-fill" />
      </div>
      <div className='w-screen h-screen'>
        <img src="/page5.png" alt="Page 5" className="w-full h-full object-fill" />
      </div>
    </div>
  );
}