import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PiShoppingBagLight } from "react-icons/pi";

export default function NotFound() {
  return (
    <div className="flex-1 min-h-[80vh] flex items-center justify-center pt-24 pb-12 bg-white px-6">
        <div className="max-w-xl w-full text-center space-y-12">
          {/* Brand/Error Indicator */}
          <div className="space-y-4">
            <h1 className="text-[120px] md:text-[180px] font-bold leading-none tracking-tighter text-neutral-100 select-none">
              404
            </h1>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-black">
                Page Not Found
              </h2>
              <p className="text-neutral-500 font-light text-lg">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
              </p>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-black text-white px-8 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto flex items-center justify-center gap-3 border border-neutral-200 text-black px-8 py-4 text-[10px] font-bold tracking-widest uppercase hover:bg-neutral-50 transition-colors"
            >
              <PiShoppingBagLight className="h-4 w-4" />
              Explore Shop
            </Link>
          </div>

          {/* Additional Links/Help */}
          <div className="pt-8 border-t border-neutral-100">
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-4">
              Need assistance?
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              <Link href="/faq" className="text-xs font-medium hover:underline">FAQ</Link>
              <Link href="/contact-us" className="text-xs font-medium hover:underline">CONTACT US</Link>
              <Link href="/how-to-order" className="text-xs font-medium hover:underline">HOW TO ORDER</Link>
            </div>
          </div>
        </div>
    </div>
  );
}
