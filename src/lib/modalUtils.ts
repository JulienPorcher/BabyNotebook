// Utility function for handling click outside to close modals
export const handleClickOutside = (
  event: React.MouseEvent<HTMLDivElement>,
  onClose: () => void
) => {
  // Only close if clicking on the backdrop (not the modal content)
  if (event.target === event.currentTarget) {
    onClose();
  }
};

// Hook for click outside functionality
export const useClickOutside = (onClose: () => void) => {
  return (event: React.MouseEvent<HTMLDivElement>) => {
    handleClickOutside(event, onClose);
  };
};
