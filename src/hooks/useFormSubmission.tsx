import { useState } from 'react';

interface UseFormSubmissionProps {
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onClose?: () => void;
}

export function useFormSubmission({ onSubmit, onClose }: UseFormSubmissionProps) {
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Record<string, any>) => {
    setError('');
    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
      onClose?.(); // Close form on success
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