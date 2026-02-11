import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  variant?: "default" | "boxed";
}

export function Breadcrumbs({ items, className, variant = "default" }: BreadcrumbsProps) {
  if (variant === "boxed") {
    return (
      <nav 
        aria-label="Breadcrumb" 
        className={cn("inline-flex items-center px-4 py-2 text-sm font-bold tracking-wider uppercase bg-white", className)}
      >
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-black/30 font-light">/</span>
            )}
            {item.href && !item.active ? (
              <Link 
                href={item.href}
                className="hover:text-black/60 transition-colors text-black"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-black">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-2 text-[12px] font-bold tracking-wider uppercase text-neutral-400 mb-6", className)}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-3 w-3 mx-2 text-neutral-300 shrink-0" />
          )}
          {item.href && !item.active ? (
            <Link 
              href={item.href}
              className="hover:text-black transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(item.active && "text-black")}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
