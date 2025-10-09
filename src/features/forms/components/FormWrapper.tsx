import { type ReactNode } from 'react';
import { useClickOutside } from '../../../lib/modalUtils';

interface FormWrapperProps {
  title: string;
  children: ReactNode;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onClose?: () => void;
  error: string;
  isSubmitting: boolean;
  submitButtonText?: string;
  submitButtonColor?: string;
}

export default function FormWrapper({
  title,
  children,
  onSubmit,
  onClose,
  error,
  isSubmitting,
  submitButtonText = 'Enregistrer',
  submitButtonColor = 'bg-pink-500'
}: FormWrapperProps) {
  const handleBackdropClick = useClickOutside(onClose || (() => {}));
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({});
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold text-center">{title}</h2>
        
        <form onSubmit={handleSubmit}>
          {children}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Submit Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 py-2 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ${submitButtonColor} text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? 'Enregistrement...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}