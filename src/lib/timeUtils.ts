/**
 * Calculates the duration since a given date or datetime
 * @param date - The date or datetime to calculate from
 * @returns Object with days, hours, minutes, and a formatted string
 */
export function calculateDurationSince(date: string | Date | null): {
  days: number;
  hours: number;
  minutes: number;
  totalMinutes: number;
  formatted: string;
} {
  if (!date) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      formatted: 'N/A'
    };
  }

  const now = new Date();
  const targetDate = new Date(date);
  
  // Check if the date is valid
  if (isNaN(targetDate.getTime())) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      formatted: 'Date invalide'
    };
  }

  const diffInMs = now.getTime() - targetDate.getTime();
  const totalMinutes = Math.floor(diffInMs / (1000 * 60));
  
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  // Format the duration string
  let formatted = '';
  
  if (days > 0) {
    formatted += `${days} J`;
    if (hours > 0 || minutes > 0) {
      formatted += ', ';
    }
  }
  
  if (hours > 0) {
    formatted += `${hours} h`;
    if (minutes > 0) {
      formatted += ', ';
    }
  }
  
  if (minutes > 0 || (days === 0 && hours === 0)) {
    formatted += `${minutes} min`;
  }

  // Handle future dates
  if (diffInMs < 0) {
    const futureDays = Math.floor(-diffInMs / (1000 * 60 * 60 * 24));
    const futureHours = Math.floor((-diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const futureMinutes = Math.floor((-diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let futureFormatted = 'Dans ';
    if (futureDays > 0) {
      futureFormatted += `${futureDays} j${futureDays > 1 ? 's' : ''}`;
      if (futureHours > 0 || futureMinutes > 0) {
        futureFormatted += ', ';
      }
    }
    if (futureHours > 0) {
      futureFormatted += `${futureHours} h${futureHours > 1 ? 's' : ''}`;
      if (futureMinutes > 0) {
        futureFormatted += ' et ';
      }
    }
    if (futureMinutes > 0 || (futureDays === 0 && futureHours === 0)) {
      futureFormatted += `${futureMinutes} min${futureMinutes > 1 ? 's' : ''}`;
    }
    
    return {
      days: -futureDays,
      hours: -futureHours,
      minutes: -futureMinutes,
      totalMinutes: -totalMinutes,
      formatted: futureFormatted
    };
  }

  return {
    days,
    hours,
    minutes,
    totalMinutes,
    formatted: formatted || 'À l\'instant'
  };
}

/**
 * Gets a human-readable relative time string (e.g., "il y a 2 heures", "dans 3 jours")
 * @param date - The date or datetime to calculate from
 * @returns Formatted relative time string
 */
export function getRelativeTimeString(date: string | Date | null): string {
  const duration = calculateDurationSince(date);
  
  if (duration.formatted === 'N/A' || duration.formatted === 'Date invalide') {
    return duration.formatted;
  }
  
  if (duration.formatted.startsWith('Dans ')) {
    return duration.formatted;
  }
  
  if (duration.totalMinutes < 1) {
    return 'À l\'instant';
  }
  
  if (duration.totalMinutes < 60) {
    return `${duration.minutes} min${duration.minutes > 1 ? 's' : ''}`;
  }
  
  if (duration.totalMinutes < 1440) { // Less than 24 hours
    return `${duration.formatted}`;
  }
  
  return `${duration.formatted}`;
}

/**
 * Checks if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: string | Date | null): boolean {
  if (!date) return false;
  
  const targetDate = new Date(date);
  const today = new Date();
  
  return targetDate.toDateString() === today.toDateString();
}

/**
 * Checks if a date is yesterday
 * @param date - The date to check
 * @returns True if the date is yesterday
 */
export function isYesterday(date: string | Date | null): boolean {
  if (!date) return false;
  
  const targetDate = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return targetDate.toDateString() === yesterday.toDateString();
}

/**
 * Gets a relative date string showing only days (e.g., "Aujourd'hui", "Hier", "Il y a 3 jours")
 * @param date - The date or datetime to calculate from
 * @returns Formatted relative date string in days only
 */
export function getRelativeDateString(date: string | Date | null): string {
  if (!date) return 'N/A';
  
  const targetDate = new Date(date);
  
  // Check if the date is valid
  if (isNaN(targetDate.getTime())) {
    return 'Date invalide';
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  const diffInMs = today.getTime() - targetDay.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Aujourd\'hui';
  } else if (diffInDays === 1) {
    return 'Hier';
  } else if (diffInDays > 1) {
    return `Il y a ${diffInDays} jours`;
  } else if (diffInDays === -1) {
    return 'Demain';
  } else if (diffInDays < -1) {
    return `Dans ${Math.abs(diffInDays)} jours`;
  }
  
  return 'Aujourd\'hui';
}
