export const calculateWorkingDays = (startDateStr: string, endDateStr: string): number => {
  if (!startDateStr || !endDateStr) {
    return 0;
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Set time to noon to avoid timezone issues with date changes
  startDate.setHours(12, 0, 0, 0);
  endDate.setHours(12, 0, 0, 0);

  if (startDate > endDate) {
    return 0;
  }

  let workingDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};

export const calculateWorkDuration = (startDateStr: string): string => {
  if (!startDateStr) return '';

  const startDate = new Date(startDateStr);
  const today = new Date();
  
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (startDate > today || isNaN(startDate.getTime())) {
    return '';
  }

  let years = today.getFullYear() - startDate.getFullYear();
  let months = today.getMonth() - startDate.getMonth();
  let days = today.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    // Get the last day of the previous month
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} tahun`);
  if (months > 0) parts.push(`${months} bulan`);
  if (days > 0) parts.push(`${days} hari`);

  if (parts.length === 0) {
    return "Kurang dari 1 hari";
  }

  return parts.join(', ');
};

/**
 * Memeriksa apakah pegawai sudah berhak mendapatkan cuti tahunan (minimal 1 tahun masa kerja)
 */
export const isEligibleForLeave = (startDateStr: string): boolean => {
  if (!startDateStr) return false;

  const startDate = new Date(startDateStr);
  const today = new Date();
  
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (isNaN(startDate.getTime())) return false;

  let years = today.getFullYear() - startDate.getFullYear();
  let months = today.getMonth() - startDate.getMonth();
  let days = today.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
  }

  if (months < 0) {
    years--;
  }

  return years >= 1;
};
