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
