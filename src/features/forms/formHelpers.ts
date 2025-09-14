// Helper function to round time to nearest 5 minutes
export const getRoundedDateTime = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.floor(minutes / 5) * 5;
  now.setMinutes(roundedMinutes, 0, 0);
  
  // Format for datetime-local input using local timezone
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${mins}`;
};

// Helper function to get current date
export const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Format for date input using local timezone
};

// Helper function to convert datetime-local value to ISO string for Supabase
export const convertToSupabaseDateTime = (datetimeLocalValue: string) => {
  if (!datetimeLocalValue) return null;
  
  // Create a Date object from the datetime-local value (this will be in local timezone)
  const localDate = new Date(datetimeLocalValue);
  
  // Convert to ISO string for Supabase (this preserves the local time but formats it as ISO)
  return localDate.toISOString();
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
