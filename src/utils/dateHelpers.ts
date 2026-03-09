export const isWithinGracePeriod = (
  startTime: string,
  currentTime: Date,
  gracePeriodMinutes: number = 5
): boolean => {
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const scheduledTime = new Date(currentTime);
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  const graceEndTime = new Date(scheduledTime.getTime() + gracePeriodMinutes * 60000);
  
  return currentTime > graceEndTime;
};

export const formatTime12hr = (time24: string): string => {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const convertTo24hr = (time12: string, period: 'AM' | 'PM'): string => {
  if (!time12) return '';
  
  const [hours, minutes] = time12.split(':').map(Number);
  let hours24 = hours;
  
  if (period === 'PM' && hours !== 12) {
    hours24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hours24 = 0;
  }
  
  return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return time.toLocaleDateString();
};

export const isToday = (dateStr: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

export const getDurationMinutes = (startTime: string, endTime: string): number => {
  const [startHours, startMins] = startTime.split(':').map(Number);
  const [endHours, endMins] = endTime.split(':').map(Number);
  
  const startTotalMins = startHours * 60 + startMins;
  const endTotalMins = endHours * 60 + endMins;
  
  return endTotalMins - startTotalMins;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};