'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 🛡️ Log standardized error metadata (Avoid PII if possible)
    console.error('🚨 Global Application Error:', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex-1 min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 bg-[#FDFCF8]">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10" />
          </div>
          
          <div className="space-y-4 max-w-md">
            <h1 className="text-3xl font-heading font-bold uppercase tracking-tight">
              Something went wrong
            </h1>
            <p className="text-neutral-500 font-light leading-relaxed">
              We encountered an unexpected error while processing your request. Please try refreshing the page or contact support if the issue persists.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => reset()}
              className="bg-black text-white hover:bg-neutral-800 px-8 h-12 flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </Button>
            <Button 
              variant="outline"
              asChild
              className="border-neutral-200 px-8 h-12"
            >
              <Link href="/">Return Home</Link>
            </Button>
          </div>

          <div className="pt-8 text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
            James Boogie Support
          </div>
        </div>
      </body>
    </html>
  );
}
