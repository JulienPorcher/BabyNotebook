// Helper function to round time to nearest 5 minutes
export const getRoundedDateTime = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.round(minutes / 5) * 5;
  now.setMinutes(roundedMinutes, 0, 0);
  return now.toISOString().slice(0, 16); // Format for datetime-local input
};

// Helper function to get current date
export const getCurrentDate = () => {
  return new Date().toISOString().slice(0, 10); // Format for date input
};

// Custom hook for form submission logic
import { useState } from 'react';

interface UseFormSubmissionProps {
  onSubmit: (data: Record<string, any>) => void | Promise<void>; // Change this line
  onClose?: () => void;
}

export function useFormSubmission({ onSubmit, onClose }: UseFormSubmissionProps) {
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Record<string, any>) => {
    setError('');
    setIsSubmitting(true);
    
    try {
      await Promise.resolve(onSubmit(data)); // Wrap in Promise.resolve to handle both sync and async
      onClose?.();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement. Veuillez réessayer.');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    error,
    isSubmitting,
    handleSubmit
  };
}
