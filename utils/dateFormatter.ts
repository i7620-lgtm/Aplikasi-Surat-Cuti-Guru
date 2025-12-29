
export const formatDateParts = (dateString: string): { day: string; month: string; year: string; monthYear: string; full: string } => {
  if (!dateString) return { day: '', month: '', year: '', monthYear: '', full: '' };
  const date = new Date(dateString);
  const day = date.toLocaleDateString('id-ID', { day: 'numeric' });
  const month = date.toLocaleDateString('id-ID', { month: 'long' });
  const year = date.toLocaleDateString('id-ID', { year: 'numeric' });
  
  return {
      day,
      month,
      year,
      monthYear: `${month} ${year}`,
      full: `${day} ${month} ${year}`
  };
};

export const formatIndonesianDate = (dateString: string): string => {
  if (!dateString) return '';
  return formatDateParts(dateString).full;
};
