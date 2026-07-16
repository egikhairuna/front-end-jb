import { XCircle } from 'lucide-react';

interface FormErrorProps {
  message: string | null | undefined;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-none border border-red-500 bg-white px-4 py-3 text-sm text-black"
    >
      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
