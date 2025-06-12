export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export const calculateOvertime = (
  entrada1: string,
  saida1: string,
  entrada2: string,
  saida2: string,
  holiday: boolean,
  ignored: boolean = false,
  toleranceEnabled: boolean = false
): { overtimeMinutes: number } => {
  if (ignored) return { overtimeMinutes: 0 };
  
  const period1 = timeToMinutes(saida1) - timeToMinutes(entrada1);
  const period2 = timeToMinutes(saida2) - timeToMinutes(entrada2);
  const totalMinutes = period1 + period2;
  if (holiday) return { overtimeMinutes: totalMinutes };
  const standardMinutes = 8 * 60;
  const overtimeMinutes = totalMinutes - standardMinutes;
  
  if (toleranceEnabled && Math.abs(overtimeMinutes) < 10) {
    return { overtimeMinutes: 0 };
  }
  
  return { overtimeMinutes };
};

export const formatMinutesToHHMM = (mins: number): string => {
  const sign = mins < 0 ? "-" : "";
  const absMins = Math.abs(mins);
  const hours = Math.floor(absMins / 60);
  const minutes = absMins % 60;
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const getYearMonth = (dateStr: string): string => {
  if (!dateStr) return "";
  return dateStr.substring(0, 7);
};

export const formatYearMonth = (yearMonth: string): string => {
  if (!yearMonth) return "";
  const [year, month] = yearMonth.split("-");
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${monthNames[parseInt(month) - 1]} de ${year}`;
};