import { CheckCircle } from 'lucide-react';

interface FormSuccessProps {
  message: string | null | undefined;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-none border border-green-600 bg-white px-4 py-3 text-sm text-black"
    >
      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      <span>{message}</span>
    </div>
  );
}
