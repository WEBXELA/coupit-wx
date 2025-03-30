import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white text-[#2B2C30] px-4 py-3 rounded-lg shadow-lg animate-slide-up">
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-[#F1EFE8]" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}