// Format a UTC/IST ISO timestamp as a human-readable IST string.
// Backend returns ISO strings already shifted to Asia/Kolkata (+05:30).
export const formatIst = (isoString) => {
  if (!isoString) return 'Never';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' IST';
  } catch {
    return isoString;
  }
};
