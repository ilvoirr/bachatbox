"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fce4] p-4">
      
      {/* FIX: This style block forces the Google button text color 
          It overrides any variables Clerk is trying to use. */}
      <style jsx global>{`
        .cl-socialButtonsBlockButtonText {
          color: #48837e !important;
        }
      `}</style>

      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Demo Credentials Card */}
        <div className="w-full bg-white border border-[#48837e] rounded-lg p-4 shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-[#48837e] mb-3 text-center">
            Demo Credentials
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between items-center bg-[#f9fafb] px-3 py-2 rounded-md">
              <span className="text-gray-600 font-medium">Username</span>
              <span className="font-mono text-gray-900">test</span>
            </div>
            <div className="flex justify-between items-center bg-[#f9fafb] px-3 py-2 rounded-md">
              <span className="text-gray-600 font-medium">Password</span>
              <span className="font-mono text-gray-900">test123</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Use these to quickly sign in
          </p>
        </div>

        {/* Clerk Sign-In */}
        <SignIn
          forceRedirectUrl="/apppage"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white/95 border border-[#48837e] rounded-lg shadow-lg backdrop-blur-sm",
              headerTitle: "text-[#48837e] font-bold text-xl",
              headerSubtitle: "text-gray-600",
              formFieldLabel: "text-gray-700",
              
              formButtonPrimary:
                "bg-[#48837e] text-white font-semibold rounded-lg shadow-md hover:bg-[#2d726a] transition-colors",
              
              footerActionText: "text-gray-500",
              footerActionLink: "text-[#48837e]/90 hover:text-[#48837e]",
              
              formFieldInput:
                "bg-[#f0fce4] border-gray-300 text-gray-900 focus:ring-[#48837e]/50 focus:border-[#48837e]",
              
              socialButtonsBlockButton:
                "bg-white border border-gray-300 hover:bg-gray-50",
              
              dividerText: "text-gray-500",
              dividerLine: "bg-gray-300",
            },
            variables: {
              colorPrimary: "#48837e",
              colorText: "#2d726a",
              colorInputBackground: "#f0fce4",
              // This variable was the culprit, but the global style above now ignores it for the button text
              colorNeutral: "#e7f9f3", 
              colorBackground: "#ffffff",
              colorTextSecondary: "#6b7280",
              borderRadius: "0.75rem",
            },
          }}
          path="/sign-in"
          routing="path"
        />
      </div>
    </div>
  );
}