import './globals.css'
import { Inter, Libre_Baskerville } from 'next/font/google' // Added Serif font for luxury feel
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })
// Adding the serif font used in your landing page for the "Luxury" message
const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-libre', // Create a variable to use in Tailwind
})

export const metadata = {
  title: 'BachatBox',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
        </head>
        <body className={`${inter.className} ${libreBaskerville.variable} min-h-screen bg-white text-black`}>
          
          {/* =======================================================
              1. MOBILE BLOCKER (Visible only on small screens)
          ======================================================== */}
          <div className="lg:hidden fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f0fce4] text-[#48837e] p-6 text-center">
            
            {/* Decorative Icon */}
            <div className="mb-8 p-6 rounded-full bg-white/50 border border-[#48837e]/20 shadow-xl backdrop-blur-sm">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="64" height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            </div>

            {/* Luxury Styled Text */}
            <h2 className="font-serif text-3xl font-bold tracking-tight mb-4 text-[#2d726a]">
              Only Available on <br></br>PC & Laptops
            </h2>
            
            <div className="w-16 h-[1px] bg-[#48837e] mb-6 opacity-50"></div>

            <p className="font-serif text-lg opacity-80 leading-relaxed max-w-xs">
              <span className="font-semibold">BachatBox</span> is designed exclusively for PC and Laptop screens.
              
              <br />
              
            </p>

            <p className="mt-8 text-sm font-sans uppercase tracking-widest opacity-60 text-[#2d726a]">
              Please switch devices
            </p>
          </div>

          {/* =======================================================
              2. ACTUAL WEBSITE (Hidden on small screens)
          ======================================================== */}
          <div className="hidden lg:block min-h-screen">
            {children}
          </div>

        </body>
      </html>
    </ClerkProvider>
  )
}