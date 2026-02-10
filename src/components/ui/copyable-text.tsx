'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface CopyableTextProps {
  text: string;
  label?: string; // What is being copied? (e.g. "Amount", "Account Number")
  className?: string;
  children: React.ReactNode; 
}

export function CopyableText({ text, label, className, children }: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
        onClick={handleCopy}
        title={label ? `Copy ${label}` : 'Copy to clipboard'}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
